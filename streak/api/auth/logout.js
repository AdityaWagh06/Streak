import { serializeClearSessionCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Set-Cookie', serializeClearSessionCookie());
  
  if (req.method === 'GET') {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
