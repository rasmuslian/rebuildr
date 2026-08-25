import apiClient from "@/lib/api-client";

export type StatisticsGroupBy = "day" | "week" | "month";

export interface StatisticsDataPoint {
  date: string;
  count: number;
}

export interface StatisticsResponse {
  data: StatisticsDataPoint[];
}

const userStatisticsQuery = `
  query CmsUserStatistics($input: CmsUserStatisticsInput) {
    cmsUserStatistics(input: $input) {
      data {
        date
        count
      }
    }
  }
`;

export const getUserStatistics = async (
  groupBy: StatisticsGroupBy = "month",
  from?: string,
  to?: string,
): Promise<StatisticsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUserStatistics: StatisticsResponse }>
  >("/", {
    query: userStatisticsQuery,
    variables: {
      input: {
        groupBy: groupBy.toUpperCase() as Uppercase<StatisticsGroupBy>,
        from,
        to,
      },
    },
  });

  return response.data.data?.cmsUserStatistics ?? { data: [] };
};
