# Creator-HQ

Designed, shareable media kits for creators. Express SSR, JSON-on-disk, client-side PDF.

The pivot from the [beat-bash-hq](https://github.com/Mowngezi/beat-bash-hq) marketplace experiment, doubling down on the one piece that resonated: a creator's owned shopfront that brands can land on, read in 30 seconds, and book from.

## Stack

- Node 18+, ES modules
- Express + multer + cookie-parser + jsonwebtoken
- Storage: Supabase first, filesystem fallback (env-flagged disk-only mode for the pilot)
- PDF: client-side via html2pdf.js (no headless browser, no Chrome download)
- Auth: feature-flagged. Off by default. WhatsApp OTP path stubbed pending real OTP storage.

## Quickstart

```bash
git clone git@github.com:Mowngezi/Creator-HQ.git
cd Creator-HQ
npm install
cp .env.example .env
# edit .env: at minimum set SESSION_SECRET (openssl rand -hex 32)
node --env-file=.env server.js
```

Server boots on `http://localhost:3001`.

- `/` — landing
- `/new` — create a new kit
- `/c/<id>` — public media kit (shareable URL)
- `/c/<id>/rate-card` — public rate card 1-pager
- `/c/<id>/edit` — edit form (no auth in pilot mode)
- `/healthz` — host healthcheck

## Deploy modes

### Disk-only (pilot — recommended for Railway with persistent volume)

```
NODE_ENV=production
SESSION_SECRET=<openssl rand -hex 32>
SITE_URL=https://your-domain
CREATORHQ_DISABLE_SUPABASE=true
# CREATORHQ_AUTH_ENABLED unset — auth ships off in the pilot
```

Mount a persistent volume at the project root so `data/` and `uploads/` survive redeploys.

### Hybrid (Supabase + disk fallback)

Same as above but omit `CREATORHQ_DISABLE_SUPABASE` and provide:

```
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
SUPABASE_PUBLISHABLE_KEY=...
```

Reads + writes try Supabase first (with a 2s timeout) and fall through to disk on any unreachable error.

## Auth (currently off)

Set `CREATORHQ_AUTH_ENABLED=true` only after these prerequisites:

1. Real WhatsApp OTP storage. The current verify path returns 503 by design until OTPs are persisted and validated.
2. `SESSION_SECRET` rotated. The dev fallback throws in production.
3. Email magic-link path tested end-to-end against a live Supabase project.

## Doctrine

- No em dashes in user-facing copy. Periods, colons, commas, middots.
- Khanyi's seed (`data/KhKumalo.json`) is the locked design reference. New creator records must round-trip through the same renderer without 500s.
- All `/c/:id` routes wrapped in try/catch. Process-level `unhandledRejection` and `uncaughtException` handlers exist so a single async failure can't kill the box.
- Filesystem fallback is the default for ops simplicity. Migrate to managed storage when there's a real reason (cross-region readers, hot CDN, second host).

## Origin

Born inside [Mowngezi/Nolwazi](https://github.com/Mowngezi/Nolwazi) at `projects/creatorhq-pilot-v2/`. Split out 2026-05-01 for cleaner deploys, scoped permissions, and an honest single-purpose history.
