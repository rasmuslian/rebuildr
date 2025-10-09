import apiClient from "@/lib/api-client";
import { Product } from "gql/graphql";

const query = `
  mutation Mutation($productId: String!, $hiddenReason: String!) {
    cmsHideProduct(productId: $productId, hiddenReason: $hiddenReason) {
      id
      title
    }
  }
`;

export const hideProduct = async (productId: string, hiddenReason: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsHideProduct: Product }>
  >("/", {
    query,
    variables: { productId, hiddenReason },
  });

  return response.data.data?.cmsHideProduct;
};
