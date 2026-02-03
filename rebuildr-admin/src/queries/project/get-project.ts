import apiClient from "@/lib/api-client";
import { GetProjectInput, Project } from "gql/graphql";

const query = `
  query GetProject($input: GetProjectInput!) {
    getProject(input: $input) {
      id
      title
      contactEmail
      contactPhone
      contactName
      description
      address
      showDetailsOnMap
    }
  }
`;

export const getProject = async (input: GetProjectInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ getProject: Project }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.getProject;
};
