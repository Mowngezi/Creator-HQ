#!/usr/bin/env node
/**
 * migrate-khanyi.mjs — one-off migration of the pilot creator into Supabase.
 *
 * Reads data/KhKumalo.json, uploads the bundled photo into the creator-photos
 * storage bucket, and upserts the row into public.creators. Idempotent — safe to
 * re-run. Uses the service role key so it bypasses RLS.
 *
 * Usage:   npm run migrate:khanyi
 *   (which runs: node --env-file=.env scripts/migrate-khanyi.mjs)
 *
 * Requires in .env:
 *   SUPABASE_URL
 *   SUPABASE_SECRET_KEY   (service role — pull from Supabase dashboard → API Keys)
 *
 * After a successful run, /c/KhKumalo should render against Supabase data once
 * Step 3 (data layer swap) lands. Until then, this just seeds the table.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY. Copy .env.example → .env and fill in the service role key.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const BUCKET = 'creator-photos';
const CREATOR_ID = 'KhKumalo';
const JSON_PATH = path.join(projectRoot, 'data', `${CREATOR_ID}.json`);
const PHOTO_SRC = path.join(projectRoot, 'uploads', 'pnkr6y9NW0.JPG');
const PHOTO_DEST = `${CREATOR_ID}/photo.jpg`;

async function readJson() {
  const raw = await fs.readFile(JSON_PATH, 'utf8');
  return JSON.parse(raw);
}

async function uploadPhoto() {
  const buf = await fs.readFile(PHOTO_SRC);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(PHOTO_DEST, buf, {
      contentType: 'image/jpeg',
      upsert: true, // idempotency
    });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(PHOTO_DEST);
  return data.publicUrl;
}

function mapToRow(json, publicPhotoUrl) {
  // Schema is {id, auth_uid, data, created_at, stats_updated_at} — data is the full
  // creator JSON blob, shape-preserving. Only rewrite is photo.url → Supabase Storage URL.
  const data = {
    ...json,
    photo: {
      ...(json.photo ?? {}),
      url: publicPhotoUrl,
    },
  };

  return {
    id: json.id,
    auth_uid: null, // Khanyi claims the record on her first sign-in (Step 7).
    data,
    created_at: json.createdAt ?? new Date().toISOString(),
    // stats_updated_at intentionally omitted — defaults to now() on insert,
    // so the decay stamp starts fresh.
  };
}

async function upsertRow(row) {
  const { error } = await supabase
    .from('creators')
    .upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`Upsert failed: ${error.message}`);
}

async function main() {
  console.log(`→ Reading ${path.relative(projectRoot, JSON_PATH)}`);
  const json = await readJson();

  console.log(`→ Uploading photo → ${BUCKET}/${PHOTO_DEST}`);
  const publicPhotoUrl = await uploadPhoto();
  console.log(`  ${publicPhotoUrl}`);

  console.log(`→ Upserting creators row id="${CREATOR_ID}"`);
  const row = mapToRow(json, publicPhotoUrl);
  await upsertRow(row);

  console.log('✅ Migration complete.');
  console.log(`   Verify: curl ${SUPABASE_URL}/rest/v1/creators?id=eq.${CREATOR_ID} -H "apikey: <publishable>"`);
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
