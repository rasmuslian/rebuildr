import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "@/queries/statistics/user-statistics";

export interface RepeatBuyerRateDataPoint {
  date: string;
  total: number;
  repeat: number;
  percent: number;
}

export interface RepeatBuyerRateResponse {
  data: RepeatBuyerRateDataPoint[];
}

const repeatBuyerRateQuery = `
  query CmsRepeatBuyerRateStatistics($input: CmsRepeatBuyerRateInput) {
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

export const getRepeatBuyerRate = async (
  groupBy: StatisticsGroupBy = "month",
  from?: string,
  to?: string,
): Promise<RepeatBuyerRateResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsRepeatBuyerRateStatistics: RepeatBuyerRateResponse }>
  >("/", {
    query: repeatBuyerRateQuery,
    variables: {
      input: {
        groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy>,
        from,
        to,
      },
    },
  });

  return response.data.data?.cmsRepeatBuyerRateStatistics ?? { data: [] };
};
