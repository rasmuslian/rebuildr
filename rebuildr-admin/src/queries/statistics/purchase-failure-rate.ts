import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "@/queries/statistics/user-statistics";

export interface PurchaseFailureRateDataPoint {
  date: string;
  total: number;
  failed: number;
  percent: number;
}

export interface PurchaseFailureRateResponse {
  data: PurchaseFailureRateDataPoint[];
}

const purchaseFailureRateQuery = `
  query CmsPurchaseFailureRateStatistics($input: CmsPurchaseFailureRateInput) {
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

export const getPurchaseFailureRate = async (
  groupBy: StatisticsGroupBy = "month",
  from?: string,
  to?: string,
): Promise<PurchaseFailureRateResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsPurchaseFailureRateStatistics: PurchaseFailureRateResponse;
    }>
  >("/", {
    query: purchaseFailureRateQuery,
    variables: {
      input: {
        groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy>,
        from,
        to,
      },
    },
  });

  return (
    response.data.data?.cmsPurchaseFailureRateStatistics ?? { data: [] }
  );
};
