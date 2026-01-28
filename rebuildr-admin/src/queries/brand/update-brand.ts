import { CmsUpdateBrandInput, Brand } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsUpdateBrand($input: CmsUpdateBrandInput!) {
    cmsUpdateBrand(input: $input) {
      id
      name
    }
  }
`;

export const updateBrand = async (input: CmsUpdateBrandInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateBrand: Brand }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data;
};
