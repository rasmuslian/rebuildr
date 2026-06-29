/* global __dirname */
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "dist");
const PORT = process.env.PORT || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".map": "application/json",
  ".wasm": "application/wasm",
};

// Resolve a request path to a real file inside DIST, or null.
// Order: exact file, clean URL (.html), directory index.
function tryFile(rel) {
  const f = path.join(DIST, rel);
  if (!f.startsWith(DIST)) return null; // path traversal guard
  try {
    if (fs.statSync(f).isFile()) return f;
  } catch {
    // statSync throws when the path does not exist
  }
  return null;
}

// Content-hashed build output (/_expo/*, /assets/*) never changes for a given
// filename → cache forever. HTML must always revalidate so deploys take effect.
// Everything else (images, sitemap, robots) gets a modest TTL.
function cacheControl(file) {
  const rel = file.slice(DIST.length);
  if (path.extname(file).toLowerCase() === ".html") return "no-cache";
  if (rel.startsWith("/_expo/") || rel.startsWith("/assets/")) {
    return "public, max-age=31536000, immutable";
  }
  return "public, max-age=3600";
}

function send(res, file, code = 200) {
  res.writeHead(code, {
    "Content-Type":
      MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Cache-Control": cacheControl(file),
  });
  fs.createReadStream(file).pipe(res);
}

// For dynamic routes like /product/abc123, find the [param].html template in the
// parent directory so React hydrates from the right shell, not the homepage shell.
function tryDynamicTemplate(p) {
  const parts = p.split("/").filter(Boolean);
  for (let i = parts.length; i > 0; i--) {
    const parentDir = path.join(DIST, ...parts.slice(0, i - 1));
    try {
      const entries = fs.readdirSync(parentDir);
      const tmpl = entries.find((e) => /^\[.+\]\.html$/.test(e));
      if (tmpl) {
        const candidate = path.join(parentDir, tmpl);
        if (fs.statSync(candidate).isFile()) return candidate;
      }
    } catch {
      // directory doesn't exist
    }
  }
  return null;
}

// File-first static server with SPA fallback.
// Prerendered routes (e.g. /article/<slug>) are served as real HTML so crawlers
// see per-page content + self-canonical. Client-only dynamic routes (products,
// buy, account, conversations, categories ...) have no prerendered file and fall
// back to their [param].html template so React hydrates without a mismatch.
http
  .createServer((req, res) => {
    const p = decodeURIComponent((req.url || "/").split("?")[0]);
    const file =
      tryFile(p) ||
      tryFile(p + ".html") ||
      tryFile(path.join(p, "index.html")) ||
      tryDynamicTemplate(p);
    if (file) return send(res, file);
    // Missing asset (has a file extension) -> real 404, not the app shell.
    if (/\.[a-z0-9]+$/i.test(p)) {
      res.writeHead(404);
      return res.end("Not found");
    }
    // Client-only route -> SPA fallback.
    return send(res, path.join(DIST, "index.html"), 200);
  })
  .listen(PORT, () =>
    console.log(`serving dist (file-first, SPA fallback) on ${PORT}`),
  );
