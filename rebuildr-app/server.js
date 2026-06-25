const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.map': 'application/json',
  '.wasm': 'application/wasm',
};

// Resolve a request path to a real file inside DIST, or null.
// Order: exact file, clean URL (.html), directory index.
function tryFile(rel) {
  const f = path.join(DIST, rel);
  if (!f.startsWith(DIST)) return null; // path traversal guard
  try {
    if (fs.statSync(f).isFile()) return f;
  } catch (e) {}
  return null;
}

function send(res, file, code = 200) {
  res.writeHead(code, {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
  });
  fs.createReadStream(file).pipe(res);
}

// File-first static server with SPA fallback.
// Prerendered routes (e.g. /article/<slug>) are served as real HTML so crawlers
// see per-page content + self-canonical. Client-only dynamic routes (products,
// buy, account, conversations, categories ...) have no prerendered file and fall
// back to index.html so the app boots and renders them client-side.
http
  .createServer((req, res) => {
    const p = decodeURIComponent((req.url || '/').split('?')[0]);
    const file = tryFile(p) || tryFile(p + '.html') || tryFile(path.join(p, 'index.html'));
    if (file) return send(res, file);
    // Missing asset (has a file extension) -> real 404, not the app shell.
    if (/\.[a-z0-9]+$/i.test(p)) {
      res.writeHead(404);
      return res.end('Not found');
    }
    // Client-only route -> SPA fallback.
    return send(res, path.join(DIST, 'index.html'), 200);
  })
  .listen(PORT, () => console.log(`serving dist (file-first, SPA fallback) on ${PORT}`));
