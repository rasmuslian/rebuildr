import { ListPageContentInput, ListPageContentResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query Pages($input: ListPageContentInput!) {
    listPageContents(input: $input) {
      pages {
        id
        page
        heroHtml
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const listPageContents = async (input: ListPageContentInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ listPageContents: ListPageContentResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    articles: response.data.data?.listPageContents.pages,
    total: response.data.data?.listPageContents.total,
  };
};
