import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "./user-statistics";

export interface AverageTimeToPublishStatisticsDataPoint {
  date: string;
  averageDays: number;
}

export interface AverageTimeToPublishStatisticsResponse {
  data: AverageTimeToPublishStatisticsDataPoint[];
}

const averageTimeToPublishStatisticsQuery = `
  query CmsAverageTimeToPublishStatistics($input: CmsAverageTimeToPublishStatisticsInput) {
    cmsAverageTimeToPublishStatistics(input: $input) {
      data {
        date
        averageDays
      }
    }
  }
`;

export const getAverageTimeToPublishStatistics = async (
  groupBy: StatisticsGroupBy = "month",
): Promise<AverageTimeToPublishStatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsAverageTimeToPublishStatistics: AverageTimeToPublishStatisticsResponse;
    }>
  >("/", {
    query: averageTimeToPublishStatisticsQuery,
    variables: {
      input: { groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy> },
    },
  });

  return (
    response.data.data?.cmsAverageTimeToPublishStatistics ?? { data: [] }
  );
};
