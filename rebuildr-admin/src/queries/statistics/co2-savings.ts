import apiClient from "@/lib/api-client";
import { StatisticsGroupBy } from "@/queries/statistics/user-statistics";

export interface Co2SavingsDataPoint {
  date: string;
  co2Kg: number;
}

export interface Co2SavingsResponse {
  data: Co2SavingsDataPoint[];
}

const co2SavingsQuery = `
  query CmsCo2SavingsStatistics($input: CmsCo2SavingsInput) {
    cmsCo2SavingsStatistics(input: $input) {
      data {
        date
        co2Kg
      }
    }
  }
`;

export const getCo2Savings = async (
  groupBy: StatisticsGroupBy = "month",
  from?: string,
  to?: string,
): Promise<Co2SavingsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCo2SavingsStatistics: Co2SavingsResponse }>
  >("/", {
    query: co2SavingsQuery,
    variables: {
      input: {
        groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy>,
        from,
        to,
      },
    },
  });

  return response.data.data?.cmsCo2SavingsStatistics ?? { data: [] };
};
