import { ListArticlesInput, ListArticlesResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query Articles($input: ListArticlesInput!) {
    listArticles(input: $input) {
      articles {
        id
        title
        createdAt
        updatedAt
      }
      total
    }
  }
`;

export const listArticles = async (input: ListArticlesInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ listArticles: ListArticlesResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    articles: response.data.data?.listArticles.articles,
    total: response.data.data?.listArticles.total,
  };
};
