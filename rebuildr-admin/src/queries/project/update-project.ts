import { Project, CmsUpdateProjectInput } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsUpdateProject($input: CmsUpdateProjectInput!) {
    cmsUpdateProject(input: $input) {
      id
      title
    }
  }
`;

export const updateProject = async (input: CmsUpdateProjectInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateProject: Project }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUpdateProject;
};
