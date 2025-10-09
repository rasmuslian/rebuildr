import apiClient from "@/lib/api-client";
import { Product } from "gql/graphql";

const query = `
  mutation Mutation($productId: String!) {
    cmsUnhideProduct(productId: $productId) {
      id
      title
    }
  }
`;

export const unhideProduct = async (productId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUnhideProduct: Product }>
  >("/", {
    query,
    variables: { productId },
  });

  return response.data.data?.cmsUnhideProduct;
};
