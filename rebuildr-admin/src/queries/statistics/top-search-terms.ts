import apiClient from "@/lib/api-client";

export interface TopSearchTermEntry {
  term: string;
  count: number;
}

const topSearchTermsQuery = `
  query CmsTopSearchTerms($input: CmsTopSearchTermsInput!) {
    cmsTopSearchTerms(input: $input) {
      term
      count
    }
  }
`;

export const getTopSearchTerms = async (input: {
  from: string;
  to: string;
  limit?: number;
}): Promise<TopSearchTermEntry[]> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsTopSearchTerms: TopSearchTermEntry[] }>
  >("/", {
    query: topSearchTermsQuery,
    variables: { input },
  });

  return response.data.data?.cmsTopSearchTerms ?? [];
};
