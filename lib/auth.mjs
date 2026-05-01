import jwt from 'jsonwebtoken';
import { supabaseAdmin } from './supabase.mjs';

// SESSION_SECRET must be set in production. The dev fallback is fine for local
// hacking but a deploy without it would silently issue forgeable cookies.
const SESSION_SECRET = process.env.SESSION_SECRET || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('SESSION_SECRET must be set in production'); })()
    : 'fallback-secret-for-dev'
);
const COOKIE_NAME = 'chq_session';

/**
 * Signs a session token for a user.
 * @param {Object} user - Supabase user object or custom identity
 * @returns {string} Signed JWT
 */
export function signSession(user) {
  return jwt.sign(
    { 
      sub: user.id, 
      phone: user.phone || null,
      email: user.email || null,
      role: user.role || 'authenticated'
    }, 
    SESSION_SECRET, 
    { expiresIn: '30d' }
  );
}

/**
 * Middleware to verify the session cookie and attach req.user.
 * Also handles Supabase native sessions if bridged via cookie.
 */
export async function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, SESSION_SECRET);
    
    // Optional: Verify against Supabase to ensure the user still exists/is active
    // For MVP speed, we trust our signed JWT for 30 days unless revoked.
    req.user = {
      id: decoded.sub,
      phone: decoded.phone,
      email: decoded.email,
      role: decoded.role
    };
  } catch (err) {
    console.warn('Session verification failed:', err.message);
    res.clearCookie(COOKIE_NAME);
    req.user = null;
  }
  
  next();
}

/**
 * Checks if the current user owns a specific creator record.
 */
export function isOwner(creator, user) {
  if (!creator || !user) return false;
  // If creator hasn't been claimed yet (no owner_id), then they are the de-facto owner
  // if they are in the same session that created it (we'll implement draft locking later).
  return creator.owner_id === user.id;
}

export const AUTH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};
