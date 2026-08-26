import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "./user-statistics";

export interface PurchaseStatisticsDataPoint {
  date: string;
  count: number;
  gmvSek: number | null;
}

export interface PurchaseStatisticsResponse {
  data: PurchaseStatisticsDataPoint[];
}

const purchaseStatisticsQuery = `
  query CmsPurchaseStatistics($input: CmsPurchaseStatisticsInput) {
    cmsPurchaseStatistics(input: $input) {
      data {
        date
        count
        gmvSek
      }
    }
  }
`;

export const getPurchaseStatistics = async (
  groupBy: StatisticsGroupBy = "month",
  from?: string,
  to?: string,
): Promise<PurchaseStatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsPurchaseStatistics: PurchaseStatisticsResponse }>
  >("/", {
    query: purchaseStatisticsQuery,
    variables: {
      input: {
        groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy>,
        from,
        to,
      },
    },
  });

  return response.data.data?.cmsPurchaseStatistics ?? { data: [] };
};
