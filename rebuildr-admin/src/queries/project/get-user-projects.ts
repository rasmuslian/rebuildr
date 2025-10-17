import apiClient from "@/lib/api-client";
import { Project } from "gql/graphql";

const query = `
  query CmsGetUserProjects($sellerId: String) {
    cmsGetUserProjects(sellerId: $sellerId) {
      id
      title
      description
    }
  }
`;

export const getUserProjects = async (sellerId?: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsGetUserProjects: Project[] }>
  >("/", {
    query,
    variables: { sellerId },
  });

  return response.data.data?.cmsGetUserProjects;
};
