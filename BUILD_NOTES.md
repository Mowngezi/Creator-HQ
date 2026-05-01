# CreatorHQ — Build 01 Notes

## What's in this folder

```
package.json          Express + Multer + nanoid + Puppeteer. ESM. Node 18+.
server.js             The whole server. Routes, JSON layer, Puppeteer.
templates/render.js   Design system + card + form HTML. No template engine.
scripts/seed.js       Writes data/sample.json so you can preview without the form.
scripts/calculator.js Rate calculator STUB. Interface locked, formula pending.
data/sample.json      Seeded sample creator (Ava Linden).
sample-card-preview.html   Static render of the sample card. Open it in a browser to eyeball the design.
README.md             Run instructions.
```

## What works (smoke tested)

- `GET /` renders the creator form. Photo slot spec (365×1123) shown upfront.
- `POST /create` parses the form, writes `data/{id}.json`, redirects to `/c/{id}`.
- `GET /c/:id` renders the two-page rate card:
  - Page 1 cover: 365×1123 photo slot, display name in Cormorant Garamond, tagline, handle.
  - Page 2 detail: bio, audience grid (IG + TikTok with followers and engagement), rates, selected work.
- `GET /c/:id/pdf` runs server-side Puppeteer. **Fails gracefully** if Chrome binary isn't installed — it does NOT crash the server. Error message tells you exactly which command to run.
- `POST /api/calculate` returns a placeholder result from the stub.
- JSON schema verified: id, name, handle, email (nullable), platforms.instagram, platforms.tiktok, rates[], workPreview[], photo.slotSpec = `{width:365,height:1123}`.

## To run it locally

```bash
cd "CreatorHQ Pilot v2"
rm -rf node_modules package-lock.json   # wipe the broken install from this session
npm install
npx puppeteer browsers install chrome   # one-time, for the PDF route
npm run dev
```

Open `http://localhost:3000`. The seeded sample is at `http://localhost:3000/c/sample`.

> Note: a stale `node_modules` is currently in the workspace from a partial install during this session. Delete it and reinstall cleanly before running.

## What's stubbed, on purpose

**`scripts/calculator.js`** — returns a placeholder number. The interface is:

```js
calculateRate({ platform, contentType, followers, engagement, usage })
  → { suggested, low, high, rationale, assumptions, stub }
```

When you hand over the real formula, replace the body of `calculateRate` only. Don't touch the shape of the return object — the card template and future media-kit generator will read these fields.

## Design system — locked

Same as the card we built yesterday.

- **Typography**: Cormorant Garamond (display), Instrument Sans (UI), loaded from Google Fonts.
- **Palette**: `--black #0a0a0a`, `--paper #faf8f3`, `--sand #e8e1d1`, `--sage #8a9a7b`.
- **Cover photo slot**: 365×1123 px, enforced in CSS via fixed dimensions + `object-fit: cover`. Spec recorded in every creator's JSON under `photo.slotSpec` so downstream media-kit generation can validate against the same number.
- **Template is neutral** — no per-creator colour personalisation yet. That's phase 2.

## Deploy shape

- Server uses `export default app` at the bottom. Drops into a Vercel serverless function or a Railway/Fly node process without code changes.
- `PORT` env var respected. `NODE_ENV=test` skips the `listen()` call so the app can be imported for serverless adapters.
- `data/` is file-backed — fine for local dev and a single-instance VPS. For Vercel you'll want to swap the data layer for something durable (Vercel Blob, Supabase, or similar). That's the only change required. The `loadCreator`/`saveCreator` functions are the only place to touch.

## Things not done yet — explicitly deferred

1. **Rate Calculator real formula.** Waiting on you.
2. **Rate Calculator UI.** Endpoint exists (`POST /api/calculate`) but no form / integration into the card yet. Will slot in under the Rates section on the creator form once the formula is in.
3. **Media kit output.** Email becomes required at that point.
4. **Colour personalisation** per creator. Single neutral template for now.
5. **Auth / Creator ID.** JSON records are unauthenticated — anyone with the ID can view. Fine for the pilot; proper Creator ID system is the longer vision.
6. **Image validation on upload.** We accept any image and centre-crop to the 365×1123 slot. If we want to reject off-spec uploads up front, add it in the multer `fileFilter`.
7. **Deploy to your domain.** Structure is ready; waiting on you to name the domain and pick the host.

## Credit

Architecture, template, server logic, bug catch on the PDF route crash — Claude.
Scaffolding, install, smoke testing — AG.
