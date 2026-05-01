// Unified photo storage layer.
//
// Tries Supabase Storage (CDN-backed, persistent, ideal for production).
// Falls back to local `uploads/` directory + `/uploads/<file>` URL when
// Supabase is unreachable or disabled.
//
// The fallback works in dev and on hosts with persistent volumes mounted at
// PROJECT/uploads. On hosts with ephemeral filesystems (Railway default,
// Vercel, etc.) the disk path will lose photos on redeploy — set up a
// persistent volume or re-enable Supabase before going live.
//
// API: uploadCreatorPhoto(creatorId, buffer, contentType, { fallbackToDisk })
// returns a URL the template can render.

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadCreatorPhoto as supabaseUpload } from './supabase.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'uploads');

const SUPABASE_TIMEOUT_MS = parseInt(process.env.CREATORHQ_SUPABASE_TIMEOUT_MS, 10) || 2000;

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function isUnreachable(err) {
  const msg = String(err?.message || err || '');
  return /ENOTFOUND|ECONNREFUSED|EAI_AGAIN|fetch failed|timed out|disabled|Bucket not found/i.test(msg);
}

function contentTypeToExt(ct) {
  switch (ct) {
    case 'image/png':  return 'png';
    case 'image/webp': return 'webp';
    case 'image/gif':  return 'gif';
    case 'image/heic': return 'heic';
    default:           return 'jpg';
  }
}

function safeId(id) {
  // Sanitize creator id for filesystem use (paths + filenames).
  return String(id).replace(/[^A-Za-z0-9_-]/g, '');
}

function uploadToDisk(creatorId, buffer, contentType) {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
  const safe = safeId(creatorId);
  if (!safe) throw new Error('Invalid creator id for upload');
  const ext = contentTypeToExt(contentType);
  // Stable filename keyed on creator id so re-uploads overwrite instead of pile up.
  const filename = `${safe}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  writeFileSync(filepath, buffer);
  // Public URL served by Express's express.static('/uploads', uploads/) mount in server.js
  return `/uploads/${filename}`;
}

/**
 * Upload a photo and return its public URL (Supabase CDN or local /uploads/).
 * Throws only if both Supabase and disk fail.
 *
 * @param {string} creatorId
 * @param {Buffer} buffer
 * @param {string} contentType  e.g. 'image/jpeg'
 * @returns {Promise<string>} URL the template can render (absolute or /uploads/-relative)
 */
export async function uploadCreatorPhoto(creatorId, buffer, contentType) {
  // Try Supabase first
  try {
    const url = await withTimeout(
      supabaseUpload(creatorId, buffer, contentType),
      SUPABASE_TIMEOUT_MS,
      'Supabase photo upload'
    );
    if (url && typeof url === 'string' && url.startsWith('http')) {
      return url;
    }
    // Empty / stub URL means the supabase stub returned — treat as unreachable
    throw new Error('Supabase upload returned empty URL (likely disabled mode)');
  } catch (err) {
    if (isUnreachable(err)) {
      console.warn(`[photoStorage] Supabase upload unreachable (${err.message?.slice(0, 80)}). Saving to disk.`);
    } else {
      console.warn(`[photoStorage] Supabase upload error: ${err.message?.slice(0, 120)}. Saving to disk.`);
    }
  }

  // Disk fallback
  return uploadToDisk(creatorId, buffer, contentType);
}
