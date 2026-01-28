import { Brand } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query Query($brandId: String!) {
    brand(id: $brandId) {
      id
      name
      slug
    }
  }
`;

export const getBrand = async (brandId: string) => {
  const response = await apiClient.post<GraphQLResponse<{ brand: Brand }>>(
    "/",
    {
      query,
      variables: {
        brandId,
      },
    },
  );

  return response.data.data?.brand;
};
