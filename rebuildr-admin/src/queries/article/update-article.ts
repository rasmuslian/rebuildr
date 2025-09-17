import { Article, CmsUpdateArticleInput } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsUpdateArticle($input: CmsUpdateArticleInput!) {
    cmsUpdateArticle(input: $input) {
      id
      title
      body
    }
  }
`;

export const updateArticle = async (input: CmsUpdateArticleInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateArticle: Article }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUpdateArticle;
};
