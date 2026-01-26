import { CmsUpdateCategoriesInput } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsUpdateCategoryOrder($input: CmsUpdateCategoriesInput!) {
    cmsUpdateCategoriesOrder(input: $input) 
}
`;

export const updateCategoriesOrder = async (
  input: CmsUpdateCategoriesInput,
) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateCategoriesOrder: Boolean }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUpdateCategoriesOrder;
};
