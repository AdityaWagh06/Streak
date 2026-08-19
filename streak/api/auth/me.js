import { getSession } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = getSession(req);
  const hasOAuthConfig = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

  if (!session) {
    return res.status(200).json({
      authenticated: false,
      user: null,
      hasOAuthConfig,
    });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      username: session.username,
      name: session.name || session.username,
      avatarUrl: session.avatarUrl,
    },
    hasOAuthConfig,
  });
}
