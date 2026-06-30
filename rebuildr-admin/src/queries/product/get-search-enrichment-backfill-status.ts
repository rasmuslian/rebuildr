import apiClient from "@/lib/api-client";

import { SearchEnrichmentBackfillStatus } from "./backfill-search-enrichment";

const query = `
  query CmsSearchEnrichmentBackfillStatus {
    cmsSearchEnrichmentBackfillStatus {
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

export const getSearchEnrichmentBackfillStatus = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsSearchEnrichmentBackfillStatus: SearchEnrichmentBackfillStatus;
    }>
  >("/", {
    query,
  });

  return response.data.data?.cmsSearchEnrichmentBackfillStatus;
};
