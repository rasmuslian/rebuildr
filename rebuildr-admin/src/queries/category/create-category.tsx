import { CmsCreateCategoryInput, CmsCreateCategoryResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsCreateCategory($input: CmsCreateCategoryInput!) {
    cmsCreateCategory(input: $input) {
      category {
        id
        name
        searchAliases
      }
      imagePutUrl
    }
  }
`;

export const createCategory = async (input: CmsCreateCategoryInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCreateCategory: CmsCreateCategoryResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsCreateCategory;
};
