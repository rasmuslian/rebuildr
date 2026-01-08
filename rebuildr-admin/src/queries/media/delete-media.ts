import apiClient from "@/lib/api-client";

const query = `
  mutation CmsDeleteFile($imageId: String!) {
    cmsDeleteFile(imageId: $imageId) {
      id
    }
  }
`;

export const deleteMedia = async (imageId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeleteFile: { id: string } }>
  >("/", {
    query,
    variables: { imageId },
  });
  if (response.data.errors) {
    throw new Error();
  }

  return response.data.data?.cmsDeleteFile;
};
