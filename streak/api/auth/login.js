import crypto from 'crypto';
import { serializeStateCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.redirect('/?auth_error=missing_github_client_id');
  }

  // Generate random CSRF state
  const state = crypto.randomBytes(16).toString('hex');
  const isSecure = req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';

  // Determine redirect URI
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = isSecure ? 'https' : 'http';
  const defaultCallback = `${protocol}://${host}/api/auth/callback`;
  const callbackUrl = process.env.APP_URL ? `${process.env.APP_URL}/api/auth/callback` : defaultCallback;

  // Set CSRF state cookie
  res.setHeader('Set-Cookie', serializeStateCookie(state, isSecure));

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=public_repo&state=${encodeURIComponent(state)}`;

  res.writeHead(302, { Location: githubAuthUrl });
  res.end();
}
