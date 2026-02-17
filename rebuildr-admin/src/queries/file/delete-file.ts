import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation($id: String!) {
    cmsDeleteFile(id: $id) {
      id
    }
  }
`;

export const deleteFile = async (id: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeleteFile: { id: string } }>
  >("/", {
    query,
    variables: { id },
  });
  if (response.data.errors) {
    throw new Error();
  }

  return response.data.data?.cmsDeleteFile;
};
