import apiClient from "@/lib/api-client";

export type InsightsGroupBy = "DAY" | "WEEK" | "MONTH";

export interface TimeToSellPoint {
  date: string;
  medianDays: number;
  p25Days: number;
  p75Days: number;
  count: number;
}

export interface BreakdownEntry {
  method: string;
  count: number;
  gmvSek: number;
}

export interface ReviewStatsResponse {
  average: number;
  count: number;
  distribution: { stars: number; count: number }[];
  series: { date: string; avgStars: number; count: number }[];
}

export interface PriceBucket {
  fromSek: number;
  toSek: number | null;
  count: number;
}

const timeToSellQuery = `
  query CmsTimeToSell($input: CmsTimeToSellInput!) {
    cmsTimeToSell(input: $input) {
      data { date medianDays p25Days p75Days count }
    }
  }
`;

export const getTimeToSell = async (input: {
  from: string;
  to: string;
  groupBy: InsightsGroupBy;
}): Promise<TimeToSellPoint[]> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsTimeToSell: { data: TimeToSellPoint[] } }>
  >("/", { query: timeToSellQuery, variables: { input } });

  return response.data.data?.cmsTimeToSell.data ?? [];
};

const breakdownsQuery = `
  query CmsPurchaseBreakdowns($input: CmsPurchaseBreakdownsInput!) {
    cmsPurchaseBreakdowns(input: $input) {
      transport { method count gmvSek }
      payment { method count gmvSek }
    }
  }
`;

export const getPurchaseBreakdowns = async (input: {
  from: string;
  to: string;
}): Promise<{ transport: BreakdownEntry[]; payment: BreakdownEntry[] }> => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsPurchaseBreakdowns: {
        transport: BreakdownEntry[];
        payment: BreakdownEntry[];
      };
    }>
  >("/", { query: breakdownsQuery, variables: { input } });

  return (
    response.data.data?.cmsPurchaseBreakdowns ?? { transport: [], payment: [] }
  );
};

const reviewStatsQuery = `
  query CmsReviewStats($input: CmsReviewStatsInput!) {
    cmsReviewStats(input: $input) {
      average
      count
      distribution { stars count }
      series { date avgStars count }
    }
  }
`;

export const getReviewStats = async (input: {
  from: string;
  to: string;
  groupBy: InsightsGroupBy;
}): Promise<ReviewStatsResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsReviewStats: ReviewStatsResponse }>
  >("/", { query: reviewStatsQuery, variables: { input } });

  return (
    response.data.data?.cmsReviewStats ?? {
      average: 0,
      count: 0,
      distribution: [],
      series: [],
    }
  );
};

const priceDistributionQuery = `
  query CmsPriceDistribution($input: CmsPriceDistributionInput!) {
    cmsPriceDistribution(input: $input) {
      buckets { fromSek toSek count }
    }
  }
`;

export const getPriceDistribution = async (input: {
  from: string;
  to: string;
  condition?: string;
}): Promise<PriceBucket[]> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsPriceDistribution: { buckets: PriceBucket[] } }>
  >("/", { query: priceDistributionQuery, variables: { input } });

  return response.data.data?.cmsPriceDistribution.buckets ?? [];
};
