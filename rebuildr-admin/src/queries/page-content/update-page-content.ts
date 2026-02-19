import { UpdatePageContentInput, PageContent } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation UpdatePageContent($input: UpdatePageContentInput!) {
    updatePageContent(input: $input) {
      id
    }
  }
`;

export const updatePageContent = async (input: UpdatePageContentInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ updatePageContent: PageContent }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.updatePageContent;
};
