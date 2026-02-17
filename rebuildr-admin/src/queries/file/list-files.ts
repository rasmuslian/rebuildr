"use client";

import apiClient from "@/lib/api-client";
import { CmsListFilesInput, CmsListFilesResponse } from "gql/graphql";

const query = `
  query Files($input: CmsListFilesInput!) {
    cmsListFiles(input: $input) {
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

export const listFiles = async (input: CmsListFilesInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsListFiles: CmsListFilesResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    files: response.data.data?.cmsListFiles.files,
    total: response.data.data?.cmsListFiles.total,
  };
};
