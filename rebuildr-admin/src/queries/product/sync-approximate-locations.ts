import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation {
    syncProductsApproximateLocations
  }
`;

export const syncApproximateLocations = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ syncProductsApproximateLocations: boolean }>
  >("/", {
    query,
  });

  return response.data.data?.syncProductsApproximateLocations;
};
