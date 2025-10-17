import { CmsUpdateProductInput, CmsUpdateProductResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsupdateProduct($input: CmsUpdateProductInput!) {
    cmsUpdateProduct(input: $input) {
      imagePutUrls
      product {
        id
        title
        description
      }
    }
  }
`;

export const updateProduct = async (input: CmsUpdateProductInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateProduct: CmsUpdateProductResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUpdateProduct;
};
