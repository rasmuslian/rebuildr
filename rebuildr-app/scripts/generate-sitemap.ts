/**
 * Generates public/sitemap.xml at build time (run before `expo export -p web`
 * via the build:web script). Files in public/ are copied to the export root, so
 * the result is served at /sitemap.xml.
 *
 * Includes static routes + indexable articles. Product listings are excluded
 * (client-rendered, volatile, noindex). It also writes lib/articles-seo.generated.json
 * (per-article title/description/body/dates) consumed by the article route's static
 * render. When the URL count exceeds the sitemaps.org limit (50 000 URLs / file)
 * we emit a sitemap INDEX (sitemap.xml) pointing at chunked files.
 *
 * Run with: tsx scripts/generate-sitemap.ts
 * (needs EXPO_PUBLIC_API_URL + EXPO_PUBLIC_SITE_URL in env — provided by op run).
 */
import { writeFileSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fetchAllArticles, htmlToExcerpt } from "../lib/seo-fetch.ts";
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
      if (e.changefreq)
        parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
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
  const publicDir = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "public",
  );
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");

  // Remove any sitemap files from a previous run so stale chunks never linger.
  for (const f of readdirSync(publicDir)) {
    if (/^sitemap.*\.xml$/.test(f)) rmSync(join(publicDir, f));
  }

  const entries: UrlEntry[] = STATIC_ROUTES.map((path) => ({
    loc: `${SITE_URL}${path}`,
  }));

  const seoMap: Record<
    string,
    {
      title: string;
      description: string;
      body: string;
      isInternal?: boolean;
      datePublished?: string;
      dateModified?: string;
    }
  > = {};

  try {
    const articles = await fetchAllArticles();
    let included = 0;
    for (const a of articles) {
      // Always store the build-time SEO data so the article route can render the
      // full body + per-article meta into the static HTML (even for internal
      // articles that we keep out of the sitemap).
      seoMap[a.slug] = {
        title: a.title,
        // Meta description: short (~155 chars) per best practice.
        description: htmlToExcerpt(a.body, 155),
        // Full HTML body: rendered server-side so crawlers/AI see real content.
        body: a.body,
        isInternal: a.isInternal || undefined,
        datePublished: a.createdAt,
        dateModified: a.updatedAt,
      };
      // Internal/in-app CMS entries (article.isInternal in the CMS) stay out of
      // the sitemap; the article page also renders noindex for them.
      if (a.isInternal) continue;
      entries.push({
        loc: `${SITE_URL}/article/${a.slug}`,
        lastmod: day(a.updatedAt),
      });
      included += 1;
    }
    console.log(
      `Sitemap: ${included} articles included (${articles.length - included} internal skipped)`,
    );
  } catch (err) {
    console.warn("Sitemap: could not fetch articles:", err);
  }

  // Product listings are intentionally NOT in the sitemap: they are client-
  // rendered (no crawlable content) and volatile (sold/created constantly), so
  // indexing them as empty shells hurts crawl quality. Product pages also carry
  // <meta name="robots" content="noindex">. SEO focus is articles + categories.

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
      `Wrote sitemap index (${files.length} files, ${entries.length} URLs total)`,
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
    console.log(
      `Wrote ${Object.keys(seoMap).length} entries to lib/articles-seo.generated.json`,
    );
  }
}

main();
