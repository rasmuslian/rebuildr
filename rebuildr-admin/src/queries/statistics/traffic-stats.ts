import apiClient from "@/lib/api-client";

export interface TrafficEntry {
  name: string;
  sessions: number;
}

export interface TrafficStatsResponse {
  sessions: number;
  totalUsers: number;
  pageViews: number;
  topSources: TrafficEntry[];
  topLandingPages: TrafficEntry[];
  topCities: TrafficEntry[];
}

const trafficStatsQuery = `
  query CmsTrafficStats($input: CmsTrafficStatsInput!) {
    cmsTrafficStats(input: $input) {
      sessions
      totalUsers
      pageViews
      topSources {
        name
        sessions
      }
      topLandingPages {
        name
        sessions
      }
      topCities {
        name
        sessions
      }
    }
  }
`;

export const getTrafficStats = async (input: {
  from: string;
  to: string;
}): Promise<TrafficStatsResponse | null> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsTrafficStats: TrafficStatsResponse | null }>
  >("/", {
    query: trafficStatsQuery,
    variables: { input },
  });

  return response.data.data?.cmsTrafficStats ?? null;
};
