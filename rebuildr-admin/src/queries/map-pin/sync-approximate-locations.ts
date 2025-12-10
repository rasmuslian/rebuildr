import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation {
    syncApproximateLocations
  }
`;

export const syncApproximateLocations = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ syncApproximateLocations: boolean }>
  >("/", {
    query,
  });

  return response.data.data?.syncApproximateLocations;
};
