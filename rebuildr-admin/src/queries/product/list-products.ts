import { CmsListProductsInput, CmsListProductsResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query CmsListProducts($input: CmsListProductsInput!) {
    cmsListProducts(input: $input) {
      total
      products {
        id
        title
        condition
        status
        hiddenReason
        seller {
          id
          email
          username
        }
        category {
          id
          name
        }
        brand {
          id
          name
        }
        price
      }
    }
  }
`;

export const listProducts = async (input: CmsListProductsInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsListProducts: CmsListProductsResponse;
    }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    products: response.data.data?.cmsListProducts.products,
    total: response.data.data?.cmsListProducts.total,
  };
};
