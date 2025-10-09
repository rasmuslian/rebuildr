import apiClient from "@/lib/api-client";
import { Product } from "gql/graphql";

const query = `
  mutation Mutation($productId: String!) {
    cmsDeleteProduct(productId: $productId) {
      id
      title
    }
  }
`;

export const deleteProduct = async (productId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeleteProduct: Product }>
  >("/", {
    query,
    variables: { productId },
  });

  return response.data.data?.cmsDeleteProduct;
};
