import apiClient from "@/lib/api-client";
import { ListBrandsInput, ListBrandsResponse } from "gql/graphql";

const query = `
  query ListBrands($input: ListBrandsInput!) {
    listBrands(input: $input) {
      brands {
        id
        name
        slug
        createdBy {
          id
          email
        }
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const listBrands = async (input: ListBrandsInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ listBrands: ListBrandsResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    brands: response.data.data?.listBrands.brands,
    total: response.data.data?.listBrands.total,
  };
};
