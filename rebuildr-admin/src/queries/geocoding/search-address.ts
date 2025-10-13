import { LocationSearchInput } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query LocationSearch($input: LocationSearchInput!) {
    locationSearch(input: $input) {
      result
    }
  }
`;

export const searchAddress = async (input: LocationSearchInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ locationSearch: { result: string[] } }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.locationSearch.result;
};
