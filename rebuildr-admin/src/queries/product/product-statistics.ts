import apiClient from "@/lib/api-client";

export type ProductStatisticsGroupBy = "day" | "week" | "month";

export interface ProductStatisticsDataPoint {
  date: string;
  count: number;
}

export interface ProductStatisticsResponse {
  data: ProductStatisticsDataPoint[];
}

const query = `
  query CmsProductStatistics($input: CmsProductStatisticsInput) {
    cmsProductStatistics(input: $input) {
      data {
        date
        count
      }
    }
  }
`;

export const getProductStatistics = async (
  groupBy: ProductStatisticsGroupBy = "month",
): Promise<ProductStatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsProductStatistics: ProductStatisticsResponse }>
  >("/", {
    query,
    variables: { input: { groupBy: groupBy.toUpperCase() as Uppercase<ProductStatisticsGroupBy> } },
  });

  return (
    response.data.data?.cmsProductStatistics ?? { data: [] }
  );
};
