// lib/ownership.mjs
//
// Soft sign-in / ownership recognition for Creator-HQ.
//
// Model:
// - At create-time, the creator provides a recovery contact (email or SA phone)
//   and a date of birth. We hash both with a per-record salt and store only
//   the hashes. Raw DOB and raw recovery contact never persist.
// - We also generate an owner_token (random 32-char hex) and set it as an
//   httpOnly cookie chq_owner_<id> on the creator's browser. That cookie is
//   the default ownership recognition signal.
// - On a different device (or if cookies are cleared), the creator hits
//   /c/:id/recover with their contact + DOB. We recompute the hashes and
//   compare; on match, set the cookie on the new browser.
//
// All functions are pure / stateless except setOwnerCookie + readOwnerCookie
// which take Express req/res.

import { randomBytes, createHash } from 'crypto';

// 30 days in ms — owner cookie validity.
const OWNER_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

// Generate a random 32-char hex token for owner_token.
export function generateOwnerToken() {
  return randomBytes(16).toString('hex');
}

// Generate a random 16-char hex salt for per-record hashing.
export function generateSalt() {
  return randomBytes(8).toString('hex');
}

// Normalise a contact string for hashing. Lowercase + trim. Phone numbers
// have spaces stripped. Email-or-phone auto-detection done elsewhere.
function normaliseContact(contact) {
  return String(contact || '').trim().toLowerCase().replace(/\s+/g, '');
}

// Normalise a DOB string for hashing. Accepts:
//   YYYY-MM-DD (HTML date input)
//   DD/MM/YYYY (split-fields)
// Returns canonical YYYY-MM-DD or '' if invalid.
export function normaliseDob(dob) {
  if (!dob) return '';
  const s = String(dob).trim();
  // YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const [, y, mo, d] = m;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // DD/MM/YYYY
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return '';
}

// Detect if a contact string looks like an email or a SA phone.
// Returns 'email', 'phone', or null.
export function detectContactType(contact) {
  const s = String(contact || '').trim();
  if (!s) return null;
  if (s.includes('@') && s.includes('.')) return 'email';
  // SA mobile: 0XX XXX XXXX (10 digits starting with 0) OR +27...
  const stripped = s.replace(/\s+/g, '');
  if (/^0\d{9}$/.test(stripped)) return 'phone';
  if (/^\+27\d{9}$/.test(stripped)) return 'phone';
  return null;
}

// Hash one input with a per-record salt. SHA-256, hex output.
function hashWith(salt, input) {
  return createHash('sha256').update(salt + ':' + input).digest('hex');
}

// Hash both credentials with a single salt. Returns
// { contact_hash, dob_hash } given normalised inputs.
export function hashCredentials(salt, contact, dob) {
  const normContact = normaliseContact(contact);
  const normDob = normaliseDob(dob);
  if (!normContact || !normDob) {
    throw new Error('Invalid contact or DOB for hashing');
  }
  return {
    contact_hash: hashWith(salt, normContact),
    dob_hash: hashWith(salt, normDob)
  };
}

// Build the full ownership block for storing on a creator record.
// Caller passes raw contact + DOB; we hash + return the safe block.
// owner_token is what we set as the cookie.
export function buildOwnershipBlock({ contact, dob }) {
  const salt = generateSalt();
  const owner_token = generateOwnerToken();
  const contact_type = detectContactType(contact);
  const { contact_hash, dob_hash } = hashCredentials(salt, contact, dob);
  return {
    owner_token,
    salt,
    contact_hash,
    dob_hash,
    contact_type,
    created_at: new Date().toISOString()
  };
}

// Cookie name for a given creator id.
function cookieName(creatorId) {
  return `chq_owner_${creatorId}`;
}

// Set the owner cookie on res. httpOnly, sameSite=lax, scoped to /c/:id.
// Refreshes the 30-day window on every set.
export function setOwnerCookie(res, creatorId, ownerToken) {
  res.cookie(cookieName(creatorId), ownerToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: OWNER_COOKIE_MAX_AGE,
    path: `/c/${creatorId}`
  });
}

// Clear the owner cookie (used by a future "sign out" flow if we add one).
export function clearOwnerCookie(res, creatorId) {
  res.clearCookie(cookieName(creatorId), { path: `/c/${creatorId}` });
}

// Read the owner cookie value, or null. Requires cookie-parser middleware.
export function readOwnerCookie(req, creatorId) {
  return req.cookies?.[cookieName(creatorId)] || null;
}

// Verify ownership against a creator record. Returns true if the cookie's
// owner_token matches creator.ownership.owner_token. Constant-time-ish.
export function verifyOwnership(req, creator) {
  if (!creator?.ownership?.owner_token) return false;
  const cookieToken = readOwnerCookie(req, creator.id);
  if (!cookieToken) return false;
  // Constant-time string comparison so a timing attack can't probe the token.
  return safeEquals(cookieToken, creator.ownership.owner_token);
}

// Verify recovery credentials. Hashes the input with the stored salt and
// compares to the stored hashes. Returns true on full match.
export function verifyRecoveryCredentials(creator, contact, dob) {
  const own = creator?.ownership;
  if (!own?.salt || !own?.contact_hash || !own?.dob_hash) return false;
  let candidate;
  try {
    candidate = hashCredentials(own.salt, contact, dob);
  } catch {
    return false;
  }
  return (
    safeEquals(candidate.contact_hash, own.contact_hash) &&
    safeEquals(candidate.dob_hash, own.dob_hash)
  );
}

// Constant-time string equality. Prevents timing-based probing of valid hash
// prefixes.
function safeEquals(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  if (sa.length !== sb.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i++) {
    diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  }
  return diff === 0;
}
