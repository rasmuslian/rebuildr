import apiClient from "@/lib/api-client";

export interface KpiValue {
  value: number;
  previousValue: number | null;
  changePercent: number | null;
}

export interface KpiSummaryResponse {
  listingsPublished: KpiValue;
  salesCount: KpiValue;
  listingsSold: KpiValue;
  upcomingListingsCreated: KpiValue;
  activeUsers: KpiValue;
  newUsers: KpiValue;
  totalSalesSek: KpiValue;
  avgOrderValueSek: KpiValue;
  avgItemPriceSek: KpiValue;
  co2SavedKg: KpiValue;
  activeListingsNow: KpiValue;
  newBusinessUsers: KpiValue;
  messagesSent: KpiValue;
}

const kpiSummaryQuery = `
  fragment KpiValueFields on CmsKpiValue {
    value
    previousValue
    changePercent
  }

  query CmsKpiSummary($input: CmsKpiSummaryInput!) {
    cmsKpiSummary(input: $input) {
      listingsPublished { ...KpiValueFields }
      salesCount { ...KpiValueFields }
      listingsSold { ...KpiValueFields }
      upcomingListingsCreated { ...KpiValueFields }
      activeUsers { ...KpiValueFields }
      newUsers { ...KpiValueFields }
      totalSalesSek { ...KpiValueFields }
      avgOrderValueSek { ...KpiValueFields }
      avgItemPriceSek { ...KpiValueFields }
      co2SavedKg { ...KpiValueFields }
      activeListingsNow { ...KpiValueFields }
      newBusinessUsers { ...KpiValueFields }
      messagesSent { ...KpiValueFields }
    }
  }
`;

export const getKpiSummary = async (input: {
  from: string;
  to: string;
}): Promise<KpiSummaryResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsKpiSummary: KpiSummaryResponse }>
  >("/", {
    query: kpiSummaryQuery,
    variables: { input },
  });

  const summary = response.data.data?.cmsKpiSummary;
  if (!summary) {
    throw new Error(
      response.data.errors?.[0]?.message ?? "Failed to fetch KPI summary",
    );
  }

  return summary;
};
