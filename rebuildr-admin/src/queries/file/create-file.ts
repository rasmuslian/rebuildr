import { CmsCreateFilesInput, CmsCreateFilesResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsCreateFiles($input: CmsCreateFilesInput!) {
    cmsCreateFiles(input: $input) {
      presignedPutUrls
    }
  }
`;

export const createFiles = async (input: CmsCreateFilesInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCreateFiles: CmsCreateFilesResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsCreateFiles;
};
