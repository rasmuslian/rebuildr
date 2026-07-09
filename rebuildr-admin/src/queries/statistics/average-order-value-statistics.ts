import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "./user-statistics";

export interface AverageOrderValueStatisticsDataPoint {
  date: string;
  average: number;
}

export interface AverageOrderValueStatisticsResponse {
  data: AverageOrderValueStatisticsDataPoint[];
}

const averageOrderValueStatisticsQuery = `
  query CmsAverageOrderValueStatistics($input: CmsAverageOrderValueStatisticsInput) {
    cmsAverageOrderValueStatistics(input: $input) {
      data {
        date
        average
      }
    }
  }
`;

export const getAverageOrderValueStatistics = async (
  groupBy: StatisticsGroupBy = "month",
): Promise<AverageOrderValueStatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsAverageOrderValueStatistics: AverageOrderValueStatisticsResponse;
    }>
  >("/", {
    query: averageOrderValueStatisticsQuery,
    variables: {
      input: { groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy> },
    },
  });

  return response.data.data?.cmsAverageOrderValueStatistics ?? { data: [] };
};
