import { serializeClearSessionCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', serializeClearSessionCookie());
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  // If GET request or browser navigation, perform 302 redirect to clean root landing page
  if (req.method === 'GET' || req.headers.accept?.includes('text/html')) {
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
