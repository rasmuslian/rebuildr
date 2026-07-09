import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "./user-statistics";

export interface RepeatBuyerRateStatisticsDataPoint {
  date: string;
  total: number;
  repeat: number;
  percent: number;
}

export interface RepeatBuyerRateStatisticsResponse {
  data: RepeatBuyerRateStatisticsDataPoint[];
}

const repeatBuyerRateStatisticsQuery = `
  query CmsRepeatBuyerRateStatistics($input: CmsRepeatBuyerRateStatisticsInput) {
    cmsRepeatBuyerRateStatistics(input: $input) {
      data {
        date
        total
        repeat
        percent
      }
    }
  }
`;

export const getRepeatBuyerRateStatistics = async (
  groupBy: StatisticsGroupBy = "month",
): Promise<RepeatBuyerRateStatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsRepeatBuyerRateStatistics: RepeatBuyerRateStatisticsResponse;
    }>
  >("/", {
    query: repeatBuyerRateStatisticsQuery,
    variables: {
      input: { groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy> },
    },
  });

  return response.data.data?.cmsRepeatBuyerRateStatistics ?? { data: [] };
};
