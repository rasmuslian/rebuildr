import { CmsUploadFileInput, CmsUploadFileResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsUploadFiles($input: CmsUploadFileInput!) {
    cmsUploadFiles(input: $input) {
      presignedPutUrls
    }
  }
`;

export const createMedia = async (input: CmsUploadFileInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUploadFiles: CmsUploadFileResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUploadFiles;
};
