import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "./user-statistics";

export interface RevenueStatisticsDataPoint {
  date: string;
  total: number;
}

export interface RevenueStatisticsResponse {
  data: RevenueStatisticsDataPoint[];
}

const revenueStatisticsQuery = `
  query CmsRevenueStatistics($input: CmsRevenueStatisticsInput) {
    cmsRevenueStatistics(input: $input) {
      data {
        date
        total
      }
    }
  }
`;

export const getRevenueStatistics = async (
  groupBy: StatisticsGroupBy = "month",
): Promise<RevenueStatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsRevenueStatistics: RevenueStatisticsResponse }>
  >("/", {
    query: revenueStatisticsQuery,
    variables: {
      input: { groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy> },
    },
  });

  return response.data.data?.cmsRevenueStatistics ?? { data: [] };
};
