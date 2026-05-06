import apiClient from "@/lib/api-client";
import { StatisticsGroupBy, StatisticsResponse } from "./user-statistics";

const purchaseStatisticsQuery = `
  query CmsPurchaseStatistics($input: CmsPurchaseStatisticsInput) {
    cmsPurchaseStatistics(input: $input) {
      data {
        date
        count
      }
    }
  }
`;

export const getPurchaseStatistics = async (
  groupBy: StatisticsGroupBy = "month",
): Promise<StatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsPurchaseStatistics: StatisticsResponse }>
  >("/", {
    query: purchaseStatisticsQuery,
    variables: {
      input: { groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy> },
    },
  });

  return response.data.data?.cmsPurchaseStatistics ?? { data: [] };
};
