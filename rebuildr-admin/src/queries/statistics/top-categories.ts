import apiClient from "@/lib/api-client";

export interface TopCategoryEntry {
  categoryId: string;
  categoryName: string;
  salesSek: number;
  salesCount: number;
  listingCount: number;
}

export interface TopCategoriesResponse {
  bySales: TopCategoryEntry[];
  byListings: TopCategoryEntry[];
}

const topCategoriesQuery = `
  fragment TopCategoryFields on CmsTopCategoryEntry {
    categoryId
    categoryName
    salesSek
    salesCount
    listingCount
  }

  query CmsTopCategories($input: CmsTopCategoriesInput!) {
    cmsTopCategories(input: $input) {
      bySales { ...TopCategoryFields }
      byListings { ...TopCategoryFields }
    }
  }
`;

export const getTopCategories = async (input: {
  from: string;
  to: string;
  limit?: number;
}): Promise<TopCategoriesResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsTopCategories: TopCategoriesResponse }>
  >("/", {
    query: topCategoriesQuery,
    variables: { input },
  });

  return (
    response.data.data?.cmsTopCategories ?? { bySales: [], byListings: [] }
  );
};
