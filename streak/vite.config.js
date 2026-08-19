import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

function localApiServerPlugin() {
  return {
    name: 'streak-local-api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const reqUrl = req.url || '';
        if (!reqUrl.startsWith('/api/') || reqUrl.startsWith('/api/_lib/')) {
          return next();
        }

        (async () => {
          const parsedUrl = new URL(reqUrl, `http://${req.headers.host || 'localhost:5173'}`);
          let relativePath = parsedUrl.pathname.replace(/^\/api\//, '').replace(/\/$/, '');

          let filePath = path.resolve(__dirname, 'api', `${relativePath}.js`);
          if (!fs.existsSync(filePath)) {
            filePath = path.resolve(__dirname, 'api', relativePath, 'index.js');
          }

          if (!fs.existsSync(filePath)) {
            console.warn(`[Local API 404] /api/${relativePath} -> ${filePath}`);
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: `Route /api/${relativePath} not found` }));
          }

          // Parse query params
          req.query = Object.fromEntries(parsedUrl.searchParams.entries());

          // Parse request body for POST/PUT
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf8');
            if (rawBody) {
              try {
                req.body = JSON.parse(rawBody);
              } catch (e) {
                req.body = rawBody;
              }
            } else {
              req.body = {};
            }
          } else {
            req.body = {};
          }

          // Polyfill res helper methods for Vercel/Express handlers
          res.status = function (code) {
            res.statusCode = code;
            return res;
          };

          res.json = function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          res.redirect = function (location) {
            res.writeHead(302, { Location: location });
            res.end();
          };

          const fileUrl = url.pathToFileURL(filePath).href + `?t=${Date.now()}`;
          const mod = await import(fileUrl);
          const handler = mod.default;

          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.status(500).json({ error: 'Handler is not a function' });
          }
        })().catch((err) => {
          console.error(`[Local API Error] ${reqUrl}:`, err);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    localApiServerPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Streak — Git-Backed Habit Tracker',
        short_name: 'Streak',
        description: 'Track daily habits with genuine GitHub commits and an authentic contribution graph',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
