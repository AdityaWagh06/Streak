import { verifyState, serializeSessionCookie, serializeClearStateCookie, isRequestSecure } from '../_lib/auth.js';
import { getOctokit, bootstrapRepo } from '../_lib/github.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parse query params
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const code = req.query?.code || urlObj.searchParams.get('code');
  const state = req.query?.state || urlObj.searchParams.get('state');
  const error = req.query?.error || urlObj.searchParams.get('error');
  const errorDescription = req.query?.error_description || urlObj.searchParams.get('error_description');

  if (error) {
    console.error('OAuth error from GitHub:', error, errorDescription);
    return res.redirect(`/?auth_error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code || !state) {
    return res.redirect('/?auth_error=missing_code_or_state');
  }

  // Verify CSRF state token
  if (!verifyState(req, state)) {
    console.error('CSRF state mismatch during OAuth callback');
    return res.redirect('/?auth_error=csrf_state_mismatch');
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.redirect('/?auth_error=missing_server_credentials');
  }

  try {
    // 1. Exchange code for OAuth access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Streak-Habit-Tracker-v2',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return res.redirect(`/?auth_error=${encodeURIComponent(tokenData.error_description || 'token_exchange_failed')}`);
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated GitHub user
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Streak-Habit-Tracker-v2',
      },
    });

    if (!userResponse.ok) {
      return res.redirect('/?auth_error=failed_fetching_user_profile');
    }

    const userData = await userResponse.json();
    const username = userData.login;

    // 3. Access gate: Verify if username is authorized
    const allowedUser = process.env.ALLOWED_GITHUB_USERNAME?.trim()?.toLowerCase();
    if (allowedUser && username.toLowerCase() !== allowedUser) {
      console.warn(`User @${username} attempted login but is not in ALLOWED_GITHUB_USERNAME (${allowedUser})`);
      res.setHeader('Set-Cookie', serializeClearStateCookie());
      return res.redirect(`/?auth_error=unauthorized_user&attempted_user=${encodeURIComponent(username)}`);
    }

    // 4. First-login bootstrap (auto-creates daily-streak-log repo if not existing)
    try {
      const octokit = getOctokit(accessToken);
      await bootstrapRepo(octokit, username);
    } catch (bootstrapErr) {
      console.error('Bootstrap repo error (non-fatal, continuing):', bootstrapErr.message);
    }

    // 5. Encrypt session cookie & clear state cookie
    const isSecure = isRequestSecure(req);
    const sessionCookie = serializeSessionCookie({
      accessToken,
      username,
      name: userData.name || username,
      avatarUrl: userData.avatar_url,
    }, isSecure);

    const clearStateCookie = serializeClearStateCookie();

    res.setHeader('Set-Cookie', [sessionCookie, clearStateCookie]);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.writeHead(302, { Location: '/' });
    res.end();

  } catch (err) {
    console.error('Unexpected error in OAuth callback:', err);
    res.redirect(`/?auth_error=${encodeURIComponent(err.message || 'server_error')}`);
  }
}
