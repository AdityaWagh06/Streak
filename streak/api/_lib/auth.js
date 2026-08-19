import crypto from 'crypto';
import cookie from 'cookie';

const ALGORITHM = 'aes-256-gcm';
const COOKIE_NAME = 'streak_session';
const STATE_COOKIE_NAME = 'streak_oauth_state';

// Derive a 32-byte key from SESSION_SECRET
function getEncryptionKey() {
  const secret = process.env.SESSION_SECRET || 'streak-default-dev-secret-32-chars-long!';
  return crypto.scryptSync(secret, 'streak-salt-2026', 32);
}

/**
 * Encrypt a JSON serializable payload with AES-256-GCM
 */
export function encryptPayload(data) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const jsonStr = JSON.stringify(data);
  let encrypted = cipher.update(jsonStr, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted payload
 */
export function decryptPayload(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== 'string') return null;
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (err) {
    console.error('Session decryption error:', err.message);
    return null;
  }
}

/**
 * Parse cookies from request
 */
export function parseCookies(req) {
  const header = req.headers?.cookie || req.headers?.Cookie || '';
  return cookie.parse(header);
}

/**
 * Set session cookie header
 */
export function serializeSessionCookie(payload, isSecure = false) {
  const encrypted = encryptPayload(payload);
  return cookie.serialize(COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Clear session cookie header
 */
export function serializeClearSessionCookie() {
  return cookie.serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Set OAuth state cookie header (short lived CSRF token)
 */
export function serializeStateCookie(state, isSecure = false) {
  return cookie.serialize(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });
}

/**
 * Clear OAuth state cookie header
 */
export function serializeClearStateCookie() {
  return cookie.serialize(STATE_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Helper to get the authenticated session from a request.
 * Enforces ALLOWED_GITHUB_USERNAME check if configured.
 */
export function getSession(req) {
  const cookies = parseCookies(req);
  const sessionToken = cookies[COOKIE_NAME];
  if (!sessionToken) return null;

  const session = decryptPayload(sessionToken);
  if (!session || !session.accessToken || !session.username) {
    return null;
  }

  // Enforce ALLOWED_GITHUB_USERNAME if defined in env
  const allowedUser = process.env.ALLOWED_GITHUB_USERNAME?.trim()?.toLowerCase();
  if (allowedUser && session.username.toLowerCase() !== allowedUser) {
    console.warn(`Blocked unauthorized user: ${session.username} (expected: ${allowedUser})`);
    return null;
  }

  return session;
}

/**
 * Helper to verify CSRF state cookie during OAuth callback
 */
export function verifyState(req, stateFromQuery) {
  const cookies = parseCookies(req);
  const savedState = cookies[STATE_COOKIE_NAME];
  return Boolean(savedState && stateFromQuery && savedState === stateFromQuery);
}
