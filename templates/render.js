// Template renderer. Returns HTML strings. No template engine.
//
// Design system (locked — Khanyisile media kit reference):
//   Typography: Cormorant Garamond (display/names), Instrument Sans (UI/body)
//   Palette:    --paper #f0ece4, --sand #e6e0d8, --ink #0a0a0a, --white #f8f5f0
//   Layout:     Scrollable web sections — NOT A4 boxes. PDF via html2pdf.js (client-side)
//   Rhythm:     Cover (dark) → Bio (light) → Stats (dark) → Audience (sand) → Brands+Rates (light) → Footer (dark)

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const fmtNum = (n) => {
  if (!n && n !== 0) return '';
  const num = Number(n);
  if (num >= 1000000) return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
  return num.toLocaleString('en-ZB');
};

const fmtCurrency = (n) => {
  if (!n && n !== 0) return '';
  return 'R' + Number(n).toLocaleString('en-ZA');
};

// ---- shared site header (clickable logo + nav, mounted on every page) ----
// Design: minimal black bar that doesn't fight any of the kit aesthetics.
// Logo links to /. Optional back link for in-creator-flow pages so users always
// have an obvious escape hatch.
//
// Usage:
//   renderSiteHeader({ current: 'landing' })
//   renderSiteHeader({ current: 'form', back: { href: '/', label: 'Home' } })
//   renderSiteHeader({ current: 'kit', back: { href: '/', label: 'Home' }, theme: 'on-dark' })
//
// theme: 'on-light' (default) or 'on-dark' for use over the dark cover.
function renderSiteHeader({ current = '', back = null, theme = 'on-light' } = {}) {
  const onDark = theme === 'on-dark';
  const fg = onDark ? 'rgba(255,255,255,0.92)' : '#0a0a0a';
  const fgMuted = onDark ? 'rgba(255,255,255,0.55)' : 'rgba(10,10,10,0.55)';
  const bg = onDark ? 'transparent' : 'rgba(255,255,255,0.92)';
  const border = onDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,10,0.08)';
  return `
  <style>
    .chq-header {
      position: sticky; top: 0; z-index: 50;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.85rem 1.25rem;
      background: ${bg};
      backdrop-filter: saturate(140%) blur(6px);
      -webkit-backdrop-filter: saturate(140%) blur(6px);
      border-bottom: 1px solid ${border};
    }
    .chq-header__logo {
      display: inline-flex; align-items: baseline; gap: 0.55rem;
      text-decoration: none; color: ${fg};
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.05rem; font-weight: 600; letter-spacing: -0.01em;
    }
    .chq-header__logo span {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
      color: ${fgMuted}; font-weight: 500;
    }
    .chq-header__nav { display: flex; align-items: center; gap: 0.6rem; font-family: 'Instrument Sans', sans-serif; }
    .chq-header__nav a {
      color: ${fgMuted}; text-decoration: none;
      font-size: 0.72rem; letter-spacing: 0.04em;
      padding: 0.4rem 0.6rem; border-radius: 6px;
      transition: color 0.15s, border-color 0.15s, background 0.15s;
    }
    .chq-header__nav a:hover { color: ${fg}; }
    .chq-header__back {
      border: 1px solid ${border};
    }
    .chq-header__back:hover { border-color: ${fg}; }
    @media (max-width: 480px) {
      .chq-header { padding: 0.7rem 0.9rem; }
      .chq-header__logo { font-size: 0.95rem; }
      .chq-header__logo span { display: none; }
      .chq-header__nav { gap: 0.35rem; }
      .chq-header__nav a { padding: 0.35rem 0.5rem; font-size: 0.7rem; }
    }
  </style>
  <header class="chq-header">
    <a href="/" class="chq-header__logo" aria-label="CreatorHQ home">
      CreatorHQ
      <span>Simulacra</span>
    </a>
    <nav class="chq-header__nav">
      ${current !== 'landing' ? `<a href="/">Home</a>` : ''}
      ${back ? `<a href="${esc(back.href)}" class="chq-header__back">← ${esc(back.label)}</a>` : ''}
    </nav>
  </header>`;
}

// ---- shared trust strip (landing + form) -----------------------------------
// Tells a stranger: who built this, who's already on it, what we do with data,
// why no signup. The single biggest first-impression boost for the
// dark-promoter wave when Khanyi shares.
function renderTrustStrip() {
  return `
  <section class="chq-trust" style="border-top:1px solid rgba(10,10,10,0.08); border-bottom:1px solid rgba(10,10,10,0.08); padding:1.5rem 1.25rem; background:#fafafa;">
    <div style="max-width:980px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1.5rem; font-family:'Instrument Sans',sans-serif; font-size:0.78rem; line-height:1.5; color:rgba(10,10,10,0.7);">
      <div>
        <div style="font-size:0.62rem; letter-spacing:0.16em; text-transform:uppercase; color:rgba(10,10,10,0.5); margin-bottom:0.4rem;">Built in SA</div>
        Made by Mowa Khoza in Johannesburg, for African creators.
      </div>
      <div>
        <div style="font-size:0.62rem; letter-spacing:0.16em; text-transform:uppercase; color:rgba(10,10,10,0.5); margin-bottom:0.4rem;">Used by</div>
        <a href="/c/KhKumalo" style="color:rgba(10,10,10,0.7); border-bottom:1px solid rgba(10,10,10,0.2); text-decoration:none;">Khanyisile Khumalo</a>, Tembisa creator. Brands have her on file.
      </div>
      <div>
        <div style="font-size:0.62rem; letter-spacing:0.16em; text-transform:uppercase; color:rgba(10,10,10,0.5); margin-bottom:0.4rem;">Your data</div>
        Stays yours. You own the URL. Edit or delete any time. No tracking pixels, no resale.
      </div>
      <div>
        <div style="font-size:0.62rem; letter-spacing:0.16em; text-transform:uppercase; color:rgba(10,10,10,0.5); margin-bottom:0.4rem;">No signup</div>
        Build a kit in 4 minutes without an account. Add login later if you want analytics or edit-from-anywhere.
      </div>
    </div>
  </section>`;
}

// Tiny 404 page that respects the design system + gives the user a way home.
export function renderNotFoundHTML({ what = 'page' } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · Not found</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${localFonts()}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Instrument Sans', system-ui, sans-serif; background: #fafafa; color: #0a0a0a; min-height: 100vh; display: flex; flex-direction: column; }
    main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1.5rem; text-align: center; }
    h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 4rem; font-weight: 300; line-height: 1; margin-bottom: 1rem; letter-spacing: -0.02em; }
    h1 em { font-style: italic; color: rgba(10,10,10,0.55); }
    p { font-size: 1rem; color: rgba(10,10,10,0.6); margin-bottom: 2rem; max-width: 32rem; }
    a.cta { display: inline-block; background: #0a0a0a; color: #fff; text-decoration: none; padding: 0.85rem 1.5rem; border-radius: 100px; font-size: 0.85rem; letter-spacing: 0.04em; }
    a.cta:hover { background: #1a1a1a; }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: '404' })}
  <main>
    <h1>Not <em>here.</em></h1>
    <p>The ${esc(what)} you tried to open does not exist or has been moved. The kit owner may have deleted it, or the link was mistyped.</p>
    <a href="/" class="cta">Back to CreatorHQ</a>
  </main>
</body>
</html>`;
}

// ---- self-hosted typeface @font-face block --------------------------------
// Replaces the prior @import url(googleapis...) which was render-blocking on
// 3G. All six woff2 files live in public/fonts/ and ship from our domain.
// Cormorant Garamond is variable-weight in the file; we declare it once for
// each style (normal + italic) and let the font-weight CSS pick the axis.
// Instrument Sans is also variable; one declaration covers all weights.
// font-display:swap so text renders immediately in the system fallback then
// re-paints when the woff2 lands.
function localFonts() {
  return /* css */ `
    @font-face {
      font-family: 'Cormorant Garamond';
      font-style: normal;
      font-weight: 300 600;
      font-display: swap;
      src: url('/fonts/cormorant-latin.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Cormorant Garamond';
      font-style: normal;
      font-weight: 300 600;
      font-display: swap;
      src: url('/fonts/cormorant-latin-ext.woff2') format('woff2');
      unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    @font-face {
      font-family: 'Cormorant Garamond';
      font-style: italic;
      font-weight: 300 400;
      font-display: swap;
      src: url('/fonts/cormorant-italic-latin.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Cormorant Garamond';
      font-style: italic;
      font-weight: 300 400;
      font-display: swap;
      src: url('/fonts/cormorant-italic-latin-ext.woff2') format('woff2');
      unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    @font-face {
      font-family: 'Instrument Sans';
      font-style: normal;
      font-weight: 300 500;
      font-display: swap;
      src: url('/fonts/instrument-latin.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Instrument Sans';
      font-style: normal;
      font-weight: 300 500;
      font-display: swap;
      src: url('/fonts/instrument-latin-ext.woff2') format('woff2');
      unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
  `;
}

// ---- Open Graph + Twitter card meta -------------------------------------
// Renders the share-preview metadata for a page. WhatsApp, iMessage, Twitter,
// LinkedIn, Slack all read these tags when a URL is pasted. Without them the
// preview is blank or shows random page text. With them the preview shows
// photo + name + tagline.
//
// Usage:
//   ${ogMeta({ title: '...', description: '...', image: '...', url: '...', type: 'profile' })}
//
// Pass `image` as an absolute URL (https://...) — relative URLs don't work in
// social previews.
function ogMeta({ title, description, image, url, type = 'website' } = {}) {
  const safeTitle = esc(title || 'CreatorHQ');
  const safeDesc = esc(description || 'Designed, shareable media kits for African creators.');
  const safeImage = esc(image || '');
  const safeUrl = esc(url || '');
  return `
  <meta property="og:type" content="${esc(type)}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  ${safeImage ? `<meta property="og:image" content="${safeImage}">` : ''}
  ${safeUrl ? `<meta property="og:url" content="${safeUrl}">` : ''}
  <meta property="og:site_name" content="CreatorHQ">
  <meta name="twitter:card" content="${safeImage ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  ${safeImage ? `<meta name="twitter:image" content="${safeImage}">` : ''}
  <meta name="description" content="${safeDesc}">`;
}

// Build an absolute URL for a path. Honors SITE_URL env (set on Railway) so
// the share previews work on production. Falls back to the production domain
// when running locally.
function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = process.env.SITE_URL || 'https://creator-hq-production.up.railway.app';
  const baseTrim = base.replace(/\/$/, '');
  const pathPrefixed = pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl;
  return baseTrim + pathPrefixed;
}

// ---- shared head / fonts / base CSS (used by form + landing) ----

function headCSS() {
  return /* css */ `
    ${localFonts()}

    :root {
      --black: #0a0a0a;
      --white: #ffffff;
      --paper: #ffffff;
      --off:   #f5f5f5;
      --rule:  rgba(10,10,10,0.15);
      --muted: rgba(10,10,10,0.45);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #e0e0e0; color: var(--black); }
    body {
      font-family: 'Instrument Sans', system-ui, sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }

    .display {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    /* A4 page — 794 x 1123 px at 96dpi */
    .page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: var(--white);
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }

    /* ---- COVER ---- */
    .cover {
      display: grid;
      grid-template-columns: 365px 1fr;
      min-height: 1123px;
    }

    /* The photo slot is LOCKED to 365 x 1123 px. This is the spec. */
    .cover__photo {
      width: 365px;
      height: 1123px;
      background: var(--black);
      overflow: hidden;
      position: relative;
    }
    .cover__photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }
    .cover__photo--empty::after {
      content: '365 × 1123';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 9pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .cover__body {
      padding: 72px 64px 64px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 1123px;
      background: var(--black);
      color: var(--white);
    }
    .cover__eyebrow {
      font-size: 9pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
      font-weight: 500;
      margin-bottom: 36px;
    }
    .cover__name {
      font-size: 58pt;
      line-height: 0.95;
      color: var(--white);
      margin-bottom: 12px;
    }
    .cover__handle {
      font-size: 11pt;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.04em;
    }
    .cover__tagline {
      margin-top: 48px;
      font-size: 18pt;
      line-height: 1.3;
      max-width: 28ch;
      color: rgba(255,255,255,0.85);
    }
    .cover__foot {
      font-size: 8.5pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      display: flex;
      justify-content: space-between;
    }

    /* ---- INTERIOR PAGE ---- */
    .sheet {
      padding: 72px 64px;
    }
    .section + .section { margin-top: 56px; }
    .section__label {
      font-size: 8.5pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--black);
      font-weight: 600;
      margin-bottom: 18px;
    }
    .section__title {
      font-size: 28pt;
      line-height: 1.1;
      margin-bottom: 24px;
    }
    .section__body {
      font-size: 11pt;
      max-width: 62ch;
      color: rgba(10,10,10,0.82);
    }

    .platforms {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0;
      border-top: 1px solid var(--rule);
      border-bottom: 1px solid var(--rule);
    }
    .platform {
      padding: 28px 24px;
      border-right: 1px solid var(--rule);
    }
    .platform:last-child { border-right: none; }
    .platform__name {
      font-size: 9pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--black);
      font-weight: 600;
    }
    .platform__handle {
      font-size: 16pt;
      margin-top: 6px;
    }
    .platform__stats {
      margin-top: 18px;
      display: flex;
      flex-direction: row;
      gap: 24px;
    }
    .stat__n {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 28pt;
      font-weight: 600;
      line-height: 1;
    }
    .stat__l {
      font-size: 8.5pt;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--muted);
      margin-top: 6px;
    }

    .rates { border-top: 1px solid var(--rule); }
    .rate {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 22px 0;
      border-bottom: 1px solid var(--rule);
    }
    .rate__label { font-size: 13pt; }
    .rate__amount {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 20pt;
      font-weight: 600;
    }

    .work { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 32px; }
    .work__item {
      padding: 20px 22px;
      background: var(--black);
      color: var(--white);
    }
    .work__brand {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 14pt;
      font-weight: 600;
      line-height: 1.2;
    }
    .work__note {
      font-size: 10pt;
      color: rgba(255,255,255,0.55);
      margin-top: 8px;
    }

    .foot {
      margin-top: 72px;
      padding-top: 24px;
      border-top: 1px solid var(--rule);
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }

    /* Screen-only chrome (hidden when Puppeteer renders to PDF) */
    .chrome {
      position: fixed;
      top: 20px; right: 20px;
      display: flex; gap: 10px;
      z-index: 10;
    }
    .chrome a, .chrome button {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 10pt;
      padding: 10px 16px;
      background: var(--black);
      color: var(--white);
      text-decoration: none;
      border-radius: 2px;
      border: none;
      cursor: pointer;
    }
    .chrome a.secondary, .chrome button.secondary {
      background: var(--white);
      color: var(--black);
      border: 1px solid var(--black);
    }
    .for-pdf .chrome { display: none; }

    @media print {
      .chrome { display: none; }
      .page { margin: 0; box-shadow: none; }
    }

    /* ---- DATED / DECAY RULE ---- */
    .is-dated {
      opacity: 0.6;
      filter: grayscale(1);
      position: relative;
    }
    .dated-badge {
      display: none;
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(0,0,0,0.8);
      color: #fff;
      padding: 4px 12px;
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      z-index: 1000;
      border-radius: 2px;
    }
    .nudge {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      background: #ffffff;
      color: #0a0a0a;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      z-index: 999;
      width: clamp(320px, 90vw, 600px);
      border: 1px solid rgba(0,0,0,0.05);
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { transform: translate(-50%, 100%); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    .nudge__content { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
    .nudge__icon { font-size: 1.2rem; }
    .nudge__text { display: flex; flex-direction: column; }
    .nudge__text strong { font-size: 0.85rem; font-weight: 600; letter-spacing: -0.01em; }
    .nudge__text span { font-size: 0.75rem; color: rgba(0,0,0,0.6); line-height: 1.3; }
    .nudge__btn {
      background: #0a0a0a;
      color: #ffffff;
      padding: 0.6rem 1.2rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      white-space: nowrap;
    }

    /* Modal Styles */
    .modal { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .modal__overlay { position: absolute; inset: 0; background: rgba(10,10,10,0.4); backdrop-filter: blur(2px); }
    .modal__content {
      position: relative;
      background: #ffffff;
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } }
    .modal__close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: rgba(0,0,0,0.3); }
    .modal__header h2 { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 400; margin-bottom: 0.5rem; }
    .modal__header p { font-size: 0.9rem; color: rgba(0,0,0,0.6); line-height: 1.5; margin-bottom: 2rem; }
    
    .auth-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.8rem;
      border-radius: 100px;
      border: 1px solid rgba(0,0,0,0.1);
      background: #ffffff;
      color: #0a0a0a;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .auth-btn:hover { border-color: rgba(0,0,0,0.2); background: rgba(0,0,0,0.02); }
    .auth-btn--primary { background: #0a0a0a; color: #ffffff; border: none; }
    .auth-btn--primary:hover { opacity: 0.88; background: #0a0a0a; }
    
    .auth-divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; font-size: 0.7rem; color: rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 0.1em; }
    .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.08); }
    
    .auth-input {
      width: 100%;
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid rgba(0,0,0,0.1);
      font: inherit;
      margin-bottom: 0.75rem;
    }
    .auth-input:focus { outline: none; border-color: #0a0a0a; }

    @media (max-width: 480px) {
      .nudge { bottom: 0; left: 0; right: 0; transform: none; width: 100%; border-radius: 0; border-top: 1px solid rgba(0,0,0,0.05); }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    }
    .is-dated .dated-badge { display: block; }

    /* ---- BRAND EVIDENCE ---- */
    .brand-evidence {
      display: none;
      background: rgba(0,0,0,0.03);
      padding: 1rem;
      margin-top: 0.5rem;
      border-radius: 4px;
    }
    .brand-evidence.visible { display: block; }
    .evidence-link {
      display: block;
      font-size: 0.8rem;
      color: var(--dusk);
      margin-bottom: 0.25rem;
      text-decoration: underline;
    }
    .brand-row { cursor: pointer; transition: background 0.1s; }
    .brand-row:hover { background: rgba(0,0,0,0.02); }
  `;
}

// ---- Media Kit Card (Khanyisile scrollable design) ----

// Renders the post-create banner. Shown on first kit view (?created=1).
// User can dismiss; sharing the URL strips the param naturally.
function renderCreatedBanner(creator, productLabel = 'Media kit') {
  return `
  <div id="created-banner" style="position:sticky; top:54px; z-index:40; background:#0a0a0a; color:#fff; padding:0.9rem 1.25rem; font-family:'Instrument Sans',sans-serif; font-size:0.82rem;">
    <div style="max-width:980px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
      <div style="display:flex; align-items:center; gap:0.6rem;">
        <span style="display:inline-flex; align-items:center; justify-content:center; width:1.4rem; height:1.4rem; border-radius:50%; background:#22c55e; color:#0a0a0a; font-size:0.7rem; font-weight:700;">✓</span>
        <span><strong>${esc(productLabel)} live.</strong> Copy the link and send it to a brand or a friend.</span>
      </div>
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <button onclick="copyShareUrl()" id="created-banner-copy" style="background:#fff; color:#0a0a0a; border:none; padding:0.45rem 0.9rem; border-radius:100px; font-size:0.72rem; font-weight:500; cursor:pointer; letter-spacing:0.04em;">Copy link</button>
        <a href="/c/${esc(creator.id)}/edit" style="color:rgba(255,255,255,0.85); text-decoration:none; font-size:0.72rem; padding:0.45rem 0.7rem; border:1px solid rgba(255,255,255,0.18); border-radius:100px;">Edit</a>
        <button onclick="document.getElementById('created-banner').remove()" aria-label="Dismiss" style="background:none; border:none; color:rgba(255,255,255,0.6); font-size:1.1rem; cursor:pointer; padding:0 0.4rem;">×</button>
      </div>
    </div>
    <script>
      function copyShareUrl(){
        const url = window.location.origin + window.location.pathname;
        navigator.clipboard.writeText(url).then(()=>{
          const b = document.getElementById('created-banner-copy');
          const o = b.textContent; b.textContent = 'Copied'; setTimeout(()=>b.textContent=o, 1800);
        }).catch(()=>{});
      }
    </script>
  </div>`;
}

// Renders the post-save confirmation banner. Quieter than the post-create
// banner because the user is already oriented; this is just acknowledgement.
// Auto-dismisses after 4 seconds. The URL still includes ?saved=1 if the user
// stays on the page, but reload / share strips it naturally.
function renderSavedBanner() {
  return `
  <div id="saved-banner" role="status" aria-live="polite" style="position:fixed; left:50%; top:1.25rem; transform:translateX(-50%); z-index:60; background:#0a0a0a; color:#fff; padding:0.55rem 1.1rem 0.55rem 0.75rem; border-radius:100px; font-family:'Instrument Sans',sans-serif; font-size:0.78rem; display:flex; align-items:center; gap:0.55rem; box-shadow:0 8px 24px rgba(0,0,0,0.18); transition:opacity 0.4s ease, transform 0.4s ease;">
    <span style="display:inline-flex; align-items:center; justify-content:center; width:1.1rem; height:1.1rem; border-radius:50%; background:#22c55e; color:#0a0a0a; font-size:0.6rem; font-weight:700;">✓</span>
    <span>Changes saved.</span>
    <script>
      setTimeout(function(){
        var b = document.getElementById('saved-banner');
        if (b) { b.style.opacity = '0'; b.style.transform = 'translateX(-50%) translateY(-6px)'; setTimeout(function(){ b.remove(); }, 400); }
      }, 4000);
    </script>
  </div>`;
}

export function renderCardHTML(creator, { forPDF = false, justCreated = false, justSaved = false } = {}) {
  // Decay Rule calculation (7-day visual downgrade)
  const statsDate = creator.statsUpdatedAt ? new Date(creator.statsUpdatedAt) : null;
  const daysOld = statsDate ? Math.floor((Date.now() - statsDate) / (1000 * 60 * 60 * 24)) : 0;
  const isDated = daysOld > 7;
  const datedLabel = statsDate ? `Dated (last updated ${statsDate.toLocaleDateString('en-ZA', { day:'numeric', month:'short' })})` : '';

  // Platform data — support both old (ig/tt/yt) and new (fb) structure
  const ig  = creator.platforms?.instagram || creator.platformsOld?.instagram || {};
  const tt  = creator.platforms?.tiktok    || creator.platformsOld?.tiktok    || {};
  const yt  = creator.platforms?.youtube   || creator.platformsOld?.youtube   || {};
  const fb  = creator.platforms?.facebook  || {};

  // Name split — first upright, last in italic (Cormorant Garamond)
  const nameParts = (creator.name || '').trim().split(' ');
  const firstName = esc(nameParts[0] || 'Your');
  const lastName  = esc(nameParts.slice(1).join(' ') || 'Name');

  // Bio paragraphs — prefer new bioParagraphs[], fallback to bio string split
  const bioParagraphs = creator.bioParagraphs?.length
    ? creator.bioParagraphs
    : (creator.bio || '').split(/\r?\n/).map(p => p.trim()).filter(Boolean);

  // Bio pillars — new field
  const bioPillars = creator.bioPillars || [];

  // Cover reach stats — prefer new reach[], fallback to derived platform stats
  const reachStats = creator.reach?.length
    ? creator.reach
    : (() => {
        const s = [];
        if (fb.followers) s.push({ val: fmtNum(fb.followers) + '+', lbl: 'Facebook Followers' });
        else if (ig.followers) s.push({ val: fmtNum(ig.followers) + '+', lbl: 'Instagram Followers' });
        if (tt.followers) s.push({ val: fmtNum(tt.followers) + '+', lbl: 'TikTok Followers' });
        if (yt.followers) s.push({ val: fmtNum(yt.followers) + '+', lbl: 'YouTube Subscribers' });
        if (!s.length) s.push({ val: '—', lbl: 'Followers' });
        return s;
      })();

  // Active platform cells for stats section — support fb too
  const activePlatforms = [
    fb.followers || fb.handle ? { name: 'Facebook',  handle: fb.handle, big: fmtNum(fb.followers) + '+', unit: 'Followers', sub: fb.monthlyReach || '—', subLbl: 'Monthly Reach' } : null,
    tt.followers || tt.handle ? { name: 'TikTok',    handle: tt.handle, big: fmtNum(tt.followers) + '+', unit: 'Followers', sub: tt.monthlyReach || (tt.engagement ? tt.engagement + '%' : '—'), subLbl: tt.monthlyReach ? 'Monthly Reach' : 'Engagement' } : null,
    ig.followers || ig.handle ? { name: 'Instagram', handle: ig.handle, big: fmtNum(ig.followers) + '+', unit: 'Followers', sub: ig.monthlyReach || (ig.engagement ? ig.engagement + '%' : '—'), subLbl: ig.monthlyReach ? 'Monthly Reach' : 'Engagement' } : null,
    yt.followers || yt.handle ? { name: 'YouTube',   handle: yt.handle, big: fmtNum(yt.followers) + '+', unit: 'Subscribers', sub: yt.avgViews ? fmtNum(yt.avgViews) : '—', subLbl: 'Avg Views' } : null,
  ].filter(Boolean);

  // Audience — new field
  const audience = creator.audience || null;

  // Brands — support new evidence model
  const brands = creator.brands?.length ? creator.brands : (creator.workPreview || []).map(w => ({ name: w.brand, category: w.note, evidence: [] }));

  // Packages — new field
  const packages = creator.packages || [];

  // Rates — new nested structure
  const rateHourly = creator.rates?.hourly || 0;
  const ratePkgs = creator.rates?.packages || {};
  const rates = (creator.customRates || []);

  // Role / descriptor
  const role     = creator.niche    || 'Content Creator';
  const location = creator.location || '';

  const year = new Date(creator.createdAt || Date.now()).getFullYear();

  // Share-preview metadata: photo + name + tagline shown when the URL is
  // pasted into WhatsApp / iMessage / Twitter / Slack / LinkedIn.
  const kitTitle = `${firstName} ${lastName} · Media Kit`;
  const kitDesc = creator.tagline
    || (creator.bio || '').toString().trim().split(/\.\s|\n/)[0].slice(0, 200)
    || `Media kit for ${firstName} ${lastName}.`;
  const kitImage = creator.photo?.url ? absoluteUrl(creator.photo.url) : '';
  const kitUrl = absoluteUrl(`/c/${creator.id}`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(kitTitle)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${ogMeta({ title: kitTitle, description: kitDesc, image: kitImage, url: kitUrl, type: 'profile' })}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#0a0a0a">
  <style>${localFonts()}</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style>
    :root {
      --paper: #f0ece4;
      --sand:  #e6e0d8;
      --smoke: #c4bdb5;
      --dusk:  #6b6460;
      --deep:  #111111;
      --ink:   #0a0a0a;
      --white: #f8f5f0;
      --line:  #d8d2ca;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; overflow-x: hidden; }
    body {
      background: var(--paper);
      color: var(--deep);
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 300;
      font-size: 15px;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      max-width: 100%;
    }
    .eyebrow-light { font-size: 0.6rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.28); }
    .eyebrow-dark  { font-size: 0.6rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: var(--smoke); }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 2.5rem; }

    /* ── HERO ── */
    .hero { position: relative; min-height: 100svh; display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
    .hero-photo-side { position: relative; overflow: hidden; }
    .hero-photo { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
    .hero-photo--empty { background: var(--deep); display: flex; align-items: center; justify-content: center; }
    .hero-text {
      background: var(--ink);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0 3rem 4rem 3.5rem;
      overflow: hidden;
    }
    .hero-text::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.3;
      pointer-events: none;
    }
    .hero-bar { position: absolute; top: 0; left: 0; right: 0; padding: 2rem 3.5rem; display: flex; justify-content: space-between; align-items: center; z-index: 2; }
    .kit-label { font-size: 0.56rem; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.09); padding: 0.32rem 0.75rem; border-radius: 100px; }
    .chq-mark  { font-size: 0.54rem; font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase; color: rgba(255,255,255,0.13); }
    .hero-name { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(3rem, 5vw, 5.5rem); line-height: 0.92; color: var(--white); letter-spacing: -0.01em; position: relative; z-index: 2; }
    .hero-name em { font-style: italic; color: rgba(255,255,255,0.35); }
    .hero-rule { width: 24px; height: 1px; background: rgba(255,255,255,0.25); margin: 2rem 0 1.5rem; position: relative; z-index: 2; }
    .hero-descriptor { font-size: 0.66rem; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.28); line-height: 2; position: relative; z-index: 2; margin-bottom: 3rem; }
    .hero-reach { display: flex; gap: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.07); position: relative; z-index: 2; }
    .reach-num { font-family: 'Cormorant Garamond', serif; font-size: 1.9rem; font-weight: 300; color: var(--white); line-height: 1; }
    .reach-lbl { font-size: 0.54rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.18); margin-top: 0.3rem; }

    /* ── BIO ── */
    .bio-section { padding: 7rem 0; background: var(--paper); }
    .bio-inner { display: grid; grid-template-columns: 240px 1fr; gap: 5.5rem; align-items: start; }
    .bio-sidebar { position: sticky; top: 3rem; }
    .bio-title { font-family: 'Cormorant Garamond', serif; font-size: 2.8rem; font-weight: 300; line-height: 1.1; color: var(--deep); margin-top: 1.2rem; }
    .bio-title em { font-style: italic; color: var(--dusk); }
    .bio-rule { width: 22px; height: 1px; background: var(--deep); opacity: 0.2; margin: 1.8rem 0; }
    .bio-sidebar-sub { font-size: 0.72rem; color: var(--dusk); line-height: 1.9; }
    .bio-body p { font-size: 1rem; color: var(--dusk); line-height: 1.95; margin-bottom: 1.3rem; }

    /* ── STATS ── */
    .stats-section { background: var(--ink); padding: 6rem 0; }
    .stats-head { display: flex; align-items: baseline; justify-content: space-between; padding-bottom: 2.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .stats-title { font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; font-weight: 300; color: var(--white); }
    .stats-title em { font-style: italic; color: rgba(255,255,255,0.25); }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.05); margin-top: 2.5rem; }
    .stats-row--1col { grid-template-columns: 1fr; }
    .stats-row--2col { grid-template-columns: repeat(2, 1fr); }
    .stats-row--3col { grid-template-columns: repeat(3, 1fr); }
    .stat-cell { background: var(--ink); padding: 3rem 2.5rem; }
    .stat-platform { font-size: 0.54rem; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 1.5rem; }
    .stat-handle { font-size: 1rem; color: rgba(255,255,255,0.5); margin-bottom: 1.5rem; }
    .stat-big { font-family: 'Cormorant Garamond', serif; font-size: 4rem; font-weight: 300; color: var(--white); line-height: 1; }
    .stat-unit { font-size: 0.58rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.18); margin-top: 0.3rem; }
    .stat-sep { width: 16px; height: 1px; background: rgba(255,255,255,0.08); margin: 1.5rem 0; }
    .stat-sub-val { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 300; color: rgba(255,255,255,0.35); line-height: 1; }
    .stat-sub-lbl { font-size: 0.52rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.14); margin-top: 0.25rem; }

    /* ── BRANDS + RATES ── */
    /* ── RATES ── */
    .rates-section { padding: 5rem 0; background: var(--sand); }
    .rates-grid { display: grid; gap: 1px; background: var(--smoke); margin-top: 2.5rem; }
    .rates-grid--1col { grid-template-columns: 1fr; }
    .rates-grid--2col { grid-template-columns: repeat(2, 1fr); }
    .rates-grid--3col { grid-template-columns: repeat(3, 1fr); }
    .rates-grid--4col { grid-template-columns: repeat(4, 1fr); }
    .rate-cell { background: var(--sand); padding: 2rem 1.5rem; }
    .rate-type { font-size: 0.58rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dusk); margin-bottom: 1rem; }
    .rate-price { font-family: 'Cormorant Garamond', serif; font-size: 1.9rem; font-weight: 300; color: var(--deep); line-height: 1; }
    .rate-note { font-size: 0.62rem; color: var(--smoke); margin-top: 0.4rem; }

    /* ── AUDIENCE ── */
    .audience-section { padding: 7rem 0; background: var(--sand); }
    .aud-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: 4rem; }
    .aud-col { padding-right: 4rem; }
    .aud-col--right { padding-left: 4rem; padding-right: 0; border-left: 1px solid var(--smoke); }
    .aud-label { font-size: 0.58rem; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase; color: var(--dusk); margin-bottom: 1.2rem; }
    .aud-big { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 300; color: var(--deep); line-height: 1.2; margin-bottom: 1rem; }
    .aud-locs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 2.5rem; }
    .aud-loc { font-size: 0.67rem; color: var(--dusk); border: 1px solid var(--smoke); padding: 0.25rem 0.75rem; border-radius: 100px; }
    .aud-age { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; font-weight: 300; color: var(--deep); line-height: 1; }
    .aud-age-sub { font-size: 0.72rem; color: var(--dusk); margin-top: 0.5rem; }
    .aud-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 2rem; }
    .aud-tag { font-size: 0.67rem; background: rgba(0,0,0,0.07); color: var(--deep); padding: 0.28rem 0.8rem; border-radius: 100px; }
    .aud-note { font-size: 0.84rem; color: var(--dusk); line-height: 1.85; }

    .brands-section { padding: 7rem 0; background: var(--paper); }
    .brands-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: start; }
    .section-heading { font-family: 'Cormorant Garamond', serif; font-size: 1.9rem; font-weight: 300; color: var(--deep); line-height: 1.2; margin-top: 0.8rem; }
    .section-heading em { font-style: italic; color: var(--dusk); }
    .brands-list { margin-top: 2.5rem; }
    .brand-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-top: 1px solid var(--line); }
    .brand-row:last-child { border-bottom: 1px solid var(--line); }
    .brand-name { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 300; color: var(--deep); }
    .brand-type { font-size: 0.58rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--smoke); }
    .rates-stack { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1px; background: var(--line); }
    .rate-pkg { background: var(--paper); padding: 1.8rem; display: grid; grid-template-columns: 1fr auto; align-items: start; gap: 1rem; transition: background 0.15s; }
    .rate-pkg:hover { background: #ede9e1; }
    .rate-pkg.highlight { background: var(--deep); }
    .rate-pkg.highlight:hover { background: #1a1a1a; }
    .rate-pkg__label { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 300; color: var(--deep); margin-bottom: 0.3rem; }
    .rate-pkg.highlight .rate-pkg__label { color: rgba(255,255,255,0.9); }
    .rate-pkg__note { font-size: 0.74rem; color: var(--dusk); }
    .rate-pkg.highlight .rate-pkg__note { color: rgba(255,255,255,0.45); }
    .rate-pkg__price { font-family: 'Cormorant Garamond', serif; font-size: 1.45rem; font-weight: 300; color: var(--deep); white-space: nowrap; text-align: right; }
    .rate-pkg.highlight .rate-pkg__price { color: rgba(255,255,255,0.7); }

    /* ── FOOTER ── */
    .footer { background: var(--ink); padding: 5rem 0 3rem; }
    .footer-inner { display: flex; align-items: flex-end; justify-content: space-between; }
    .footer-name { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 300; color: var(--white); line-height: 1; }
    .footer-name em { font-style: italic; color: rgba(255,255,255,0.22); }
    .footer-desc { font-size: 0.64rem; color: rgba(255,255,255,0.18); letter-spacing: 0.08em; margin-top: 0.8rem; }
    .footer-right { text-align: right; }
    .footer-cta { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-style: italic; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem; }
    .footer-contact { font-size: 0.66rem; color: rgba(255,255,255,0.2); line-height: 1.9; }
    .footer-bottom { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
    .footer-credit { font-size: 0.52rem; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.1); }
    .footer-credit span { color: rgba(255,255,255,0.22); }
    .footer-ts { font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.1); display: flex; align-items: center; gap: 0.5rem; }
    .ts-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.35); flex-shrink: 0; animation: blink 2.5s ease-in-out infinite; }

    /* ── ACTION BAR ── */
    #action-bar { position: fixed; bottom: 2rem; right: 2rem; z-index: 100; display: flex; align-items: center; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 0.5rem 0.75rem; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    #action-bar button { display: flex; align-items: center; gap: 0.45rem; background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.7); font-family: 'Instrument Sans', sans-serif; font-size: 0.7rem; font-weight: 400; letter-spacing: 0.06em; padding: 0.3rem 0.6rem; border-radius: 100px; white-space: nowrap; transition: color 0.15s; }
    #action-bar button:hover { color: #fff; }
    .bar-divider { width: 1px; height: 14px; background: rgba(255,255,255,0.12); margin: 0 0.25rem; }

    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .d1 { animation-delay: 0.1s; } .d2 { animation-delay: 0.25s; } .d3 { animation-delay: 0.4s; }

    /* ── MOBILE ── */
    @media (max-width: 720px) {
      /* ── Layout ── */
      .wrap { padding: 0 1.25rem; }

      /* ── Hero ── */
      .hero { grid-template-columns: 1fr; }
      .hero-photo-side { height: 75vw; min-height: 300px; }
      .hero-text { padding: 2rem 1.5rem 3rem; min-height: auto; }
      .hero-name { font-size: 2.8rem; }
      .hero-reach { gap: 1.5rem; flex-wrap: wrap; }
      .hero-bar { padding: 1.5rem; }

      /* ── Bio ── */
      .bio-section { padding: 3.5rem 0; }
      .bio-inner { grid-template-columns: 1fr; gap: 2rem; }
      .bio-sidebar { position: static; }
      .bio-title { font-size: 2rem; }
      .pillar { grid-template-columns: 1fr; gap: 0.4rem; }

      /* ── Stats ── */
      .stats-section { padding: 3rem 0; }
      .stats-head { flex-direction: column; gap: 0.5rem; }
      .stats-row,
      .stats-row--1col,
      .stats-row--2col,
      .stats-row--3col { grid-template-columns: 1fr !important; }
      .stat-cell { padding: 2rem 1.5rem; }
      .stat-big { font-size: 3rem; }

      /* ── Audience ── */
      .audience-section { padding: 3.5rem 0; }
      .aud-grid { grid-template-columns: 1fr; }
      .aud-col { padding-right: 0; }
      .aud-col--right { padding-left: 0; border-left: none; border-top: 1px solid var(--smoke); padding-top: 2rem; margin-top: 2rem; }

      /* ── Brands + Packages ── */
      .brands-section { padding: 3.5rem 0; }
      .brands-inner { grid-template-columns: 1fr; gap: 2.5rem; }

      /* ── Rates ── */
      .rates-grid { grid-template-columns: 1fr 1fr !important; }
      .rate-cell { padding: 1.2rem 1rem; }
      .rate-price { font-size: 1.3rem; }
      .rate-type { font-size: 0.52rem; }

      /* ── Footer ── */
      .footer { padding: 3rem 0 6rem; }
      .footer-inner { flex-direction: column; align-items: flex-start; gap: 2rem; }
      .footer-right { text-align: left; }
      .footer-bottom { flex-direction: column; align-items: flex-start; gap: 0.8rem; }
      .footer-name { font-size: 1.8rem; }

      /* Footer gets extra bottom padding on mobile so the floating action bar
         doesn't sit on top of the timestamp / credit when the user reaches it. */

      /* ── Action bar mobile ── */
      /* The action bar grew an Edit pill, so on narrow phones we let it
         scroll horizontally inside its container rather than wrap or clip. */
      #action-bar {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
        padding: 0.4rem 0.6rem;
        max-width: calc(100vw - 2rem);
        overflow-x: auto;
        scrollbar-width: none;
        justify-content: flex-start;
      }
      #action-bar::-webkit-scrollbar { display: none; }
      #action-bar button, #action-bar a { font-size: 0.68rem; padding: 0.3rem 0.55rem; }

      /* ── Prevent overflow ── */
      .hero, .bio-section, .stats-section, .brands-section, .footer { overflow-x: hidden; }
    }
  </style>
</head>
<body>

${forPDF ? '' : renderSiteHeader({
  current: 'kit',
  back: { href: '/', label: 'Home' },
  theme: 'on-light'
})}

${(!forPDF && justCreated) ? renderCreatedBanner(creator, 'Media kit') : ''}
${(!forPDF && justSaved && !justCreated) ? renderSavedBanner() : ''}

<!-- ── DATED OVERLAY ── -->
<div class="${isDated ? 'is-dated' : ''}">
  ${isDated ? `<div class="dated-badge">${datedLabel}</div>` : ''}

<!-- ── HERO / COVER ── -->
<header class="hero">
  <div class="hero-photo-side">
    ${creator.photo?.url
      ? `<img class="hero-photo" src="${esc(creator.photo.url)}" alt="${firstName} ${lastName}">`
      : `<div class="hero-photo--empty"></div>`}
  </div>
  <div class="hero-text">
    <div class="hero-bar">
      <span class="kit-label">Media Kit · ${year}</span>
      <span class="chq-mark">CreatorHQ</span>
    </div>
    <div class="hero-name fade-up d1">${firstName}<br><em>${lastName}</em></div>
    <div class="hero-rule fade-up d2"></div>
    <div class="hero-descriptor fade-up d2">
      ${esc(role)}${location ? `<br>${esc(location)}` : ''}
    </div>
    ${reachStats.length > 0 ? `
    <div class="hero-reach fade-up d3">
      ${reachStats.slice(0, 3).map(r => `
      <div>
        <div class="reach-num">${esc(r.val)}</div>
        <div class="reach-lbl">${esc(r.lbl)}</div>
      </div>`).join('')}
    </div>` : ''}
  </div>
</header>

<!-- ── BIO ── -->
<section class="bio-section">
  <div class="wrap">
    <div class="bio-inner">
      <div class="bio-sidebar">
        <div class="eyebrow-dark">About</div>
        <div class="bio-title">
          ${creator.tagline
            ? esc(creator.tagline).split(',').map((t, i) => i === 0 ? t.trim() + '.' : `<em>${t.trim()}.</em>`).join('<br>')
            : `${firstName}.<br><em>${lastName}.</em>`}
        </div>
        <div class="bio-rule"></div>
        <div class="bio-sidebar-sub">${esc(role)}${location ? `<br>${esc(location)}` : ''}</div>
      </div>
      <div class="bio-body">
        ${bioParagraphs.length > 0
          ? bioParagraphs.map(p => `<p>${esc(p)}</p>`).join('')
          : `<p>Content creator based in ${esc(location || 'South Africa')}.</p>`}
        ${bioPillars.length > 0 ? `
        <div style="margin-top:3.5rem;">
          ${bioPillars.map((pillar, i) => `
          <div style="padding:1.6rem 0;border-top:1px solid var(--line);${i === bioPillars.length - 1 ? 'border-bottom:1px solid var(--line);' : ''}display:grid;grid-template-columns:160px 1fr;gap:2rem;align-items:start;">
            <div style="font-size:0.64rem;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:var(--smoke);padding-top:0.15rem;">${esc(pillar.label)}</div>
            <div style="font-size:0.84rem;color:var(--dusk);line-height:1.8;">${esc(pillar.text)}</div>
          </div>`).join('')}
        </div>` : ''}
      </div>
    </div>
  </div>
</section>

<!-- ── STATS ── -->
${activePlatforms.length > 0 ? `
<section class="stats-section">
  <div class="wrap">
    <div class="stats-head">
      <div class="eyebrow-light">Social Footprint</div>
      <div class="stats-title">Numbers <em>that move brands.</em></div>
    </div>
    <div class="stats-row stats-row--${activePlatforms.length}col">
      ${activePlatforms.map(p => `
      <div class="stat-cell">
        <div class="stat-platform">${esc(p.name)}</div>
        ${p.handle ? `<div class="stat-handle">${esc(p.handle)}</div>` : ''}
        <div class="stat-big">${esc(p.big)}</div>
        <div class="stat-unit">${esc(p.unit)}</div>
        <div class="stat-sep"></div>
        <div class="stat-sub-val">${esc(p.sub)}</div>
        <div class="stat-sub-lbl">${esc(p.subLbl)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>` : ''}

<!-- ── BRANDS + PACKAGES ── -->
<section class="brands-section">
  <div class="wrap">
    <div class="brands-inner">
      <div>
        <div class="eyebrow-dark">Worked With</div>
        <div class="section-heading">Brands that<br><em>trust the culture.</em></div>
        ${brands.length > 0 ? `
        <div class="brands-list">
          ${brands.map((b, i) => `
          <div class="brand-row" onclick="toggleEvidence(${i})">
            <div>
              <span class="brand-name">${esc(b.name || b.brand)}</span>
              ${b.category || b.note ? `<span class="brand-type" style="margin-left: 0.5rem; color: var(--smoke); font-size: 0.6rem;">${esc(b.category || b.note)}</span>` : ''}
            </div>
            ${b.evidence?.length ? `<span class="eyebrow-dark" style="font-size:0.5rem;opacity:0.5">${b.evidence.length} Clips</span>` : ''}
          </div>
          ${b.evidence?.length ? `
          <div id="evidence-${i}" class="brand-evidence">
            <div class="eyebrow-dark" style="margin-bottom:0.5rem;">Evidence links</div>
            ${b.evidence.map(link => `<a href="${esc(link)}" target="_blank" class="evidence-link">${esc(link)}</a>`).join('')}
          </div>` : ''}`).join('')}
        </div>` : `<p style="margin-top:2rem;font-size:0.84rem;color:var(--dusk);">Add brand collaborations when editing your card.</p>`}
      </div>
      <div>
        <div class="eyebrow-dark">Collaboration Packages</div>
        <div class="section-heading">What we can<br><em>build together.</em></div>
        ${packages.length > 0 ? `
        <div class="rates-stack">
          ${packages.map(p => `
          <div class="rate-pkg${p.highlight ? ' highlight' : ''}">
            <div>
              <div class="rate-pkg__label">${esc(p.name)}</div>
              ${p.description ? `<div class="rate-pkg__note">${esc(p.description).replace(/\n/g, ' · ')}</div>` : ''}
            </div>
            <div class="rate-pkg__price">${esc(p.price)}</div>
          </div>`).join('')}
        </div>` : rateHourly || Object.values(ratePkgs).some(v => v > 0) ? `
        <div class="rates-stack">
          ${rateHourly ? `
          <div class="rate-pkg">
            <div><div class="rate-pkg__label">Hourly Rate</div></div>
            <div class="rate-pkg__price">${esc(fmtCurrency(rateHourly))}</div>
          </div>` : ''}
          ${Object.entries(ratePkgs).filter(([_, v]) => v > 0).map(([k, v]) => `
          <div class="rate-pkg ${k === '3h' ? 'highlight' : ''}">
            <div><div class="rate-pkg__label">${k.toUpperCase()} Shoot</div></div>
            <div class="rate-pkg__price">${esc(fmtCurrency(v))}</div>
          </div>`).join('')}
        </div>` : rates.length > 0 ? `
        <div class="rates-stack">
          ${rates.map((r, i) => `
          <div class="rate-pkg${i === 1 ? ' highlight' : ''}">
            <div>
              <div class="rate-pkg__label">${esc(r.label)}</div>
              ${r.note ? `<div class="rate-pkg__note">${esc(r.note)}</div>` : ''}
            </div>
            <div class="rate-pkg__price">${esc(fmtCurrency(r.amount))}</div>
          </div>`).join('')}
        </div>` : `<p style="margin-top:2rem;font-size:0.84rem;color:var(--dusk);">Add your packages when editing your card.</p>`}
      </div>
    </div>
  </div>
</section>

<!-- ── STANDARD RATES ── -->
${rates.length > 0 ? `
<section class="rates-section">
  <div class="wrap">
    <div class="eyebrow-dark">Standard Rates</div>
    <div class="rates-grid rates-grid--${Math.min(rates.length,4)}col">
      ${rates.map(r => `
      <div class="rate-cell">
        <div class="rate-type">${esc(r.label)}</div>
        <div class="rate-price">${esc(fmtCurrency(r.amount))}</div>
        ${r.note ? `<div class="rate-note">${esc(r.note)}</div>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>` : ''}

<!-- ── AUDIENCE ── -->
${audience ? `
<section class="audience-section">
  <div class="wrap">
    <div class="eyebrow-dark">Who's Watching</div>
    <div class="aud-grid">
      <div class="aud-col">
        <div class="aud-label">Primary Region</div>
        <div class="aud-big">${esc(audience.primaryRegion || 'South Africa')}</div>
        ${audience.locations?.length ? `<div class="aud-locs">${audience.locations.map(l => `<span class="aud-loc">${esc(l)}</span>`).join('')}</div>` : ''}
        ${audience.ageGroup ? `
        <div class="aud-label" style="margin-top:1.5rem;">Core Age Group</div>
        <div class="aud-age">${esc(audience.ageGroup)}</div>
        <div class="aud-age-sub">${esc(audience.ageLabel || '')}</div>` : ''}
      </div>
      <div class="aud-col aud-col--right">
        <div class="aud-label">Audience Interests</div>
        ${audience.interests?.length ? `<div class="aud-tags">${audience.interests.map(t => `<span class="aud-tag">${esc(t)}</span>`).join('')}</div>` : ''}
        ${audience.note ? `<div class="aud-note">${esc(audience.note)}</div>` : ''}
      </div>
    </div>
  </div>
</section>` : ''}

<!-- ── FOOTER ── -->
<footer class="footer">
  <div class="wrap">
    <div class="footer-inner">
      <div>
        <div class="footer-name">${firstName} <em>${lastName}</em></div>
        <div class="footer-desc">${esc(role)}${location ? ` · ${esc(location)}, South Africa` : ''}</div>
      </div>
      <div class="footer-right">
        <div class="footer-cta">Let's build something real.</div>
        ${creator.email ? `<div class="footer-contact">${esc(creator.email)}</div>` : ''}
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-credit">Generated by <span>CreatorHQ</span> · Simulacra ecosystem</div>
      <div class="footer-ts">
        <div class="ts-dot"></div>
        <span id="ts-text"></span>
      </div>
    </div>
  </div>
</footer>
</div>

<!-- ── FLOATING ACTION BAR ── -->
<!--
  Owner-control affordances are stacked left-to-right in order of share-then-edit
  intent: Copy Link first (you came here to share), Edit second (this is your kit,
  here is how to update it), Rate Card third (cross-nav to the other view),
  Download PDF last (the export). On mobile this scrolls horizontally inside the
  pill if needed; on desktop it sits bottom-right of the viewport.
-->
<div id="action-bar">
  <button id="copy-btn" onclick="copyLink()">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
    <span>Copy Link</span>
  </button>
  <div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}/edit" style="display:flex;align-items:center;gap:0.45rem;color:rgba(255,255,255,0.7);text-decoration:none;font-family:'Instrument Sans',sans-serif;font-size:0.7rem;font-weight:400;letter-spacing:0.06em;padding:0.3rem 0.6rem;border-radius:100px;white-space:nowrap;transition:color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    <span>Edit</span>
  </a>
  <div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}/rate-card" style="display:flex;align-items:center;gap:0.45rem;color:rgba(255,255,255,0.7);text-decoration:none;font-family:'Instrument Sans',sans-serif;font-size:0.7rem;font-weight:400;letter-spacing:0.06em;padding:0.3rem 0.6rem;border-radius:100px;white-space:nowrap;transition:color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
    Rate Card →
  </a>
  <div class="bar-divider"></div>
  <button id="pdf-btn" onclick="downloadKitPDF()" style="display:flex;align-items:center;gap:0.45rem;color:rgba(255,255,255,0.7);font-family:'Instrument Sans',sans-serif;font-size:0.7rem;font-weight:400;letter-spacing:0.06em;padding:0.3rem 0.6rem;border-radius:100px;white-space:nowrap;transition:color 0.15s;background:none;border:none;cursor:pointer;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    <span>Download PDF</span>
  </button>
</div>

${renderNudge(creator)}

<script>
  // Timestamp
  function tick() {
    const now = new Date();
    document.getElementById('ts-text').textContent = 'Live · ' + now.toLocaleString('en-ZA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Africa/Johannesburg', timeZoneName: 'short'
    });
  }
  tick();
  setInterval(tick, 60000);

  // Copy link
  function copyLink() {
    const btn = document.getElementById('copy-btn');
    navigator.clipboard.writeText(window.location.href).then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 18 4 13"></polyline></svg><span>Copied</span>';
      setTimeout(() => btn.innerHTML = orig, 2000);
    });
  }

  // PDF is client-side via html2pdf — captures the whole scrollable page as a multi-page A4.
  function downloadKitPDF() {
    const bar = document.getElementById('action-bar');
    bar.style.display = 'none';
    html2pdf().set({
      margin: 0,
      filename: '${firstName}-${lastName}-MediaKit.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#f0ece4' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: ['css', 'legacy'] }
    }).from(document.body).save().then(() => { bar.style.display = 'flex'; });
  }
</script>
</body>
</html>`;
}

// ---- Dedicated PDF Layout (A4, 3-page, Puppeteer-rendered) ----
// This is NOT the web view. Purpose-built for print/email delivery.
// Page 1: Cover — photo + dark panel
// Page 2: Bio + pillars + dark stats strip
// Page 3: Audience + Brands + Packages + Rates + Footer

export function renderPDFHTML(creator, photoBase64 = null) {
  const nameParts = (creator.name || '').trim().split(' ');
  const firstName = esc(nameParts[0] || 'Your');
  const lastName  = esc(nameParts.slice(1).join(' ') || 'Name');
  const role      = creator.niche    || 'Digital Content Creator';
  const subtitle  = creator.subtitle || '';
  const location  = creator.location || '';
  const year      = new Date(creator.createdAt || Date.now()).getFullYear();

  const bioParagraphs = creator.bioParagraphs?.length
    ? creator.bioParagraphs
    : (creator.bio || '').split(/\r?\n/).map(p => p.trim()).filter(Boolean);
  const bioPillars = creator.bioPillars || [];

  const reach = creator.reach || [];

  const fb  = creator.platforms?.facebook  || {};
  const tt  = creator.platforms?.tiktok    || {};
  const ig  = creator.platforms?.instagram || {};

  const statPlatforms = [
    fb.followers ? { name: 'Facebook',  big: fmtNum(fb.followers) + '+', unit: 'Followers', sub: fb.monthlyReach || '—', subLbl: 'Monthly Reach' } : null,
    tt.followers ? { name: 'TikTok',    big: fmtNum(tt.followers) + '+', unit: 'Followers', sub: tt.monthlyReach || '—', subLbl: 'Monthly Reach' } : null,
    ig.followers ? { name: 'Instagram', big: fmtNum(ig.followers) + '+', unit: 'Followers', sub: ig.monthlyReach || '—', subLbl: 'Monthly Reach' } : null,
  ].filter(Boolean);

  const audience = creator.audience || null;
  const brands   = creator.brands?.length
    ? creator.brands.map(b => ({ brand: b.name, note: b.category }))
    : (creator.workPreview || []);
  const packages = creator.packages || [];
  const rates    = creator.rates    || [];

  const photoSrc = photoBase64 || (creator.photo?.url ? esc(creator.photo.url) : '');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    ${localFonts()}

    :root {
      --paper: #f0ece4;
      --sand:  #e6e0d8;
      --smoke: #c4bdb5;
      --dusk:  #6b6460;
      --deep:  #111111;
      --ink:   #0a0a0a;
      --white: #f8f5f0;
      --line:  #d8d2ca;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: var(--paper); }
    body { font-family: 'Instrument Sans', sans-serif; font-weight: 300; font-size: 10pt; line-height: 1.6; color: var(--deep); -webkit-font-smoothing: antialiased; }

    /* ── PAGE CONSTRAINTS ── */
    .page {
      width: 794px;
      height: 1123px;
      overflow: hidden;
      position: relative;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }

    @page { size: A4; margin: 0; }
    @media print { .page { page-break-after: always; } }

    /* ── PAGE 1: COVER ── */
    .cover {
      display: grid;
      grid-template-columns: 365px 1fr;
      height: 1123px;
    }
    .cover__photo {
      width: 365px;
      height: 1123px;
      overflow: hidden;
      background: var(--deep);
    }
    .cover__photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      display: block;
    }
    .cover__panel {
      background: var(--ink);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 48px 44px;
      position: relative;
    }
    .cover__bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      padding: 28px 44px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cover__kit-label {
      font-size: 6pt;
      font-weight: 500;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.09);
      padding: 4px 10px;
      border-radius: 100px;
    }
    .cover__chq {
      font-size: 6pt;
      font-weight: 500;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.13);
    }
    .cover__name {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 52pt;
      line-height: 0.92;
      color: var(--white);
      letter-spacing: -0.01em;
    }
    .cover__name em { font-style: italic; color: rgba(255,255,255,0.3); }
    .cover__rule { width: 20px; height: 1px; background: rgba(255,255,255,0.2); margin: 20px 0 14px; }
    .cover__descriptor {
      font-size: 6pt;
      font-weight: 400;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.28);
      line-height: 2.2;
      margin-bottom: 28px;
    }
    .cover__reach {
      display: flex;
      gap: 24px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }
    .reach-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18pt;
      font-weight: 300;
      color: var(--white);
      line-height: 1;
    }
    .reach-lbl {
      font-size: 5.5pt;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.18);
      margin-top: 4px;
    }

    /* ── PAGE HEADER STRIP (pages 2+) ── */
    .page-header {
      background: var(--deep);
      padding: 14px 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-header__label {
      font-size: 6pt;
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
    }
    .page-header__num {
      font-size: 6pt;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.2);
    }

    /* ── PAGE 2: BIO ── */
    .bio-layout {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 48px;
      padding: 44px 48px;
      background: var(--paper);
    }
    .bio-sidebar__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 26pt;
      font-weight: 300;
      line-height: 1.05;
      color: var(--deep);
      margin-top: 10px;
    }
    .bio-sidebar__title em { font-style: italic; color: var(--dusk); }
    .bio-sidebar__rule { width: 18px; height: 1px; background: rgba(0,0,0,0.15); margin: 14px 0; }
    .bio-sidebar__sub { font-size: 7pt; color: var(--dusk); line-height: 2; }
    .bio-body p { font-size: 8.5pt; color: var(--dusk); line-height: 1.85; margin-bottom: 10px; }
    .pillar {
      padding: 12px 0;
      border-top: 1px solid var(--line);
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: 14px;
      margin-top: 4px;
    }
    .pillar:last-child { border-bottom: 1px solid var(--line); }
    .pillar__label {
      font-size: 5.5pt;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--smoke);
      padding-top: 2px;
    }
    .pillar__text { font-size: 7.5pt; color: var(--dusk); line-height: 1.75; }

    /* ── STATS STRIP (dark, page 2 bottom) ── */
    .stats-strip {
      background: var(--ink);
      padding: 32px 48px;
    }
    .stats-strip__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding-bottom: 18px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      margin-bottom: 0;
    }
    .stats-strip__eyebrow {
      font-size: 5.5pt;
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.2);
    }
    .stats-strip__title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18pt;
      font-weight: 300;
      color: var(--white);
    }
    .stats-strip__title em { font-style: italic; color: rgba(255,255,255,0.22); }
    .stats-cells {
      display: grid;
      gap: 1px;
      background: rgba(255,255,255,0.04);
      margin-top: 1px;
    }
    .stat-cell {
      background: var(--ink);
      padding: 22px 24px;
    }
    .stat-cell__platform {
      font-size: 5.5pt;
      font-weight: 500;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      margin-bottom: 10px;
    }
    .stat-cell__big {
      font-family: 'Cormorant Garamond', serif;
      font-size: 30pt;
      font-weight: 300;
      color: var(--white);
      line-height: 1;
    }
    .stat-cell__unit {
      font-size: 5.5pt;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.18);
      margin-top: 3px;
    }
    .stat-cell__sep { width: 14px; height: 1px; background: rgba(255,255,255,0.07); margin: 12px 0; }
    .stat-cell__sub { font-family: 'Cormorant Garamond', serif; font-size: 11pt; font-weight: 300; color: rgba(255,255,255,0.32); line-height: 1; }
    .stat-cell__sub-lbl { font-size: 5pt; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.13); margin-top: 3px; }

    /* ── PAGE 3: AUDIENCE + RATES ── */
    .audience-section {
      padding: 36px 48px;
      background: var(--sand);
    }
    .aud-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      margin-top: 20px;
    }
    .aud-col { padding-right: 32px; }
    .aud-col + .aud-col { padding-left: 32px; padding-right: 0; border-left: 1px solid var(--smoke); }
    .aud-label {
      font-size: 5.5pt;
      font-weight: 500;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--dusk);
      margin-bottom: 8px;
    }
    .aud-big {
      font-family: 'Cormorant Garamond', serif;
      font-size: 20pt;
      font-weight: 300;
      color: var(--deep);
      line-height: 1.2;
      margin-bottom: 8px;
    }
    .aud-locs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 16px; }
    .aud-loc {
      font-size: 6pt;
      color: var(--dusk);
      border: 1px solid var(--smoke);
      padding: 2px 8px;
      border-radius: 100px;
    }
    .aud-age {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28pt;
      font-weight: 300;
      color: var(--deep);
      line-height: 1;
      margin-top: 12px;
    }
    .aud-age-sub { font-size: 6.5pt; color: var(--dusk); margin-top: 4px; }
    .aud-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
    .aud-tag {
      font-size: 6pt;
      background: rgba(0,0,0,0.07);
      color: var(--deep);
      padding: 2px 8px;
      border-radius: 100px;
    }
    .aud-note { font-size: 7.5pt; color: var(--dusk); line-height: 1.75; margin-top: 14px; }

    /* ── BRANDS + PACKAGES ── */
    .brands-rates {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      padding: 32px 48px;
      background: var(--paper);
    }
    .section-eyebrow {
      font-size: 5.5pt;
      font-weight: 500;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--smoke);
      margin-bottom: 8px;
    }
    .section-heading {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16pt;
      font-weight: 300;
      color: var(--deep);
      line-height: 1.1;
      margin-bottom: 14px;
    }
    .section-heading em { font-style: italic; color: var(--dusk); }
    .brand-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 0;
      border-top: 1px solid var(--line);
    }
    .brand-row:last-child { border-bottom: 1px solid var(--line); }
    .brand-name { font-family: 'Cormorant Garamond', serif; font-size: 12pt; font-weight: 300; color: var(--deep); }
    .brand-type { font-size: 5.5pt; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--smoke); }
    .pkg-stack { display: flex; flex-direction: column; gap: 1px; background: var(--line); }
    .pkg {
      background: var(--paper);
      padding: 12px 14px;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: 8px;
    }
    .pkg.highlight { background: var(--deep); }
    .pkg__name { font-family: 'Cormorant Garamond', serif; font-size: 10pt; font-weight: 300; color: var(--deep); margin-bottom: 3px; }
    .pkg.highlight .pkg__name { color: rgba(255,255,255,0.9); }
    .pkg__desc { font-size: 6pt; color: var(--dusk); line-height: 1.7; }
    .pkg.highlight .pkg__desc { color: rgba(255,255,255,0.4); }
    .pkg__price { font-family: 'Cormorant Garamond', serif; font-size: 11pt; font-weight: 300; color: var(--deep); white-space: nowrap; text-align: right; }
    .pkg.highlight .pkg__price { color: rgba(255,255,255,0.65); }

    /* ── RATES GRID ── */
    .rates-section { padding: 0 48px 24px; background: var(--sand); }
    .rates-grid {
      display: grid;
      gap: 1px;
      background: var(--smoke);
    }
    .rate-cell { background: var(--sand); padding: 16px 14px; }
    .rate-type { font-size: 5.5pt; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dusk); margin-bottom: 8px; }
    .rate-price { font-family: 'Cormorant Garamond', serif; font-size: 16pt; font-weight: 300; color: var(--deep); line-height: 1; }
    .rate-note { font-size: 5.5pt; color: var(--smoke); margin-top: 3px; }

    /* ── FOOTER ── */
    .pdf-footer {
      background: var(--ink);
      padding: 24px 48px 20px;
    }
    .pdf-footer__inner {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
    }
    .pdf-footer__name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18pt;
      font-weight: 300;
      color: var(--white);
      line-height: 1;
    }
    .pdf-footer__name em { font-style: italic; color: rgba(255,255,255,0.22); }
    .pdf-footer__desc { font-size: 6pt; color: rgba(255,255,255,0.18); letter-spacing: 0.08em; margin-top: 6px; }
    .pdf-footer__cta { font-family: 'Cormorant Garamond', serif; font-size: 9pt; font-style: italic; color: rgba(255,255,255,0.45); margin-bottom: 4px; text-align: right; }
    .pdf-footer__contact { font-size: 6pt; color: rgba(255,255,255,0.2); text-align: right; }
    .pdf-footer__bottom {
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      justify-content: space-between;
    }
    .pdf-footer__credit { font-size: 5pt; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.1); }
    .pdf-footer__credit span { color: rgba(255,255,255,0.22); }
    .pdf-footer__date { font-size: 5pt; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.1); }
  </style>
</head>
<body>

<!-- ═══════════════════════════════════════
     PAGE 1 — COVER
════════════════════════════════════════ -->
<div class="page">
  <div class="cover">
    <div class="cover__photo">
      ${photoSrc ? `<img src="${photoSrc}" alt="${firstName} ${lastName}">` : ''}
    </div>
    <div class="cover__panel">
      <div class="cover__bar">
        <span class="cover__kit-label">Media Kit · ${year}</span>
        <span class="cover__chq">CreatorHQ</span>
      </div>
      <div class="cover__name">${firstName}<br><em>${lastName}</em></div>
      <div class="cover__rule"></div>
      <div class="cover__descriptor">
        ${esc(role)}${subtitle ? `<br>${esc(subtitle)}` : ''}${location ? `<br>${esc(location)}` : ''}
      </div>
      ${reach.length > 0 ? `
      <div class="cover__reach">
        ${reach.slice(0, 3).map(r => `
        <div>
          <div class="reach-num">${esc(r.val)}</div>
          <div class="reach-lbl">${esc(r.lbl)}</div>
        </div>`).join('')}
      </div>` : ''}
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════
     PAGE 2 — BIO + STATS
════════════════════════════════════════ -->
<div class="page">
  <div class="page-header">
    <span class="page-header__label">About ${firstName}</span>
    <span class="page-header__num">02 / 03</span>
  </div>

  <div class="bio-layout">
    <div>
      <div style="font-size:5.5pt;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:var(--smoke);">About</div>
      <div class="bio-sidebar__title">
        ${creator.tagline
          ? esc(creator.tagline).split(',').map((t, i) => i === 0 ? `${t.trim()}.` : `<em>${t.trim()}.</em>`).join('<br>')
          : `${firstName}.<br><em>${lastName}.</em>`}
      </div>
      <div class="bio-sidebar__rule"></div>
      <div class="bio-sidebar__sub">
        ${esc(role)}${subtitle ? `<br>${esc(subtitle)}` : ''}
      </div>
    </div>
    <div>
      <div class="bio-body">
        ${bioParagraphs.map(p => `<p>${esc(p)}</p>`).join('')}
      </div>
      ${bioPillars.length > 0 ? `
      <div style="margin-top:16px;">
        ${bioPillars.map(p => `
        <div class="pillar">
          <div class="pillar__label">${esc(p.label)}</div>
          <div class="pillar__text">${esc(p.text)}</div>
        </div>`).join('')}
      </div>` : ''}
    </div>
  </div>

  ${statPlatforms.length > 0 ? `
  <div class="stats-strip">
    <div class="stats-strip__head">
      <span class="stats-strip__eyebrow">Social Footprint</span>
      <span class="stats-strip__title">Numbers <em>that move brands.</em></span>
    </div>
    <div class="stats-cells" style="grid-template-columns:repeat(${statPlatforms.length},1fr);">
      ${statPlatforms.map(p => `
      <div class="stat-cell">
        <div class="stat-cell__platform">${esc(p.name)}</div>
        <div class="stat-cell__big">${esc(p.big)}</div>
        <div class="stat-cell__unit">${esc(p.unit)}</div>
        <div class="stat-cell__sep"></div>
        <div class="stat-cell__sub">${esc(p.sub)}</div>
        <div class="stat-cell__sub-lbl">${esc(p.subLbl)}</div>
      </div>`).join('')}
    </div>
  </div>` : ''}
</div>

<!-- ═══════════════════════════════════════
     PAGE 3 — AUDIENCE + BRANDS + RATES
════════════════════════════════════════ -->
<div class="page">
  <div class="page-header">
    <span class="page-header__label">Audience &amp; Rates</span>
    <span class="page-header__num">03 / 03</span>
  </div>

  ${audience ? `
  <div class="audience-section">
    <div class="aud-grid">
      <div class="aud-col">
        <div class="aud-label">Primary Region</div>
        <div class="aud-big">${esc(audience.primaryRegion || 'South Africa')}</div>
        ${audience.locations?.length ? `<div class="aud-locs">${audience.locations.map(l => `<span class="aud-loc">${esc(l)}</span>`).join('')}</div>` : ''}
        ${audience.ageGroup ? `
        <div class="aud-label" style="margin-top:12px;">Core Age Group</div>
        <div class="aud-age">${esc(audience.ageGroup)}</div>
        <div class="aud-age-sub">${esc(audience.ageLabel || '')}</div>` : ''}
      </div>
      <div class="aud-col">
        <div class="aud-label">Audience Interests</div>
        ${audience.interests?.length ? `<div class="aud-tags">${audience.interests.map(t => `<span class="aud-tag">${esc(t)}</span>`).join('')}</div>` : ''}
        ${audience.note ? `<div class="aud-note">${esc(audience.note)}</div>` : ''}
      </div>
    </div>
  </div>` : ''}

  <div class="brands-rates">
    <div>
      <div class="section-eyebrow">Worked With</div>
      <div class="section-heading">Brands that<br><em>trust the culture.</em></div>
      ${brands.map(b => `
      <div class="brand-row">
        ${b.url
          ? `<a class="brand-name" href="${esc(b.url)}" style="color:inherit;text-decoration:none;border-bottom:1px solid var(--line);">${esc(b.brand)}</a>`
          : `<span class="brand-name">${esc(b.brand)}</span>`}
        <span class="brand-type">${esc(b.note || '')}</span>
      </div>`).join('')}
    </div>
    <div>
      <div class="section-eyebrow">Collaboration Packages</div>
      <div class="section-heading">What we can<br><em>build together.</em></div>
      ${packages.length > 0 ? `
      <div class="pkg-stack">
        ${packages.map(p => `
        <div class="pkg${p.highlight ? ' highlight' : ''}">
          <div>
            <div class="pkg__name">${esc(p.name)}</div>
            ${p.description ? `<div class="pkg__desc">${esc(p.description.replace(/\n/g, ' · '))}</div>` : ''}
          </div>
          <div class="pkg__price">${esc(p.price)}</div>
        </div>`).join('')}
      </div>` : ''}
    </div>
  </div>

  ${rates.length > 0 ? `
  <div class="rates-section">
    <div class="rates-grid" style="grid-template-columns:repeat(${Math.min(rates.length,4)},1fr);">
      ${rates.map(r => `
      <div class="rate-cell">
        <div class="rate-type">${esc(r.label)}</div>
        <div class="rate-price">${esc(fmtCurrency(r.amount))}</div>
        ${r.note ? `<div class="rate-note">${esc(r.note)}</div>` : ''}
      </div>`).join('')}
    </div>
  </div>` : ''}

  <div class="pdf-footer">
    <div class="pdf-footer__inner">
      <div>
        <div class="pdf-footer__name">${firstName} <em>${lastName}</em></div>
        <div class="pdf-footer__desc">${esc(role)}${location ? ` · ${esc(location)}, South Africa` : ''}</div>
      </div>
      <div>
        <div class="pdf-footer__cta">Let's build something real.</div>
        <div class="pdf-footer__contact">${esc(creator.email || creator.contact?.email || '')}</div>
      </div>
    </div>
    <div class="pdf-footer__bottom">
      <div class="pdf-footer__credit">Generated by <span>CreatorHQ</span> · Simulacra ecosystem</div>
      <div class="pdf-footer__date">${new Date().toLocaleDateString('en-ZA', { day:'2-digit', month:'short', year:'numeric', timeZone:'Africa/Johannesburg' })}</div>
    </div>
  </div>
</div>

</body>
</html>`;
}

// ---- Rate Card (clean 1-pager) ----

export function renderRateCardHTML(creator, { justCreated = false, justSaved = false } = {}) {
  // Decay Rule calculation (7-day visual downgrade)
  const statsDate = creator.statsUpdatedAt ? new Date(creator.statsUpdatedAt) : null;
  const daysOld = statsDate ? Math.floor((Date.now() - statsDate) / (1000 * 60 * 60 * 24)) : 0;
  const isDated = daysOld > 7;
  const datedLabel = statsDate ? `Dated (last updated ${statsDate.toLocaleDateString('en-ZA', { day:'numeric', month:'short' })})` : '';

  const nameParts = (creator.name || '').trim().split(' ');
  const firstName = esc(nameParts[0] || 'Your');
  const lastName  = esc(nameParts.slice(1).join(' ') || 'Name');
  const role      = creator.niche    || 'Content Creator';
  const location  = creator.location || '';
  const rates     = creator.customRates || creator.rates || [];
  const rateHourly = creator.rates?.hourly || 0;
  const ratePkgs = creator.rates?.packages || {};
  const packages  = creator.packages || [];
  const ig  = creator.platforms?.instagram || creator.platformsOld?.instagram || {};
  const tt  = creator.platforms?.tiktok    || creator.platformsOld?.tiktok    || {};
  const fb  = creator.platforms?.facebook  || {};

  const platformStats = [
    fb.followers ? `${fmtNum(fb.followers)}+ Facebook` : null,
    tt.followers ? `${fmtNum(tt.followers)}+ TikTok`   : null,
    ig.followers ? `${fmtNum(ig.followers)}+ Instagram` : null,
  ].filter(Boolean);

  const year = new Date(creator.createdAt || Date.now()).getFullYear();

  // Share-preview metadata for the rate card.
  const rcTitle = `${firstName} ${lastName} · Rate Card`;
  const rcDesc = creator.tagline
    || `Rates for ${firstName} ${lastName}. ${creator.role || creator.niche || 'Creator'}.`;
  const rcImage = creator.photo?.url ? absoluteUrl(creator.photo.url) : '';
  const rcUrl = absoluteUrl(`/c/${creator.id}/rate-card`);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${esc(rcTitle)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  ${ogMeta({ title: rcTitle, description: rcDesc, image: rcImage, url: rcUrl, type: 'profile' })}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <meta name="theme-color" content="#0a0a0a">
  <style>${localFonts()}</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{background:#ffffff;color:#0a0a0a;font-family:'Instrument Sans',sans-serif;font-weight:300;font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}
    .page{max-width:760px;margin:0 auto;padding:4rem 4rem 6rem}
    .header{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:2.5rem;border-bottom:2px solid #0a0a0a;margin-bottom:3rem}
    .name{font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:300;line-height:0.92}
    .name em{font-style:italic;color:rgba(0,0,0,0.3)}
    .header-right{text-align:right}
    .label{font-size:0.55rem;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:rgba(0,0,0,0.35)}
    .role-line{font-size:0.8rem;color:rgba(0,0,0,0.5);margin-top:0.3rem}
    .stats-bar{display:flex;gap:2.5rem;padding:1.5rem 0;border-bottom:1px solid rgba(0,0,0,0.1);margin-bottom:3rem}
    .stat-item .num{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:300;line-height:1}
    .stat-item .lbl{font-size:0.52rem;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:rgba(0,0,0,0.3);margin-top:0.2rem}
    .section-label{font-size:0.55rem;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;color:rgba(0,0,0,0.35);margin-bottom:1.2rem}
    .rates-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(0,0,0,0.08);margin-bottom:3rem}
    .rate-cell{background:#fff;padding:1.8rem 1.5rem}
    .rate-type{font-size:0.62rem;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:rgba(0,0,0,0.4);margin-bottom:0.8rem}
    .rate-price{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:300;line-height:1}
    .rate-note{font-size:0.62rem;color:rgba(0,0,0,0.3);margin-top:0.3rem}
    .packages-list{display:flex;flex-direction:column;gap:1px;background:rgba(0,0,0,0.08)}
    .pkg-row{background:#fff;padding:1.2rem 1.5rem;display:flex;justify-content:space-between;align-items:center}
    .pkg-row.highlight{background:#0a0a0a;color:#fff}
    .pkg-name{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:300}
    .pkg-row.highlight .pkg-name{color:rgba(255,255,255,0.9)}
    .pkg-desc{font-size:0.7rem;color:rgba(0,0,0,0.4);margin-top:0.2rem}
    .pkg-row.highlight .pkg-desc{color:rgba(255,255,255,0.4)}
    .pkg-price{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:300;white-space:nowrap}
    .pkg-row.highlight .pkg-price{color:rgba(255,255,255,0.7)}
    .footer{margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(0,0,0,0.1);display:flex;justify-content:space-between;align-items:center}
    .footer-name{font-size:0.6rem;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:rgba(0,0,0,0.3)}
    .footer-contact{font-size:0.6rem;color:rgba(0,0,0,0.3)}
    #action-bar{position:fixed;bottom:2rem;right:2rem;z-index:100;display:flex;align-items:center;background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:100px;padding:0.5rem 0.75rem;box-shadow:0 8px 32px rgba(0,0,0,0.25)}
    #action-bar button,#action-bar a{display:flex;align-items:center;gap:0.4rem;background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.7);font-family:'Instrument Sans',sans-serif;font-size:0.7rem;font-weight:400;letter-spacing:0.06em;padding:0.3rem 0.6rem;border-radius:100px;text-decoration:none;transition:color 0.15s;white-space:nowrap}
    #action-bar button:hover,#action-bar a:hover{color:#fff}
    .bar-divider{width:1px;height:14px;background:rgba(255,255,255,0.12);margin:0 0.25rem}
    @media print{#action-bar{display:none}}
  </style>
</head>
<body class="${isDated ? 'is-dated' : ''}">
${renderSiteHeader({
  current: 'rate-card',
  back: { href: `/c/${esc(creator.id)}`, label: 'Full kit' },
  theme: 'on-light'
})}
${justCreated ? renderCreatedBanner(creator, 'Rate card') : ''}
${(justSaved && !justCreated) ? renderSavedBanner() : ''}
${isDated ? `<div class="dated-badge">${datedLabel}</div>` : ''}
<div class="page">
  <div class="header">
    <div>
      <div class="label">Rate Card · ${year}</div>
      <div class="name" style="margin-top:0.5rem">${firstName}<br><em>${lastName}</em></div>
    </div>
    <div class="header-right">
      <div class="label">CreatorHQ</div>
      <div class="role-line">${esc(role)}${location ? ` · ${esc(location)}` : ''}</div>
    </div>
  </div>

  ${platformStats.length > 0 ? `
  <div class="stats-bar">
    ${platformStats.map(s => `<div class="stat-item"><div class="num">${s.split(' ')[0]}</div><div class="lbl">${s.split(' ').slice(1).join(' ')}</div></div>`).join('')}
  </div>` : ''}

  ${rateHourly || Object.values(ratePkgs).some(v => v > 0) ? `
  <div class="section-label">Collaboration Rates</div>
  <div class="rates-grid" style="grid-template-columns:repeat(${1 + Object.values(ratePkgs).filter(v => v > 0).length},1fr)">
    ${rateHourly ? `
    <div class="rate-cell">
      <div class="rate-type">Hourly Rate</div>
      <div class="rate-price">${esc(fmtCurrency(rateHourly))}</div>
    </div>` : ''}
    ${Object.entries(ratePkgs).filter(([_, v]) => v > 0).map(([k, v]) => `
    <div class="rate-cell">
      <div class="rate-type">${k.toUpperCase()} Shoot</div>
      <div class="rate-price">${esc(fmtCurrency(v))}</div>
    </div>`).join('')}
  </div>` : ''}

  ${rates.length > 0 ? `
  <div class="section-label">Standard Rates</div>
  <div class="rates-grid" style="grid-template-columns:repeat(${Math.min(rates.length,4)},1fr)">
    ${rates.map(r => `
    <div class="rate-cell">
      <div class="rate-type">${esc(r.label)}</div>
      <div class="rate-price">${esc(fmtCurrency(r.amount))}</div>
      ${r.note ? `<div class="rate-note">${esc(r.note)}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${packages.length > 0 ? `
  <div class="section-label">Packages</div>
  <div class="packages-list">
    ${packages.map(p => `
    <div class="pkg-row${p.highlight ? ' highlight' : ''}">
      <div>
        <div class="pkg-name">${esc(p.name)}</div>
        ${p.description ? `<div class="pkg-desc">${esc(p.description.replace(/\n/g,' · '))}</div>` : ''}
      </div>
      <div class="pkg-price">${esc(p.price)}</div>
    </div>`).join('')}
  </div>` : ''}

  <div class="footer">
    <div class="footer-name">${firstName} ${lastName}</div>
    <div class="footer-contact">${esc(creator.email || creator.contact?.email || '')}</div>
  </div>
</div>

<div id="action-bar">
  <button onclick="navigator.clipboard.writeText(window.location.href).then(()=>{this.textContent='Copied';setTimeout(()=>this.textContent='Copy Link',2000)})">Copy Link</button>
  <div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}/edit?rate-card=1">Edit</a>
  <div class="bar-divider"></div>
  <a href="/c/${esc(creator.id)}">← Full Kit</a>
  <div class="bar-divider"></div>
  <button onclick="downloadPDF()">Download PDF</button>
</div>

${renderNudge(creator)}

<script>
function downloadPDF(){
  const bar=document.getElementById('action-bar');
  bar.style.display='none';
  html2pdf().set({
    margin:0,filename:'${firstName}-${lastName}-RateCard.pdf',
    image:{type:'jpeg',quality:0.98},
    html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff'},
    jsPDF:{unit:'mm',format:'a4',orientation:'portrait',compress:true}
  }).from(document.body).save().then(()=>{bar.style.display='flex'});
}
</script>
</body>
</html>`;
}

// ---- Form ----

export function renderFormHTML(creator = null, opts = {}) {
  const c = creator || {};
  // Pre-fill is shape-tolerant: read from locked shape (Khanyi) or extractor shape.
  const ig = c.platforms?.instagram || c.platformsOld?.instagram || {};
  const tt = c.platforms?.tiktok || c.platformsOld?.tiktok || {};
  const yt = c.platforms?.youtube || c.platformsOld?.youtube || {};
  const isEdit = !!c.id;
  const mode = opts.mode === 'rate-card' ? 'rate-card' : 'kit';
  const isRate = mode === 'rate-card';
  const actionUrl = isEdit ? `/c/${c.id}/update` : '/create';
  const productLabel = isRate ? 'Rate Card' : 'Media Kit';
  const pageTitle = `${isEdit ? 'Edit' : 'New'} ${productLabel}`;
  const submitLabel = isRate ? 'Generate rate card' : 'Generate media kit';

  // shape-tolerant pre-fills (Khanyi's locked shape vs extractor shape)
  const nameStr = typeof c.name === 'string' ? c.name : (c.name?.full || '');
  const bioText = typeof c.bio === 'string' ? c.bio : (c.bio?.text || '');
  const bioParagraphs = c.bioParagraphs || c.bio?.paragraphs || [];
  const bioPillars = c.bioPillars || c.bio?.pillars || [];
  const reachArr = c.reach || [];
  const audience = c.audience || {};
  const audAge = Array.isArray(audience.age) ? audience.age : [];
  const audLocs = Array.isArray(audience.locations) ? audience.locations : [];
  const audGender = audience.gender || {};
  const brandsArr = (c.brands || []).map(b => typeof b === 'string' ? { name: b, category: '' } : (b || {}));
  const packagesArr = c.packages || [];
  const contactNote = c.contact?.note || '';
  const contactEmail = c.contact?.email || c.email || '';
  
  const rateHourly = c.rates?.hourly || '';
  const ratePkgs = c.rates?.packages || {};

  // toggle link href — lets users switch form mode without losing where they are
  const toggleHref = isEdit
    ? (isRate ? `/c/${c.id}/edit` : `/c/${c.id}/edit?rate-card=1`)
    : (isRate ? '/new' : '/new?rate-card=1');
  const toggleLabel = isRate ? 'Need the full media kit? →' : 'Just want a rate card? →';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · ${pageTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${headCSS()}
    body { padding: 0 0 96px; background: #ffffff; color: #0a0a0a; }
    .wrap { padding: 32px 24px 0; }
    .wrap { max-width: 720px; margin: 0 auto; }
    h1.display { font-size: 44pt; line-height: 1; margin-bottom: 8px; }
    .lede { color: var(--muted); margin-bottom: 48px; font-size: 12pt; }
    fieldset {
      border: none;
      border-top: 1px solid var(--rule);
      padding: 32px 0;
    }
    legend {
      font-size: 9pt;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #6b6460;
      padding-right: 12px;
    }
    label { display: block; font-size: 10pt; margin-bottom: 6px; color: var(--muted); }
    input[type=text], input[type=email], input[type=number], textarea {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #d8d2ca;
      background: #ffffff;
      font: inherit;
      font-size: 12pt;
      color: #0a0a0a;
      border-radius: 2px;
      margin-bottom: 16px;
    }
    input[type=file] { margin-bottom: 16px; }
    textarea { min-height: 96px; resize: vertical; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .row-3 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; }
    .rate-row, .work-row { display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; margin-bottom: 12px; align-items: start; }
    .work-row { grid-template-columns: 1fr 2fr auto; }
    button {
      font: inherit;
      padding: 10px 14px;
      background: transparent;
      border: 1px solid var(--rule);
      cursor: pointer;
      border-radius: 2px;
    }
    .primary {
      background: var(--black);
      color: var(--paper);
      padding: 16px 28px;
      font-size: 12pt;
      letter-spacing: 0.05em;
      border: none;
    }
    .hint { font-size: 9pt; color: var(--muted); margin-top: -8px; margin-bottom: 16px; }
    .photo-spec {
      padding: 12px 14px;
      background: var(--sand);
      font-size: 9pt;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(10,10,10,0.7);
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  ${renderSiteHeader({
    current: 'form',
    back: isEdit
      ? { href: `/c/${esc(c.id)}`, label: 'Back to my kit' }
      : { href: '/', label: 'Cancel' }
  })}
  <div class="wrap">
    <h1 class="display">${pageTitle}</h1>
    <p class="lede">${isRate
      ? 'A clean one-pager brands can read in 30 seconds. Platforms, rates, contact. Nothing else.'
      : 'The full story. Bio, audience, brands, packages, rates. Designed, shareable, PDF-ready.'}</p>
    <a href="${toggleHref}" style="display:inline-block;margin-bottom:32px;font-size:10pt;color:var(--muted);text-decoration:none;border-bottom:1px solid var(--rule);padding-bottom:2px;">${toggleLabel}</a>

    <form action="${actionUrl}" method="post" enctype="multipart/form-data">
      <input type="hidden" name="mode" value="${mode}" />
      <fieldset>
        <legend>Identity</legend>
        <div class="row">
          <div>
            <label>Full name</label>
            <input name="name" type="text" required value="${esc(nameStr)}" />
          </div>
          <div>
            <label>Primary handle</label>
            <input name="handle" type="text" placeholder="@yourname" value="${esc(c.handle)}" />
          </div>
        </div>
        <div class="row">
          <div>
            <label>Niche / Category</label>
            <input name="niche" type="text" placeholder="e.g. Fashion, Beauty, Lifestyle, Food" value="${esc(c.niche)}" />
          </div>
          <div>
            <label>Location</label>
            <input name="location" type="text" placeholder="e.g. Johannesburg, London" value="${esc(c.location)}" />
          </div>
        </div>
        <label>Tagline</label>
        <input name="tagline" type="text" placeholder="One line that describes you" value="${esc(c.tagline)}" />
        ${!isRate ? `
        <label>Short bio</label>
        <textarea name="bio" placeholder="Two or three sentences. Who you are, who you make for.">${esc(bioText)}</textarea>` : ''}
        <label>Email${isRate ? '' : ' <span class="hint">· optional unless you want a media kit later</span>'}</label>
        <input name="email" type="email" value="${esc(contactEmail)}" />
      </fieldset>

      ${!isRate ? `
      <fieldset>
        <legend>Reach Stats</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Top-of-funnel numbers that summarise your reach. Shown at the top of the media kit. Up to 3.</div>
        <div id="reach-list">
          ${(reachArr.length ? reachArr : [{}, {}, {}]).slice(0, 3).map(r => `
          <div class="row" style="margin-bottom:12px;">
            <input name="reach_value" type="text" placeholder="e.g. 20M+" value="${esc(r.val || r.value || '')}" />
            <input name="reach_label" type="text" placeholder="e.g. FB Monthly Reach" value="${esc(r.lbl || r.label || '')}" />
          </div>`).join('')}
        </div>
      </fieldset>

      <fieldset>
        <legend>Bio · the long form</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Paragraphs that tell your story. Add one paragraph per field.</div>
        <div id="bio-paragraphs">
          ${(bioParagraphs.length ? bioParagraphs : ['']).map(p => `
          <textarea name="bio_paragraph" placeholder="A paragraph of your story" style="margin-bottom:12px;">${esc(typeof p === 'string' ? p : '')}</textarea>`).join('')}
        </div>
        <button type="button" onclick="addBioParagraph()">+ Add paragraph</button>

        <div style="margin-top:24px;">
          <label style="font-size:9pt;letter-spacing:0.2em;text-transform:uppercase;color:#6b6460;margin-bottom:12px;">Content Pillars (up to 2)</label>
          <div class="hint" style="margin-top:0;margin-bottom:16px;">What makes your content distinctive. A label + short description each.</div>
          <div id="pillars-list">
            ${(bioPillars.length ? bioPillars : [{}, {}]).slice(0, 2).map(p => `
            <div style="margin-bottom:16px;">
              <input name="pillar_label" type="text" placeholder="Pillar name (e.g. Authentic Storytelling)" value="${esc(typeof p === 'object' ? (p.label || '') : (p || ''))}" />
              <textarea name="pillar_text" placeholder="Why it matters" style="min-height:60px;">${esc(typeof p === 'object' ? (p.text || '') : '')}</textarea>
            </div>`).join('')}
          </div>
        </div>
      </fieldset>
      ` : ''}

      <fieldset>
        <legend>Cover photo</legend>
        <div class="photo-spec">Slot: 365 × 1123 px · portrait, full bleed</div>
        <input name="photo" type="file" accept="image/*" />
        <div class="hint">If your image isn't exactly this ratio, it'll be centre-cropped to fit.</div>
      </fieldset>

      <fieldset>
        <legend>Instagram</legend>
        <div class="row-3">
          <div>
            <label>Handle</label>
            <input name="ig_handle" type="text" value="${esc(ig.handle)}" />
          </div>
          <div>
            <label>Followers</label>
            <input name="ig_followers" type="number" min="0" value="${ig.followers || ''}" />
          </div>
          <div>
            <label>Engagement %</label>
            <input name="ig_engagement" type="number" step="0.1" min="0" value="${ig.engagement || ''}" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>TikTok</legend>
        <div class="row-3">
          <div>
            <label>Handle</label>
            <input name="tt_handle" type="text" value="${esc(tt.handle)}" />
          </div>
          <div>
            <label>Followers</label>
            <input name="tt_followers" type="number" min="0" value="${tt.followers || ''}" />
          </div>
          <div>
            <label>Engagement %</label>
            <input name="tt_engagement" type="number" step="0.1" min="0" value="${tt.engagement || ''}" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>YouTube</legend>
        <div class="row-3">
          <div>
            <label>Channel handle / URL</label>
            <input name="yt_handle" type="text" placeholder="@yourchannel" value="${esc(yt.handle)}" />
          </div>
          <div>
            <label>Subscribers</label>
            <input name="yt_followers" type="number" min="0" value="${yt.followers || ''}" />
          </div>
          <div>
            <label>Avg views / video</label>
            <input name="yt_avg_views" type="number" min="0" value="${yt.avgViews || ''}" />
          </div>
        </div>
      </fieldset>

      ${!isRate ? `
      <fieldset>
        <legend>Audience</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Who's watching. Gender split, age ranges, top locations. Brands use this to qualify fit.</div>
        <label style="font-size:9pt;letter-spacing:0.2em;text-transform:uppercase;color:#6b6460;">Gender split (%)</label>
        <div class="row" style="margin-top:6px;">
          <div>
            <label>Male</label>
            <input name="audience_male" type="text" placeholder="e.g. 40" value="${esc(audGender.male || '')}" />
          </div>
          <div>
            <label>Female</label>
            <input name="audience_female" type="text" placeholder="e.g. 60" value="${esc(audGender.female || '')}" />
          </div>
        </div>

        <label style="font-size:9pt;letter-spacing:0.2em;text-transform:uppercase;color:#6b6460;margin-top:16px;">Age ranges</label>
        <div id="age-list">
          ${(audAge.length ? audAge : [{}, {}]).slice(0, 4).map(a => `
          <div class="row" style="margin-bottom:8px;">
            <input name="audience_age_range" type="text" placeholder="e.g. 18–24" value="${esc(a.range || '')}" />
            <input name="audience_age_pct" type="text" placeholder="%" value="${esc(a.percentage || '')}" />
          </div>`).join('')}
        </div>
        <button type="button" onclick="addAgeRange()">+ Add age range</button>

        <label style="font-size:9pt;letter-spacing:0.2em;text-transform:uppercase;color:#6b6460;margin-top:16px;">Top locations</label>
        <div id="loc-list">
          ${(audLocs.length ? audLocs : [{}, {}, {}]).slice(0, 5).map(l => {
            const locName = typeof l === 'string' ? l : (l.name || '');
            const locPct = typeof l === 'string' ? '' : (l.percentage || '');
            return `
          <div class="row" style="margin-bottom:8px;">
            <input name="audience_location" type="text" placeholder="e.g. Gauteng" value="${esc(locName)}" />
            <input name="audience_location_pct" type="text" placeholder="% (optional)" value="${esc(locPct)}" />
          </div>`;
          }).join('')}
        </div>
        <button type="button" onclick="addLocation()">+ Add location</button>
      </fieldset>
      ` : ''}

      <fieldset>
        <legend>Rates</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Label each deliverable clearly. Brands will read this line verbatim. Not sure what to charge? <a href="/calculator" style="color:var(--black);text-decoration:underline;">Try the rate calculator →</a></div>

        <div id="rates">
          <div class="row" style="margin-bottom:1.5rem">
            <div>
              <label>Hourly Rate (R/hr)</label>
              <input name="rate_hourly" type="number" min="0" value="${rateHourly}" placeholder="e.g. 500" />
            </div>
          </div>
          <div class="row" style="margin-bottom:1.5rem">
            <div>
              <label>3hr Package (R)</label>
              <input name="rate_3h" type="number" min="0" value="${ratePkgs['3h'] || ''}" placeholder="e.g. 1200" />
            </div>
            <div>
              <label>4hr Package (R)</label>
              <input name="rate_4h" type="number" min="0" value="${ratePkgs['4h'] || ''}" placeholder="e.g. 1800" />
            </div>
            <div>
              <label>8hr (Full Day) (R)</label>
              <input name="rate_8h" type="number" min="0" value="${ratePkgs['8h'] || ''}" placeholder="e.g. 3500" />
            </div>
          </div>

          <div style="margin-top:2rem; font-size: 0.75rem; color: var(--muted); border-top: 1px dotted var(--rule); padding-top: 1.5rem;">Custom Rates (optional)</div>
          ${(c.customRates || []).map(r => `
          <div class="rate-row">
            <input name="rate_label" type="text" placeholder="e.g. Branded Story" value="${esc(r.label)}" />
            <input name="rate_amount" type="number" min="0" placeholder="Amount" value="${r.amount}" />
            <button type="button" onclick="this.parentElement.remove()">Remove</button>
            <input name="rate_note" type="text" placeholder="Note (optional)" value="${esc(r.note || '')}" style="grid-column:1 / -1; margin-top:-4px;" />
          </div>`).join('')}
        </div>
        <button type="button" onclick="addRate()">+ Add more custom rates</button>
      </fieldset>

      ${!isRate ? `
      <fieldset>
        <legend>Selected Work</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Past brand work. Justifies the rate in a brand meeting.</div>
        <div id="works">
          ${(c.workPreview || []).map(w => `
          <div class="work-row">
            <input name="work_brand" type="text" placeholder="Brand" value="${esc(w.brand)}" />
            <input name="work_note" type="text" placeholder="What you did / the result" value="${esc(w.note)}" />
            <button type="button" onclick="this.parentElement.remove()">Remove</button>
          </div>`).join('')}
          ${(!c.workPreview || c.workPreview.length === 0) ? `
          <div class="work-row">
            <input name="work_brand" type="text" placeholder="Brand" />
            <input name="work_note" type="text" placeholder="What you did / the result" />
            <button type="button" onclick="this.parentElement.remove()">Remove</button>
          </div>` : ''}
        </div>
        <button type="button" onclick="addWork()">+ Add work</button>
      </fieldset>

      <fieldset>
        <legend>Brands & Evidence</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Brands you've worked with. Add up to 3 evidence URLs (refernce clips, campaign links) per brand to build trust.</div>
        <div id="brands-list">
          ${(brandsArr.length ? brandsArr : [{}, {}, {}]).slice(0, 8).map((b, i) => `
          <div style="margin-bottom:24px; padding:16px; border:1px solid var(--rule); border-radius:2px;">
            <div class="row">
              <input name="brand_name" type="text" placeholder="Brand name (e.g. Google)" value="${esc(b.name || '')}" />
              <input name="brand_category" type="text" placeholder="Category (e.g. Tech)" value="${esc(b.category || '')}" />
            </div>
            <div style="margin-top:12px;">
              <label>Evidence / Reference Links (Up to 3)</label>
              <input name="brand_${i}_evidence_0" type="text" placeholder="https://..." value="${esc(b.evidence?.[0] || '')}" style="margin-bottom:8px;" />
              <input name="brand_${i}_evidence_1" type="text" placeholder="https://..." value="${esc(b.evidence?.[1] || '')}" style="margin-bottom:8px;" />
              <input name="brand_${i}_evidence_2" type="text" placeholder="https://..." value="${esc(b.evidence?.[2] || '')}" style="margin-bottom:0;" />
            </div>
            <button type="button" onclick="this.parentElement.remove()" style="margin-top:12px; font-size:0.7rem;">Remove Brand</button>
          </div>`).join('')}
        </div>
        <button type="button" onclick="addBrand()">+ Add brand</button>
      </fieldset>

      <fieldset>
        <legend>Packages</legend>
        <div class="hint" style="margin-top:0;margin-bottom:16px;">Structured offerings. Up to 3. Mark one as highlighted to feature it.</div>
        <div id="packages-list">
          ${(packagesArr.length ? packagesArr : [{}, {}, {}]).slice(0, 3).map((p, i) => `
          <div style="margin-bottom:20px;padding:16px;border:1px solid var(--rule);border-radius:2px;">
            <div class="row">
              <div>
                <label>Package name</label>
                <input name="package_name" type="text" placeholder="e.g. Basic Campaign" value="${esc(p.name || '')}" />
              </div>
              <div>
                <label>Price</label>
                <input name="package_price" type="text" placeholder="e.g. R50,000 or POA" value="${esc(p.price || '')}" />
              </div>
            </div>
            <label>Description</label>
            <textarea name="package_desc" placeholder="What's included. One bullet per line.">${esc(p.description || '')}</textarea>
            <label style="display:inline-flex;align-items:center;gap:8px;font-size:10pt;margin-top:4px;">
              <input name="package_highlight" type="checkbox" value="${i}" ${p.highlight ? 'checked' : ''} />
              Highlight this package
            </label>
          </div>`).join('')}
        </div>
      </fieldset>

      <fieldset>
        <legend>Contact</legend>
        <label>Contact note <span class="hint">· shown next to email on the kit</span></label>
        <textarea name="contact_note" placeholder="e.g. For campaign briefs and partnership proposals reach out to discuss your brand goals">${esc(contactNote)}</textarea>
      </fieldset>
      ` : ''}

      <div style="margin-top:32px;">
        <button class="primary" type="submit">${submitLabel}</button>
      </div>
    </form>
  </div>

  <script>
    function addRate(label = '', amount = '') {
      const wrap = document.getElementById('rates');
      const row = document.createElement('div');
      row.className = 'rate-row';
      row.innerHTML = '<input name="rate_label" type="text" placeholder="e.g. TikTok Video" value="' + label + '" />' +
        '<input name="rate_amount" type="number" min="0" placeholder="Amount" value="' + amount + '" />' +
        '<button type="button" onclick="this.parentElement.remove()">Remove</button>' +
        '<input name="rate_note" type="text" placeholder="Note (optional). e.g. incl. usage rights" style="grid-column:1 / -1; margin-top:-4px;" />';
      wrap.appendChild(row);
    }
    function addWork() {
      const wrap = document.getElementById('works');
      const row = document.createElement('div');
      row.className = 'work-row';
      row.innerHTML = '<input name="work_brand" type="text" placeholder="Brand" />' +
        '<input name="work_note" type="text" placeholder="What you did / the result" />' +
        '<button type="button" onclick="this.parentElement.remove()">Remove</button>';
      wrap.appendChild(row);
    }
    function addBioParagraph() {
      const wrap = document.getElementById('bio-paragraphs');
      if (!wrap) return;
      const t = document.createElement('textarea');
      t.name = 'bio_paragraph';
      t.placeholder = 'A paragraph of your story';
      t.style.marginBottom = '12px';
      wrap.appendChild(t);
    }
    function addAgeRange() {
      const wrap = document.getElementById('age-list');
      if (!wrap) return;
      const row = document.createElement('div');
      row.className = 'row';
      row.style.marginBottom = '8px';
      row.innerHTML = '<input name="audience_age_range" type="text" placeholder="e.g. 25–34" />' +
        '<input name="audience_age_pct" type="text" placeholder="%" />';
      wrap.appendChild(row);
    }
    function addLocation() {
      const wrap = document.getElementById('loc-list');
      if (!wrap) return;
      const row = document.createElement('div');
      row.className = 'row';
      row.style.marginBottom = '8px';
      row.innerHTML = '<input name="audience_location" type="text" placeholder="e.g. Cape Town" />' +
        '<input name="audience_location_pct" type="text" placeholder="% (optional)" />';
      wrap.appendChild(row);
    }
    function addBrand() {
      const wrap = document.getElementById('brands-list');
      if (!wrap) return;
      const i = wrap.children.length;
      const div = document.createElement('div');
      div.style.marginBottom = '24px';
      div.style.padding = '16px';
      div.style.border = '1px solid var(--rule)';
      div.style.borderRadius = '2px';
      div.innerHTML = \`
        <div class="row">
          <input name="brand_name" type="text" placeholder="Brand name" />
          <input name="brand_category" type="text" placeholder="Category" />
        </div>
        <div style="margin-top:12px;">
          <label>Evidence / Reference Links (Up to 3)</label>
          <input name="brand_\${i}_evidence_0" type="text" placeholder="https://..." style="margin-bottom:8px;" />
          <input name="brand_\${i}_evidence_1" type="text" placeholder="https://..." style="margin-bottom:8px;" />
          <input name="brand_\${i}_evidence_2" type="text" placeholder="https://..." style="margin-bottom:0;" />
        </div>
        <button type="button" onclick="this.parentElement.remove()" style="margin-top:12px; font-size:0.7rem;">Remove Brand</button>
      \`;
      wrap.appendChild(div);
    }

    function toggleEvidence(i) {
      const el = document.getElementById('evidence-' + i);
      if (el) el.classList.toggle('visible');
    }

  </script>
</body>
</html>`;
}

function renderNudge(creator) {
  // Logic: Only show if the profile is not yet linked to an owner (draft) 
  // and we are NOT in the middle of a signup flow.
  if (creator.owner_id) return '';

  return `
    <div class="nudge">
      <div class="nudge__content">
        <div class="nudge__icon">✨</div>
        <div class="nudge__text">
          <strong>Save your profile</strong>
          <span>Lock this link to your account to edit it from anywhere and see who's viewed it.</span>
        </div>
      </div>
      <div class="nudge__actions">
        <button class="nudge__btn" onclick="openAuthModal()">Save Now</button>
      </div>
    </div>
    
    <div id="auth-modal" class="modal" style="display:none;">
      <div class="modal__overlay" onclick="closeAuthModal()"></div>
      <div class="modal__content">
        <button class="modal__close" onclick="closeAuthModal()">×</button>
        <div class="modal__header">
          <h2>Save your profile</h2>
          <p>Choose how you'd like to sign in. We'll link this ${creator.name ? 'to your account' : 'kit to you'}.</p>
        </div>
        
        <div class="modal__body">
          <button class="auth-btn auth-btn--google" onclick="loginWithGoogle()">
            <img src="https://www.google.com/favicon.ico" width="16" height="16" alt="Google">
            Continue with Google
          </button>
          
          <div class="auth-divider"><span>or use email / whatsapp</span></div>
          
          <div class="auth-group">
            <input type="text" id="auth-identifier" placeholder="Email or WhatsApp number" class="auth-input">
            <button class="auth-btn auth-btn--primary" id="auth-submit" onclick="requestOTP()">Send Magic Link / OTP</button>
          </div>
          
          <div id="otp-group" style="display:none; margin-top:20px;">
            <p style="font-size:0.8rem; margin-bottom:12px; color:rgba(0,0,0,0.6);">Check your messages! Enter the 6-digit code below:</p>
            <input type="text" id="auth-otp" placeholder="000 000" class="auth-input" style="text-align:center; letter-spacing:0.5em; font-weight:700;">
            <button class="auth-btn auth-btn--primary" onclick="verifyOTP()">Verify & Save</button>
          </div>
          
          <p id="auth-error" style="display:none; color:#e11d48; font-size:0.8rem; margin-top:12px;"></p>
        </div>
        
        <div class="modal__footer">
          By continuing, you agree to CreatorHQ's terms of service.
        </div>
      </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="/login.js"></script>
  `;
}

// ---- Landing Page ----

export function renderLandingHTML() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · Media Kits for African Creators</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${ogMeta({
    title: 'CreatorHQ · Media Kits for African Creators',
    description: 'Build a designed, data-backed media kit and rate card. Share a permanent link. Download a PDF. No signup needed.',
    image: absoluteUrl('/og-default.png'),
    url: absoluteUrl('/'),
    type: 'website'
  })}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#0a0a0a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="CreatorHQ">
  <style>
    ${localFonts()}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      background: #0a0a0a;
      color: #f8f5f0;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 300;
      font-size: 15px;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    /* noise overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.35;
      pointer-events: none;
      z-index: 0;
    }

    .nav {
      position: relative;
      z-index: 1;
      padding: 2.5rem 4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .nav__logo {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
    }
    .nav__tag {
      font-size: 0.58rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 0.3rem 0.75rem;
      border-radius: 100px;
    }

    .hero {
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 8rem 4rem 6rem;
      max-width: 1100px;
      margin: 0 auto;
      width: 100%;
    }
    .hero__eyebrow {
      font-size: 0.58rem;
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.2);
      margin-bottom: 2.5rem;
    }
    .hero__title {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: clamp(3.5rem, 7vw, 7rem);
      line-height: 0.92;
      letter-spacing: -0.02em;
      color: #f8f5f0;
      margin-bottom: 2.5rem;
      max-width: 14ch;
    }
    .hero__title em {
      font-style: italic;
      color: rgba(248,245,240,0.3);
    }
    .hero__rule { width: 32px; height: 1px; background: rgba(255,255,255,0.15); margin-bottom: 2rem; }
    .hero__sub {
      font-size: 1rem;
      color: rgba(255,255,255,0.35);
      max-width: 44ch;
      line-height: 1.8;
      margin-bottom: 3.5rem;
    }
    .hero__cta {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: #f8f5f0;
      color: #0a0a0a;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-decoration: none;
      padding: 1rem 2rem;
      border-radius: 100px;
      transition: opacity 0.2s;
      width: fit-content;
    }
    .hero__cta:hover { opacity: 0.88; }
    .hero__cta svg { flex-shrink: 0; }

    /* CTA cluster: primary (Media Kit) + secondary (Rate Card) + small link (Calculator) */
    .hero__cta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.9rem;
      margin-bottom: 1.5rem;
    }
    .hero__cta--ghost {
      background: transparent;
      color: rgba(248,245,240,0.9);
      border: 1px solid rgba(255,255,255,0.18);
    }
    .hero__cta--ghost:hover { background: rgba(255,255,255,0.04); opacity: 1; }
    .hero__calc {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 400;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      text-decoration: none;
      transition: color 0.2s;
    }
    .hero__calc:hover { color: rgba(255,255,255,0.75); }

    .proof {
      position: relative;
      z-index: 1;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding: 4rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: rgba(255,255,255,0.04);
      max-width: 1100px;
      margin: 0 auto;
      width: 100%;
    }
    .proof__item {
      background: #0a0a0a;
      padding: 2.5rem 2rem;
    }
    .proof__num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.8rem;
      font-weight: 300;
      color: #f8f5f0;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .proof__num em { font-style: italic; color: rgba(248,245,240,0.25); }
    .proof__label {
      font-size: 0.62rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.2);
    }
    .proof__desc {
      font-size: 0.82rem;
      color: rgba(255,255,255,0.3);
      line-height: 1.7;
      margin-top: 1rem;
    }

    .foot {
      position: relative;
      z-index: 1;
      padding: 2.5rem 4rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .foot__credit { font-size: 0.52rem; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(255,255,255,0.1); }
    .foot__credit span { color: rgba(255,255,255,0.22); }
    .foot__link { font-size: 0.52rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.15); text-decoration: none; }
    .foot__link:hover { color: rgba(255,255,255,0.35); }

    @media (max-width: 720px) {
      .nav { padding: 1.5rem; }
      .hero { padding: 5rem 1.5rem 4rem; }
      .hero__title { font-size: 3.5rem; }
      .proof { grid-template-columns: 1fr; padding: 0; }
      .foot { flex-direction: column; gap: 0.8rem; padding: 2rem 1.5rem; }
    }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: 'landing' })}

  <main class="hero">
    <div class="hero__eyebrow">For African Creators</div>
    <h1 class="hero__title">Your kit.<br><em>Your rate.<br>Your terms.</em></h1>
    <div class="hero__rule"></div>
    <p class="hero__sub">Build a media kit that opens doors. Walk into brand meetings with a designed, data-backed rate card and a PDF you can send tonight.</p>
    <div class="hero__cta-row">
      <a href="/new?rate-card=1" class="hero__cta">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        Get my rate card
      </a>
      <a href="/new" class="hero__cta hero__cta--ghost">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Build my media kit
      </a>
    </div>
    <a href="/calculator" class="hero__calc">
      Not sure what to charge? Calculate my rate →
    </a>
  </main>

  <section class="proof">
    <div class="proof__item">
      <div class="proof__num">Media <em>Kit</em></div>
      <div class="proof__label">Not just a rate card</div>
      <div class="proof__desc">A full scrollable page. Your story, your numbers, your brands, your rates. Shareable link. PDF on demand.</div>
    </div>
    <div class="proof__item">
      <div class="proof__num">ZAR <em>Rates</em></div>
      <div class="proof__label">Built for South Africa</div>
      <div class="proof__desc">Built-in calculator uses your actual follower and engagement data to generate baseline SA rates. No guessing.</div>
    </div>
    <div class="proof__item">
      <div class="proof__num">Live <em>Link</em></div>
      <div class="proof__label">Always up to date</div>
      <div class="proof__desc">Your kit lives at a permanent link. Update your numbers any time. Brands always see your latest self.</div>
    </div>
  </section>

  ${renderTrustStrip()}

  <footer class="foot">
    <div class="foot__credit">Built by <span>CreatorHQ</span> · Simulacra ecosystem</div>
    <a href="/new" class="foot__link">Get started →</a>
  </footer>
</body>
</html>`;
}

// ---- Calculator Page ----

export function renderCalculatorHTML() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CreatorHQ · Rate Wizard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${localFonts()}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #f0ece4;
      color: #0a0a0a;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 300;
      font-size: 15px;
      line-height: 1.65;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .wrap { max-width: 640px; margin: 0 auto; padding: 4rem 1.5rem 6rem; }
    .eyebrow { font-size: 0.62rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(10,10,10,0.45); margin-bottom: 1rem; }
    h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: clamp(2.5rem, 6vw, 4rem); line-height: 1; letter-spacing: -0.02em; margin-bottom: 3rem; }
    h1 em { font-style: italic; color: rgba(10,10,10,0.35); }
    
    .wizard-step { display: none; animation: fadeIn 0.4s ease-out; }
    .wizard-step.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .card { background: #fff; padding: 2.5rem; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    .platform-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #0a0a0a; margin-bottom: 1.5rem; display: block; }
    .stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; color: rgba(10,10,10,0.55); margin-bottom: 0.5rem; }
    input[type="number"], select { width: 100%; padding: 0.85rem 1rem; border: 1px solid rgba(0,0,0,0.1); background: #fff; font: inherit; font-size: 1rem; border-radius: 4px; }
    
    .btn-row { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn { font: inherit; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 1.1rem 2.2rem; border-radius: 100px; cursor: pointer; text-decoration: none; border: none; transition: all 0.2s; }
    .btn--primary { background: #0a0a0a; color: #fff; }
    .btn--ghost { background: transparent; color: #0a0a0a; border: 1px solid rgba(0,0,0,0.15); }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

    .result-panel { background: #0a0a0a; color: #fff; padding: 3rem; border-radius: 4px; }
    .res-head { font-family: 'Cormorant Garamond', serif; font-size: 4rem; line-height: 1; margin-bottom: 0.5rem; }
    .res-sub { font-size: 0.9rem; color: rgba(255,255,255,0.4); margin-bottom: 2rem; }
    .res-breakdown { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; }
    .break-row { display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .break-l { font-size: 0.85rem; color: rgba(255,255,255,0.6); }
    .break-v { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; }
  </style>
</head>
<body>
  ${renderSiteHeader({ current: 'calculator', back: { href: '/', label: 'Home' } })}
  <div class="wrap">
    <div class="eyebrow">Rate Wizard</div>
    <h1 id="wiz-title">Step 1: <em>Metrics.</em></h1>

    <div id="step-1" class="wizard-step active">
      <div class="card">
        <span class="platform-label">Instagram Baseline</span>
        <div class="stat-row">
          <div><label>Followers</label><input type="number" id="ig_f" placeholder="0"></div>
          <div><label>Engagement %</label><input type="number" id="ig_e" step="0.1" placeholder="0.0"></div>
        </div>
        <span class="platform-label">TikTok Baseline</span>
        <div class="stat-row">
          <div><label>Followers</label><input type="number" id="tt_f" placeholder="0"></div>
          <div><label>Engagement %</label><input type="number" id="tt_e" step="0.1" placeholder="0.0"></div>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn--primary" onclick="next(2)">Next Step →</button>
      </div>
    </div>

    <div id="step-2" class="wizard-step">
      <div class="card">
        <span class="platform-label">YouTube & Quality</span>
        <div class="stat-row">
          <div><label>Subscribers</label><input type="number" id="yt_s" placeholder="0"></div>
          <div><label>Avg Views</label><input type="number" id="yt_v" placeholder="0"></div>
        </div>
        <label>Audience Niche Fit</label>
        <select id="niche_fit">
          <option value="standard">Standard / General</option>
          <option value="high">High Affinity / Tight Niche</option>
          <option value="premium">Premium / Luxury / Specialist</option>
        </select>
      </div>
      <div class="btn-row">
        <button class="btn btn--ghost" onclick="next(1)">← Back</button>
        <button class="btn btn--primary" onclick="calculate()">See Results</button>
      </div>
    </div>

    <div id="step-3" class="wizard-step">
      <div class="result-panel">
        <div class="eyebrow" style="color:rgba(255,255,255,0.4)">Defensible Baseline</div>
        <div class="res-head">R<span id="res-val">0</span></div>
        <div class="res-sub">Estimated per branded asset (Lead platform: <span id="res-lead">...</span>)</div>
        
        <div class="res-breakdown" id="res-break"></div>

        <div style="margin-top:2.5rem; display:flex; gap:1rem;">
          <a id="cta-card" href="/new?rate-card=1" class="btn btn--primary" style="background:#fff; color:#000;">Build Rate Card</a>
          <a href="/new" class="btn btn--ghost" style="color:#fff; border-color:rgba(255,255,255,0.2)">Full Kit</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    function next(s) {
      document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
      document.getElementById('step-' + s).classList.add('active');
      const titles = ['Metrics.', 'Niche & Fit.', 'Results.'];
      document.getElementById('wiz-title').innerHTML = 'Step ' + s + ': <em>' + titles[s-1] + '</em>';
    }

    async function calculate() {
      const payload = {
        ig: { followers: Number(document.getElementById('ig_f').value), engagement: Number(document.getElementById('ig_e').value) },
        tt: { followers: Number(document.getElementById('tt_f').value), engagement: Number(document.getElementById('tt_e').value) },
        yt: { subscribers: Number(document.getElementById('yt_s').value), avgViews: Number(document.getElementById('yt_v').value) },
        nicheFit: document.getElementById('niche_fit').value
      };

      const res = await fetch('/api/calculate/overall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.error) { alert(json.error); return; }

      document.getElementById('res-val').textContent = Number(json.baseline).toLocaleString('en-ZA');
      document.getElementById('res-lead').textContent = json.leadPlatform || '...';
      
      const breakEl = document.getElementById('res-break');
      breakEl.innerHTML = '';
      (json.breakdown || []).forEach(b => {
        breakEl.innerHTML += \`<div class="break-row"><div class="break-l">\${b.platform}</div><div class="break-v">R\${Number(b.suggested).toLocaleString('en-ZA')}</div></div>\`;
      });

      const params = new URLSearchParams({ 'rate-card': '1', 'seed_rate': json.baseline });
      document.getElementById('cta-card').href = '/new?' + params.toString();
      
      next(3);
    }
  </script>
</body>
</html>`;
}
