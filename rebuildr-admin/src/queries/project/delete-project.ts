import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation($projectId: String!) {
    cmsDeleteProject(projectId: $projectId)
  }
`;

export const deleteProject = async (projectId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeleteProject: boolean }>
  >("/", {
    query,
    variables: { projectId },
  });
  return response.data.data?.cmsDeleteProject;
};
