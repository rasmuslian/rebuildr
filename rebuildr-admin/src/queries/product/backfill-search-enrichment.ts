import apiClient from "@/lib/api-client";

const query = `
  mutation CmsBackfillSearchEnrichment {
    cmsBackfillSearchEnrichment {
      state
      startedAt
      finishedAt
      enrichedCategories
      enrichedProducts
      failedCategories
      failedProducts
      remainingCategories
      remainingProducts
      currentItemType
      currentItemId
      currentItemName
      currentAttempt
      lastProgressAt
      lastError
    }
  }
`;

export interface SearchEnrichmentBackfillStatus {
  state: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  enrichedCategories: number;
  enrichedProducts: number;
  failedCategories: number;
  failedProducts: number;
  remainingCategories: number;
  remainingProducts: number;
  currentItemType?: string | null;
  currentItemId?: string | null;
  currentItemName?: string | null;
  currentAttempt?: number | null;
  lastProgressAt?: string | null;
  lastError?: string | null;
}

export const backfillSearchEnrichment = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsBackfillSearchEnrichment: SearchEnrichmentBackfillStatus;
    }>
  >("/", {
    query,
  });

  return response.data.data?.cmsBackfillSearchEnrichment;
};
