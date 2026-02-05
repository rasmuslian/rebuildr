import apiClient from "@/lib/api-client";

const query = `
  query CanDeleteBrand($brandId: String!) {
    brand(id: $brandId) {
      id
      canDelete
    }
  }
`;

export const canDeleteBrand = async (brandId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ brand: { id: string; canDelete: boolean } }>
  >("/", {
    query,
    variables: {
      brandId,
    },
  });

  return response.data.data?.brand;
};
