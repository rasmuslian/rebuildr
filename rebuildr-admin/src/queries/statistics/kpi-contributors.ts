import apiClient from "@/lib/api-client";

export interface ContributorProduct {
  id: string;
  title: string;
  price: number;
  status: string;
  publishedAt: string | null;
  categoryName: string | null;
  sellerName: string | null;
}

const listedProductsQuery = `
  query CmsListProducts($input: CmsListProductsInput!) {
    cmsListProducts(input: $input) {
      total
      products {
        id
        title
        price
        status
        publishedAt
        category { id name }
        seller { id username }
      }
    }
  }
`;

/**
 * The listings behind a "published listings" figure, newest first. Uses the
 * same Stockholm day range as the KPI, so the totals reconcile.
 */
export const getPublishedProducts = async (input: {
  from: string;
  to: string;
  categoryId?: string;
  pageSize?: number;
}): Promise<{ products: ContributorProduct[]; total: number }> => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsListProducts: {
        total: number;
        products: {
          id: string;
          title: string;
          price: number;
          status: string;
          publishedAt: string | null;
          category: { id: string; name: string } | null;
          seller: { id: string; username: string | null } | null;
        }[];
      };
    }>
  >("/", {
    query: listedProductsQuery,
    variables: {
      input: {
        page: 0,
        pageSize: input.pageSize ?? 10,
        publishedFrom: input.from,
        publishedTo: input.to,
        categoryId: input.categoryId,
      },
    },
  });

  const payload = response.data.data?.cmsListProducts;
  return {
    total: payload?.total ?? 0,
    products: (payload?.products ?? []).map((product) => ({
      id: product.id,
      title: product.title,
      price: product.price,
      status: product.status,
      publishedAt: product.publishedAt,
      categoryName: product.category?.name ?? null,
      sellerName: product.seller?.username ?? null,
    })),
  };
};
