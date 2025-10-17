import { Project, CmsCreateProjectInput } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation($input: CmsCreateProjectInput!) {
    cmsCreateProject(input: $input) {
      id
      title
    }
  }
`;

export const createProject = async (input: CmsCreateProjectInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCreateProject: Project }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsCreateProject;
};
