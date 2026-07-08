import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "./user-statistics";

export interface PurchaseFailureRateStatisticsDataPoint {
  date: string;
  total: number;
  failed: number;
  percent: number;
}

export interface PurchaseFailureRateStatisticsResponse {
  data: PurchaseFailureRateStatisticsDataPoint[];
}

const purchaseFailureRateStatisticsQuery = `
  query CmsPurchaseFailureRateStatistics($input: CmsPurchaseFailureRateStatisticsInput) {
    cmsPurchaseFailureRateStatistics(input: $input) {
      data {
        date
        total
        failed
        percent
      }
    }
  }
`;

export const getPurchaseFailureRateStatistics = async (
  groupBy: StatisticsGroupBy = "month",
): Promise<PurchaseFailureRateStatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsPurchaseFailureRateStatistics: PurchaseFailureRateStatisticsResponse;
    }>
  >("/", {
    query: purchaseFailureRateStatisticsQuery,
    variables: {
      input: { groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy> },
    },
  });

  return response.data.data?.cmsPurchaseFailureRateStatistics ?? { data: [] };
};
