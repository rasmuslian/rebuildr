import { CmsCreateBrandInput, Brand } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation($input: CmsCreateBrandInput!) {
    cmsCreateBrand(input: $input) {
      id
      name
    }
  }
`;

export const createBrand = async (input: CmsCreateBrandInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCreateBrand: Brand }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data;
};
