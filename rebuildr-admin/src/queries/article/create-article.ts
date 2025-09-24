import { CmsCreateArticleInput, Article } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation($input: CmsCreateArticleInput!) {
    cmsCreateArticle(input: $input) {
      id
      title
      body
    }
  }
`;

export const createArticle = async (input: CmsCreateArticleInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCreateArticle: Article }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsCreateArticle;
};
