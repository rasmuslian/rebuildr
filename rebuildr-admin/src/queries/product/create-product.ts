import { CmsCreateProductInput, CmsCreateProductResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation($input: CmsCreateProductInput!) {
    cmsCreateProduct(input: $input) {
      imagePutUrls
      documentPutUrls
      product {
        id
        title
        description
      }
    }
  }
`;

export const createProduct = async (input: CmsCreateProductInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCreateProduct: CmsCreateProductResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsCreateProduct;
};
