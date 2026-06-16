/**
 * Generates public/sitemap.xml at build time (run before `expo export -p web`
 * via the build:web script). Files in public/ are copied to the export root, so
 * the result is served at /sitemap.xml.
 *
 * Includes static routes, all articles, and all PUBLISHED products. For a
 * marketplace the product count can be large, so when the total exceeds the
 * sitemaps.org limit (50 000 URLs / file) we automatically emit a sitemap INDEX
 * (sitemap.xml) pointing at chunked files (sitemap-1.xml, sitemap-2.xml, …).
 *
 * Run with: tsx scripts/generate-sitemap.ts
 * (needs EXPO_PUBLIC_API_URL + EXPO_PUBLIC_SITE_URL in env — provided by op run).
 */
import { writeFileSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  fetchAllArticles,
  fetchAllProducts,
  htmlToExcerpt,
} from "../lib/seo-fetch.ts";
import { SITE_URL } from "../lib/site-url.ts";

// Stay safely under the 50 000-URL spec limit per file.
const MAX_URLS_PER_FILE = 45000;

// Public, indexable routes that always exist (mirrors the route inventory in the
// SEO report). Private/auth routes are intentionally excluded.
const STATIC_ROUTES = [
  "/",
  "/partners",
  "/hubs",
  "/search/in-season",
  "/search/products/new-arrivals",
  "/search/products/trending-now",
];

type UrlEntry = { loc: string; lastmod?: string; changefreq?: string };

const day = (d?: string) =>
  d ? new Date(d).toISOString().slice(0, 10) : undefined;

function urlsetXml(entries: UrlEntry[]): string {
  const urls = entries
    .map((e) => {
      const parts = [`    <loc>${e.loc}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function indexXml(files: string[]): string {
  const sitemaps = files
    .map((f) => `  <sitemap>\n    <loc>${SITE_URL}/${f}</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>\n`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");

  // Remove any sitemap files from a previous run so stale chunks never linger.
  for (const f of readdirSync(publicDir)) {
    if (/^sitemap.*\.xml$/.test(f)) rmSync(join(publicDir, f));
  }

  const entries: UrlEntry[] = STATIC_ROUTES.map((path) => ({
    loc: `${SITE_URL}${path}`,
    changefreq: "weekly",
  }));

  const seoMap: Record<string, { title: string; excerpt: string }> = {};

  try {
    const articles = await fetchAllArticles();
    for (const a of articles) {
      entries.push({
        loc: `${SITE_URL}/article/${a.slug}`,
        lastmod: day(a.updatedAt),
        changefreq: "monthly",
      });
      seoMap[a.slug] = { title: a.title, excerpt: htmlToExcerpt(a.body) };
    }
    console.log(`Sitemap: ${articles.length} articles`);
  } catch (err) {
    console.warn("Sitemap: could not fetch articles:", err);
  }

  let productCount = 0;
  try {
    const products = await fetchAllProducts();
    for (const p of products) {
      entries.push({
        loc: `${SITE_URL}/product/${p.id}`,
        lastmod: day(p.updatedAt),
        changefreq: "daily",
      });
    }
    productCount = products.length;
    console.log(`Sitemap: ${products.length} published products`);
  } catch (err) {
    console.warn("Sitemap: could not fetch products:", err);
  }

  // Single file when small; sitemap index + chunks when large.
  if (entries.length <= MAX_URLS_PER_FILE) {
    writeFileSync(join(publicDir, "sitemap.xml"), urlsetXml(entries), "utf8");
    console.log(`Wrote ${entries.length} URLs to public/sitemap.xml`);
  } else {
    const chunks = chunk(entries, MAX_URLS_PER_FILE);
    const files = chunks.map((_, i) => `sitemap-${i + 1}.xml`);
    chunks.forEach((c, i) => {
      writeFileSync(join(publicDir, files[i]), urlsetXml(c), "utf8");
    });
    writeFileSync(join(publicDir, "sitemap.xml"), indexXml(files), "utf8");
    console.log(
      `Wrote sitemap index (${files.length} files, ${entries.length} URLs total: ${STATIC_ROUTES.length} static + ${productCount} products + articles)`,
    );
  }

  // slug -> {title, excerpt} map, statically imported by the article route so
  // per-article <title>/<h1>/excerpt are server-rendered into the static HTML.
  // Only overwrite when we actually fetched articles, so an API outage during a
  // build doesn't wipe the committed map.
  if (Object.keys(seoMap).length > 0) {
    writeFileSync(
      join(root, "lib", "articles-seo.generated.json"),
      JSON.stringify(seoMap, null, 2) + "\n",
      "utf8",
    );
    console.log(`Wrote ${Object.keys(seoMap).length} entries to lib/articles-seo.generated.json`);
  }
}

main();
