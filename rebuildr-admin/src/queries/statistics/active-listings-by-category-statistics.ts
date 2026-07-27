import apiClient from "@/lib/api-client";

export interface ActiveListingsByCategoryDataPoint {
  category: string;
  count: number;
}

export interface ActiveListingsByCategoryResponse {
  data: ActiveListingsByCategoryDataPoint[];
}

const activeListingsByCategoryQuery = `
  query CmsActiveListingsByCategoryStatistics {
    cmsActiveListingsByCategoryStatistics {
      data {
        category
        count
      }
    }
  }
`;

export const getActiveListingsByCategoryStatistics =
  async (): Promise<ActiveListingsByCategoryResponse> => {
    const response = await apiClient.post<
      GraphQLResponse<{
        cmsActiveListingsByCategoryStatistics: ActiveListingsByCategoryResponse;
      }>
    >("/", {
      query: activeListingsByCategoryQuery,
    });

    return (
      response.data.data?.cmsActiveListingsByCategoryStatistics ?? {
        data: [],
      }
    );
  };
