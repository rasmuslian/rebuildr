import { CmsListProjectsInput, CmsListProjectsResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query Query($input: CmsListProjectsInput!) {
    cmsListProjects(input: $input) {
      projects {
        id
        title
        contactName
        contactEmail
        contactPhone
        address
      }
      total
    }
  }
`;

export const listProjects = async (input: CmsListProjectsInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsListProjects: CmsListProjectsResponse;
    }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    products: response.data.data?.cmsListProjects.projects,
    total: response.data.data?.cmsListProjects.total,
  };
};
