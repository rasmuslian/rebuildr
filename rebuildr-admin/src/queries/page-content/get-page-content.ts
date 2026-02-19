import { PageContent } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query PageContent($id: String!) {
    pageContentById(id: $id) {
      id
      page
      heroHtml
      createdAt
      updatedAt
    }
  }
`;

export const getPageContent = async (id: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ pageContentById: PageContent }>
  >("/", {
    query,
    variables: { id },
  });

  return response.data.data?.pageContentById;
};
