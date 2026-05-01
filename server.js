// CreatorHQ — Rate Card Generator
// Express. JSON-per-creator. PDF generation is client-side via html2pdf.js.

import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { authenticate, signSession, AUTH_COOKIE_OPTS } from './lib/auth.mjs';
import { sendOTP, isValidPhone } from './lib/whatsapp.mjs';
import { renderCardHTML, renderRateCardHTML, renderFormHTML, renderLandingHTML, renderCalculatorHTML, renderNotFoundHTML } from './templates/render.js';
import { calculateRate, calculateOverall } from './scripts/calculator.js';
import { supabaseAdmin } from './lib/supabase.mjs';
import { uploadCreatorPhoto } from './lib/photoStorage.mjs';
import { readFileSync, existsSync, writeFileSync, readdirSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, 'public');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(authenticate);
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple config endpoint for client-side Supabase init
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_PUBLISHABLE_KEY
  });
});

// Health check — Railway (and any host) hits this to confirm the app is up.
// Keep it cheap: no data layer, no puppeteer.
app.get('/healthz', (_req, res) => {
  res.type('text/plain').send('ok');
});

// Multer for photo uploads — memory storage so we can pipe the buffer straight to Supabase
// Storage rather than round-tripping through the local filesystem. Cover slot is still
// 365x1123 and the template forces aspect via object-fit; we keep the spec in JSON.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

// -------- Data layer --------
// Backed by Supabase as of 2026-04-17 (Platform-v3 Step 3). Schema is a `data jsonb`
// blob + indexed metadata (id, auth_uid, created_at, stats_updated_at). loadCreator
// returns the blob with id/createdAt/statsUpdatedAt merged back in so the template
// contract stays identical to the pre-swap filesystem version.

// ─── Storage ────────────────────────────────────────────────────────────────
// Supabase is the primary store, with filesystem JSON as fallback for local
// dev or when the Supabase project is paused / unreachable. Reads + writes
// race against a short timeout so DNS failures don't stall every request.
//
// Env knobs:
//   CREATORHQ_DISABLE_SUPABASE=true   skip Supabase entirely, disk-only mode
//   CREATORHQ_SUPABASE_TIMEOUT_MS=2000  per-call timeout before falling back

const DATA_DIR = path.join(__dirname, 'data');
const SUPABASE_TIMEOUT_MS = parseInt(process.env.CREATORHQ_SUPABASE_TIMEOUT_MS, 10) || 2000;
const SUPABASE_DISABLED = process.env.CREATORHQ_DISABLE_SUPABASE === 'true';

// Once we see Supabase fail with a DNS / network error, mark it unreachable
// for the rest of the process. Saves 7+ seconds per request when offline.
let supabaseUnreachable = SUPABASE_DISABLED;

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function isUnreachableError(err) {
  const msg = String(err?.message || err || '');
  return /ENOTFOUND|ECONNREFUSED|EAI_AGAIN|fetch failed|timed out/i.test(msg);
}

function loadCreatorFromDisk(id) {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
  const file = path.join(DATA_DIR, `${id}.json`);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`[loadCreatorFromDisk] parse error for ${id}:`, err.message);
    return null;
  }
}

function saveCreatorToDisk(creator) {
  if (!/^[A-Za-z0-9_-]+$/.test(creator.id)) {
    throw new Error(`Invalid creator id: ${creator.id}`);
  }
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${creator.id}.json`);
  writeFileSync(file, JSON.stringify(creator, null, 2), 'utf8');
  return creator;
}

async function loadCreator(id) {
  if (!supabaseUnreachable) {
    try {
      const supaQuery = supabaseAdmin
        .from('creators')
        .select('id, data, created_at, stats_updated_at')
        .eq('id', id)
        .maybeSingle();
      const { data, error } = await withTimeout(supaQuery, SUPABASE_TIMEOUT_MS, 'Supabase loadCreator');
      if (error) throw error;
      if (data) {
        return {
          ...data.data,
          id: data.id,
          createdAt: data.created_at,
          statsUpdatedAt: data.stats_updated_at,
        };
      }
    } catch (err) {
      if (isUnreachableError(err)) {
        if (!supabaseUnreachable) {
          console.warn(`[loadCreator] Supabase unreachable (${err.message?.slice(0, 80)}). Disk-only for the rest of this process.`);
          supabaseUnreachable = true;
        }
      } else {
        console.warn(`[loadCreator] Supabase error for "${id}": ${err.message?.slice(0, 120)}. Falling back to disk.`);
      }
    }
  }
  return loadCreatorFromDisk(id);
}

async function saveCreator(creator) {
  const { id, createdAt, statsUpdatedAt, ...rest } = creator;
  const now = new Date().toISOString();
  const blob = { ...rest, id };

  if (!supabaseUnreachable) {
    try {
      const row = {
        id,
        data: blob,
        ...(createdAt ? { created_at: createdAt } : {}),
        stats_updated_at: now
      };
      const supaUpsert = supabaseAdmin
        .from('creators')
        .upsert(row, { onConflict: 'id' });
      const { error } = await withTimeout(supaUpsert, SUPABASE_TIMEOUT_MS, 'Supabase saveCreator');
      if (error) throw error;
      return { ...creator, statsUpdatedAt: now };
    } catch (err) {
      if (isUnreachableError(err)) {
        if (!supabaseUnreachable) {
          console.warn(`[saveCreator] Supabase unreachable (${err.message?.slice(0, 80)}). Disk-only for the rest of this process.`);
          supabaseUnreachable = true;
        }
      } else {
        console.warn(`[saveCreator] Supabase error for "${id}": ${err.message?.slice(0, 120)}. Saving to disk.`);
      }
    }
  }

  // Filesystem fallback (also the always-write path when supabaseUnreachable)
  const updated = { ...creator, statsUpdatedAt: now };
  saveCreatorToDisk(updated);
  return updated;
}

function extractCreatorData(body) {
  // New nested Rates structure (approved for future growth)
  const rates = {
    hourly: Number(body['rate_hourly']) || 0,
    packages: {
      "3h": Number(body['rate_3h']) || 0,
      "4h": Number(body['rate_4h']) || 0,
      "8h": Number(body['rate_8h']) || 0
    }
  };

  // Legacy/Custom rates
  const rateLabels = [].concat(body['rate_label'] || []);
  const rateAmounts = [].concat(body['rate_amount'] || []);
  const rateNotes = [].concat(body['rate_note'] || []);
  const customRates = rateLabels
    .map((label, i) => ({
      label: String(label || '').trim(),
      amount: Number(rateAmounts[i]) || 0,
      note: String(rateNotes[i] || '').trim()
    }))
    .filter(r => r.label || r.amount > 0);

  const workBrands = [].concat(body['work_brand'] || []);
  const workNotes = [].concat(body['work_note'] || []);
  const workPreview = workBrands
    .map((brand, i) => ({
      brand: String(brand || '').trim(),
      note: String(workNotes[i] || '').trim(),
    }))
    .filter(w => w.brand);

  const reach = [].concat(body['reach_label'] || []).map((label, i) => ({
    label: String(label || '').trim(),
    value: String([].concat(body['reach_value'] || [])[i] || '').trim()
  })).filter(r => r.label);

  const bioParagraphs = [].concat(body['bio_paragraph'] || []).map(p => String(p).trim()).filter(Boolean);
  const pillarLabels = [].concat(body['pillar_label'] || []);
  const pillarTexts = [].concat(body['pillar_text'] || []);
  const bioPillars = pillarLabels
    .map((label, i) => ({
      label: String(label || '').trim(),
      text: String(pillarTexts[i] || '').trim()
    }))
    .filter(p => p.label || p.text);

  const platformNames = [].concat(body['platform_name'] || []);
  const platformsArr = platformNames.map((name, i) => ({
    name: String(name || '').trim(),
    followers: String([].concat(body['platform_followers'] || [])[i] || '').trim(),
    monthlyReach: String([].concat(body['platform_reach'] || [])[i] || '').trim()
  })).filter(p => p.name);

  const audience = {
    gender: {
      male: String(body['audience_male'] || '').trim(),
      female: String(body['audience_female'] || '').trim()
    },
    age: [].concat(body['audience_age_range'] || []).map((range, i) => ({
      range: String(range || '').trim(),
      percentage: String([].concat(body['audience_age_pct'] || [])[i] || '').trim()
    })).filter(a => a.range),
    locations: [].concat(body['audience_location'] || []).map((loc, i) => ({
      name: String(loc || '').trim(),
      percentage: String([].concat(body['audience_location_pct'] || [])[i] || '').trim()
    })).filter(l => l.name)
  };

  const brandNames = [].concat(body['brand_name'] || []);
  const brandCats = [].concat(body['brand_category'] || []);
  const brands = brandNames
    .map((name, i) => {
      // Evidence URLs — up to 3 per brand (max density rule)
      const evidence = [
        String(body[`brand_${i}_evidence_0`] || '').trim(),
        String(body[`brand_${i}_evidence_1`] || '').trim(),
        String(body[`brand_${i}_evidence_2`] || '').trim()
      ].filter(Boolean);

      return {
        name: String(name || '').trim(),
        category: String(brandCats[i] || '').trim(),
        evidence
      };
    })
    .filter(b => b.name);

  const packagesArr = [].concat(body['package_name'] || []).map((name, i) => ({
    name: String(name || '').trim(),
    price: String([].concat(body['package_price'] || [])[i] || '').trim(),
    description: String([].concat(body['package_desc'] || [])[i] || '').trim(),
    highlight: [].concat(body['package_highlight'] || []).includes(String(i))
  })).filter(p => p.name);

  // Name is stored as a single string at the top level so the renderer can do
  // creator.name.trim() without crashing (templates predate the structured form
  // and Khanyi's seed uses a string). The structured first/last is preserved
  // under nameDetails for any future "Hi {first}" use case.
  const fullName = String(body.name || '').trim()
    || [String(body.name_first || '').trim(), String(body.name_last || '').trim()].filter(Boolean).join(' ').trim();

  // bio: keep a string at the top level for the renderer (Khanyi's seed shape).
  // Paragraphs and pillars are also exposed via bioParagraphs / bioPillars at the
  // top level so newer template paths can use them. The legacy `bio` field gets
  // the full prose: prefer body.bio (textarea), fall back to joined paragraphs.
  const bioText = String(body.bio || '').trim()
    || bioParagraphs.join('\n\n').trim();

  return {
    name: fullName,
    nameDetails: {
      first: String(body.name_first || '').trim(),
      last: String(body.name_last || '').trim(),
      full: fullName,
    },
    role: String(body.role || '').trim(),
    subtitle: String(body.subtitle || '').trim(),
    handle: String(body.handle || '').trim(),
    niche: String(body.niche || '').trim() || null,
    location: String(body.location || '').trim() || null,
    tagline: String(body.tagline || '').trim(),
    bio: bioText,
    bioParagraphs,
    bioPillars,
    contact: {
      email: String(body.email || '').trim() || null,
      note: String(body.contact_note || '').trim()
    },
    email: String(body.email || '').trim() || null,
    platformsOld: {
      instagram: {
        handle: String(body.ig_handle || '').trim(),
        followers: Number(body.ig_followers) || 0,
        engagement: Number(body.ig_engagement) || 0,
      },
      tiktok: {
        handle: String(body.tt_handle || '').trim(),
        followers: Number(body.tt_followers) || 0,
        engagement: Number(body.tt_engagement) || 0,
      },
      youtube: {
        handle: String(body.yt_handle || '').trim(),
        followers: Number(body.yt_followers) || 0,
        avgViews: Number(body.yt_avg_views) || 0,
      },
    },
    reach,
    platforms: platformsArr,
    audience,
    brands,
    packages: packagesArr,
    rates,
    customRates,
    workPreview
  };
}

// -------- Routes --------

// Landing page
app.get('/', (_req, res) => {
  res.type('html').send(renderLandingHTML());
});

// Creator form (new creation) — supports ?rate-card=1 for the trimmed rate-focused variant
app.get('/new', (req, res) => {
  const mode = req.query['rate-card'] ? 'rate-card' : 'kit';
  res.type('html').send(renderFormHTML(null, { mode }));
});

// Dedicated rate calculator page — one-shot overall estimation, no form commitment
app.get('/calculator', (_req, res) => {
  res.type('html').send(renderCalculatorHTML());
});

// Create a new creator record
app.post('/create', upload.single('photo'), async (req, res) => {
  try {
    const body = req.body;

    const baseData = extractCreatorData(body);
    const id = nanoid(8);

    // Upload photo buffer straight to Supabase Storage — keyed on the new id.
    let photo = null;
    if (req.file) {
      const publicUrl = await uploadCreatorPhoto(id, req.file.buffer, req.file.mimetype);
      photo = {
        url: publicUrl,
        // Spec enforced by the template; recorded here for downstream media kit gen.
        slotSpec: { width: 365, height: 1123 },
      };
    }

    const creator = {
      id,
      createdAt: new Date().toISOString(),
      ...baseData,
      photo,
    };

    await saveCreator(creator);
    // Pass ?created=1 so the kit page can show a "your kit is live, share it" banner
    // on first view. The banner is suppressed on subsequent visits / shares.
    const mode = req.body.mode === 'rate-card' ? 'rate-card' : 'kit';
    const target = mode === 'rate-card'
      ? `/c/${creator.id}/rate-card?created=1`
      : `/c/${creator.id}?created=1`;
    res.redirect(target);
  } catch (err) {
    console.error('create failed', err);
    res.status(500).type('text/plain').send(`Create failed: ${err.message}`);
  }
});

// Edit an existing creator record — supports ?rate-card=1 mode switch
app.get('/c/:id/edit', async (req, res) => {
  try {
    const creator = await loadCreator(req.params.id);
    if (!creator) return res.status(404).type('html').send(renderNotFoundHTML({ what: 'creator' }));
    const mode = req.query['rate-card'] ? 'rate-card' : 'kit';
    res.type('html').send(renderFormHTML(creator, { mode }));
  } catch (err) {
    console.error('GET /c/:id/edit failed:', err.message);
    res.status(500).type('text/plain').send(`Edit failed: ${err.message}`);
  }
});

// Update an existing creator record
app.post('/c/:id/update', upload.single('photo'), async (req, res) => {
  try {
    const existing = await loadCreator(req.params.id);
    if (!existing) return res.status(404).type('html').send(renderNotFoundHTML({ what: 'creator' }));

    const body = req.body;

    const baseData = extractCreatorData(body);

    // If a new file is uploaded, push it to Storage (replacing the existing object at
    // the same path — Storage upsert is idempotent). Otherwise keep existing photo intact.
    let photo = existing.photo;
    if (req.file) {
      const publicUrl = await uploadCreatorPhoto(req.params.id, req.file.buffer, req.file.mimetype);
      photo = {
        url: publicUrl,
        slotSpec: { width: 365, height: 1123 },
      };
    }

    const creator = {
      ...existing, // preserve createdAt, id
      ...baseData,
      photo,
    };

    await saveCreator(creator);
    res.redirect(`/c/${creator.id}`);
  } catch (err) {
    console.error('update failed', err);
    res.status(500).type('text/plain').send(`Update failed: ${err.message}`);
  }
});

// Live shareable media kit
app.get('/c/:id', async (req, res) => {
  try {
    const creator = await loadCreator(req.params.id);
    if (!creator) return res.status(404).type('html').send(renderNotFoundHTML({ what: 'creator' }));
    const justCreated = req.query.created === '1';
    res.type('html').send(renderCardHTML(creator, { forPDF: false, justCreated }));
  } catch (err) {
    console.error('GET /c/:id failed:', err.message);
    res.status(500).type('text/plain').send(`Render failed: ${err.message}`);
  }
});

app.get('/c/:id/rate-card', async (req, res) => {
  try {
    const creator = await loadCreator(req.params.id);
    if (!creator) return res.status(404).type('html').send(renderNotFoundHTML({ what: 'creator' }));
    const justCreated = req.query.created === '1';
    res.type('html').send(renderRateCardHTML(creator, { justCreated }));
  } catch (err) {
    console.error('GET /c/:id/rate-card failed:', err.message);
    res.status(500).type('text/plain').send(`Render failed: ${err.message}`);
  }
});

// PDF generation is now entirely client-side via html2pdf.js (see templates/render.js).
// The legacy `GET /c/:id/pdf` route + Puppeteer pipeline were removed 2026-04-17 to
// simplify deploys (no Chrome binary, no postinstall, no cache dir). renderPDFHTML
// is still exported for anyone who wants a raw A4-shaped HTML for printing.

// Rate calculator endpoint — per-asset (used by inline form widget, deprecated).
app.post('/api/calculate', (req, res) => {
  const result = calculateRate(req.body || {});
  res.json(result);
});

// Overall rate estimation — the /calculator page hits this.
app.post('/api/calculate/overall', (req, res) => {
  const result = calculateOverall(req.body || {});
  res.json(result);
});

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// --- Auth Routes ---
// Feature-flagged. The pilot deploy ships with auth disabled (CREATORHQ_AUTH_ENABLED unset
// or false). Khanyi's kit is publicly readable. Edits go through the unauthenticated
// edit route — fine for the pilot since the creator id is the only access token.
//
// When auth is re-enabled, the WhatsApp branch needs a real OTP store and verify step
// (currently a stub that mints sessions on any phone string — production-blocking P0).

const AUTH_ENABLED = process.env.CREATORHQ_AUTH_ENABLED === 'true';

function authDisabledHandler(_req, res) {
  res.status(503).json({
    error: 'Auth is disabled in this deployment',
    hint: 'Set CREATORHQ_AUTH_ENABLED=true to re-enable. WhatsApp OTP verify needs real OTP storage before re-enabling.'
  });
}

if (AUTH_ENABLED) {
  app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    const next = req.query.next || '/';

    if (!code) return res.redirect('/?error=no_auth_code');

    try {
      const { data: { session }, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
      if (error) throw error;

      const jwt = signSession(session.user);
      res.cookie('chq_session', jwt, AUTH_COOKIE_OPTS);

      res.redirect(next);
    } catch (err) {
      console.error('Auth callback failed:', err);
      res.redirect('/?error=auth_failed');
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Identifier required' });

    const isEmail = identifier.includes('@');
    const isPhone = isValidPhone(identifier);

    try {
      if (isEmail) {
        const { error } = await supabaseAdmin.auth.signInWithOtp({ email: identifier });
        if (error) throw error;
        return res.json({ success: true, type: 'email' });
      } else if (isPhone) {
        // WhatsApp branch is stubbed — OTP storage not yet implemented.
        // Until real persistence + verify lands, refuse rather than mint a useless code.
        return res.status(503).json({
          error: 'WhatsApp OTP not available. Use email magic link.',
          hint: 'Real OTP storage + verification is the P0 from QA 2026-05-01. Until then, only email login is supported.'
        });
      } else {
        return res.status(400).json({ error: 'Invalid email or phone number' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/verify', async (req, res) => {
    const { identifier, token, creatorId } = req.body;

    try {
      const isEmail = identifier?.includes('@');

      if (!isEmail) {
        // P0 bypass closed: the previous mock-user-on-any-phone path is gone.
        return res.status(503).json({
          error: 'Phone OTP verification not available',
          hint: 'Real OTP storage + verification needs to ship before this branch comes back.'
        });
      }

      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        email: identifier, token, type: 'magiclink'
      });
      if (error) throw error;
      const user = data.user;

      const jwt = signSession(user);
      res.cookie('chq_session', jwt, AUTH_COOKIE_OPTS);

      if (creatorId) {
        const creator = await loadCreator(creatorId);
        if (creator && !creator.owner_id) {
          creator.owner_id = user.id;
          await saveCreator(creator);
        }
      }

      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
} else {
  // Auth disabled — return 503 on every auth route so clients get a clear signal.
  app.get('/auth/callback', authDisabledHandler);
  app.post('/api/auth/login', authDisabledHandler);
  app.post('/api/auth/verify', authDisabledHandler);
}

// Catch-all 404 — every other route lands here. Renders the branded 404
// instead of Express's default text 404, so a stale share link is still on-brand.
app.use((req, res) => {
  res.status(404).type('html').send(renderNotFoundHTML({ what: 'page' }));
});

// Don't crash the server on a single async failure — log it.
process.on('unhandledRejection', (reason) => {
  console.error('[creatorhq] unhandledRejection:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('[creatorhq] uncaughtException:', err?.message || err);
});

// Local boot — skipped when imported by a serverless runtime.
// Railway sets PORT automatically; explicit 0.0.0.0 bind ensures the
// proxy can reach us on IPv4 even if the default node bind is v6-only.
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`CreatorHQ live at http://${HOST}:${PORT}`);
    // Surface storage health at boot so we know if Supabase is reachable.
    supabaseAdmin
      .from('creators')
      .select('id', { count: 'exact', head: true })
      .then(({ error, count }) => {
        if (error) console.warn(`  Supabase: UNREACHABLE (${error.message?.slice(0, 80)}). Filesystem fallback active.`);
        else console.log(`  Supabase: OK (${count ?? '?'} creators in table)`);
      })
      .catch(err => console.warn(`  Supabase probe failed: ${err.message?.slice(0, 80)}`));
  });
}

// Export for Vercel/Railway
export default app;
