import { Article } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query Article($articleId: String!) {
    article(id: $articleId) {
      id
      title
      body
    }
  }
`;

export const getArticle = async (articleId: string) => {
  const response = await apiClient.post<GraphQLResponse<{ article: Article }>>(
    "/",
    {
      query,
      variables: { articleId },
    },
  );

  return response.data.data?.article;
};
