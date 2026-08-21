import { CmsUpdateCategoryResponse, FileInputType } from "gql/graphql";

import apiClient from "@/lib/api-client";

const query = `
  mutation CmsUpdateGiveawayCategoryImage($input: CmsUpdateGiveawayCategoryImageInput!) {
    cmsUpdateGiveawayCategoryImage(input: $input) {
      imagePutUrl
      category {
        id
        image {
          id
          url
        }
      }
    }
  }
`;

export const updateGiveawayCategoryImage = async (image: FileInputType) => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsUpdateGiveawayCategoryImage: CmsUpdateCategoryResponse;
    }>
  >("/", {
    query,
    variables: { input: { image } },
  });

  return response.data.data?.cmsUpdateGiveawayCategoryImage;
};
