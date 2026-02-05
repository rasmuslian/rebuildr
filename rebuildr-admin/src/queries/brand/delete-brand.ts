import apiClient from "@/lib/api-client";
import { CmsBrandIdInput } from "gql/graphql";

const query = `
  mutation CmsDeleteBrand($input: CmsBrandIdInput!) {
    cmsDeleteBrand(input: $input)
  }
`;

export const deleteBrand = async (input: CmsBrandIdInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeleteBrand: boolean }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsDeleteBrand ?? false;
};
