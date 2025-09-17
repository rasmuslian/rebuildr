import { CmsListArticlesInput, CmsListArticlesResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query CmsListArticles($input: CmsListArticlesInput!) {
    cmsListArticles(input: $input) {
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

export const listArticles = async (input: CmsListArticlesInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsListArticles: CmsListArticlesResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return {
    articles: response.data.data?.cmsListArticles.articles,
    total: response.data.data?.cmsListArticles.total,
  };
};
