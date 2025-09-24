import apiClient from "@/lib/api-client";

const query = `
  mutation CmsDeleteFile($imageId: String!) {
    cmsDeleteFile(imageId: $imageId)
  }
`;

export const deleteMedia = async (imageId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeleteFile: Boolean }>
  >("/", {
    query,
    variables: { imageId },
  });

  return response.data.data?.cmsDeleteFile;
};
