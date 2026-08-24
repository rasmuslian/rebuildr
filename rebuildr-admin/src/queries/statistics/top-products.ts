import apiClient from "@/lib/api-client";

export interface TopProductEntry {
  productId: string;
  title: string | null;
  status: string | null;
  viewCount: number;
}

const topProductsQuery = `
  query CmsTopProducts($input: CmsTopProductsInput!) {
    cmsTopProducts(input: $input) {
      productId
      title
      status
      viewCount
    }
  }
`;

export const getTopProducts = async (input: {
  from: string;
  to: string;
  limit?: number;
}): Promise<TopProductEntry[]> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsTopProducts: TopProductEntry[] }>
  >("/", {
    query: topProductsQuery,
    variables: { input },
  });

  return response.data.data?.cmsTopProducts ?? [];
};
