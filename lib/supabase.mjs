// lib/supabase.mjs — server-side Supabase access.
//
// Exports an admin client (service-role key) + helper for photo uploads.
// In disk-only mode (no SUPABASE_URL set, or CREATORHQ_DISABLE_SUPABASE=true)
// we export a stub client that always rejects with a clear error — server.js
// catches that and falls through to filesystem fallback paths.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const DISK_ONLY = process.env.CREATORHQ_DISABLE_SUPABASE === 'true';

let _supabaseAdmin;

if (DISK_ONLY || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.warn('[supabase] disk-only mode: Supabase env not configured (or CREATORHQ_DISABLE_SUPABASE=true). All Supabase calls will reject; server.js will fall back to filesystem.');

  // Stub client whose every method rejects with a recognisable "unreachable" error.
  // server.js loadCreator/saveCreator detect this via isUnreachableError() and fall
  // through to disk seamlessly.
  const reject = () => Promise.reject(new Error('Supabase disabled (disk-only mode)'));
  const queryStub = {
    select: () => queryStub,
    eq: () => queryStub,
    maybeSingle: reject,
    single: reject,
    upsert: reject,
    insert: reject,
    update: reject,
    delete: reject,
    then: (resolve, reject2) => reject().then(resolve, reject2)
  };
  _supabaseAdmin = {
    from: () => queryStub,
    storage: {
      from: () => ({
        upload: reject,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: reject
      })
    },
    auth: {
      verifyOtp: reject,
      signInWithOtp: reject
    }
  };
} else {
  _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = _supabaseAdmin;

const BUCKET = 'creator-photos';

/**
 * Upload a photo buffer for a creator and return its public URL.
 * Object path is keyed on creator id so each creator has exactly one canonical photo.
 * Re-uploads are idempotent (upsert: true) — handy for profile photo swaps.
 */
export async function uploadCreatorPhoto(creatorId, buffer, contentType) {
  const ext = contentTypeToExt(contentType);
  const objectPath = `${creatorId}/photo.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

function contentTypeToExt(ct) {
  switch (ct) {
    case 'image/png':  return 'png';
    case 'image/webp': return 'webp';
    case 'image/gif':  return 'gif';
    case 'image/heic': return 'heic';
    default:           return 'jpg'; // image/jpeg and anything unknown
  }
}
