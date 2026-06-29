/**
 * Build-time / SSR data fetching for SEO.
 *
 * Plain `fetch` against the public GraphQL endpoint — no Apollo, no auth — so it
 * runs both in Node during `expo export -p web` (generateStaticParams,
 * scripts/generate-sitemap.ts) and during static render. Only public data.
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not set");
  }
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) {
    throw new Error("No data returned from GraphQL");
  }
  return json.data;
}

export type ArticleSummary = {
  slug: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

const LIST_ARTICLES = /* GraphQL */ `
  query SeoListArticles($input: ListArticlesInput!) {
    listArticles(input: $input) {
      articles {
        slug
        title
        body
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * Strips HTML tags and collapses whitespace, then truncates to ~300 chars on a
 * word boundary. Used to server-render a real text excerpt + meta description
 * for articles so non-JS AI crawlers see actual content.
 */
export function htmlToExcerpt(html: string, maxLength = 300): string {
  const text = (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

export type ProductSummary = {
  id: string;
  updatedAt: string;
};

const LIST_PRODUCTS = /* GraphQL */ `
  query SeoListProducts($input: ProductsInput!, $limit: Int, $offset: Int) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        status
        updatedAt
      }
      total
    }
  }
`;

/**
 * Fetches every PUBLISHED product (paginated) for the sitemap. Sold/deleted/draft
 * listings are excluded so Google doesn't waste crawl budget on dead pages.
 * Marketplaces can have many products, so the sitemap generator splits these
 * across a sitemap index when needed.
 */
export async function fetchAllProducts(): Promise<ProductSummary[]> {
  const limit = 500;
  let offset = 0;
  const all: ProductSummary[] = [];

  for (let guard = 0; guard < 2000; guard++) {
    const data = await graphqlRequest<{
      products: {
        products: { id: string; status: string; updatedAt: string }[];
        total: number;
      };
    }>(LIST_PRODUCTS, { input: {}, limit, offset });

    const batch = data.products.products ?? [];
    for (const p of batch) {
      if (p.status === "PUBLISHED")
        all.push({ id: p.id, updatedAt: p.updatedAt });
    }
    offset += limit;
    if (batch.length < limit || offset >= data.products.total) break;
  }

  return all;
}

/**
 * Fetches every published article (paginated under the hood). Used by both the
 * article route's generateStaticParams and the sitemap generator.
 */
export async function fetchAllArticles(): Promise<ArticleSummary[]> {
  const pageSize = 100;
  // The API paginates with a 0-indexed `page` (skip = pageSize * page).
  let page = 0;
  const all: ArticleSummary[] = [];

  // Guard against an unbounded loop if the API ignores pagination.
  for (let guard = 0; guard < 50; guard++) {
    const data = await graphqlRequest<{
      listArticles: { articles: ArticleSummary[] };
    }>(LIST_ARTICLES, { input: { page, pageSize } });

    const batch = data.listArticles.articles ?? [];
    all.push(...batch);
    if (batch.length < pageSize) break;
    page += 1;
  }

  return all;
}
