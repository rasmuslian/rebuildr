import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "./user-statistics";

export interface Co2SavingsStatisticsDataPoint {
  date: string;
  total: number;
}

export interface Co2SavingsStatisticsResponse {
  data: Co2SavingsStatisticsDataPoint[];
}

const co2SavingsStatisticsQuery = `
  query CmsCo2SavingsStatistics($input: CmsCo2SavingsStatisticsInput) {
    cmsCo2SavingsStatistics(input: $input) {
      data {
        date
        total
      }
    }
  }
`;

export const getCo2SavingsStatistics = async (
  groupBy: StatisticsGroupBy = "month",
): Promise<Co2SavingsStatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCo2SavingsStatistics: Co2SavingsStatisticsResponse }>
  >("/", {
    query: co2SavingsStatisticsQuery,
    variables: {
      input: { groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy> },
    },
  });

  return response.data.data?.cmsCo2SavingsStatistics ?? { data: [] };
};
