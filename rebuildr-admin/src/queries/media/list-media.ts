"use client";

import apiClient from "@/lib/api-client";
import { CmsListImagesInput, CmsListImagesResponse } from "gql/graphql";

const query = `
  query Files($input: CmsListImagesInput!) {
    cmsListImages(input: $input) {
      files {
        id
        name
        mimeType
        url
      }
      total
    }
  }
`;

export const listMedia = async (input: CmsListImagesInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsListImages: CmsListImagesResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    files: response.data.data?.cmsListImages.files,
    total: response.data.data?.cmsListImages.total,
  };
};
