import { CmsUpdateCategoryInput, CmsUpdateCategoryResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsUpdateCategory($input: CmsUpdateCategoryInput!) {
    cmsUpdateCategory(input: $input) {
      imagePutUrl
      category {
        id
        name
        description
        searchAliases
        inSeason
        inSelection
        image {
          url
          id
        }
      }
    }
}
`;

export const updateCategory = async (input: CmsUpdateCategoryInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateCategory: CmsUpdateCategoryResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUpdateCategory;
};
