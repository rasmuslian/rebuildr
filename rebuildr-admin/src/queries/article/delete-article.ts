import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation($articleId: String!) {
    cmsDeleteArticle(articleId: $articleId)
  }
`;

export const deleteArticle = async (articleId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeleteArticle: boolean }>
  >("/", {
    query,
    variables: { articleId },
  });

  return response.data.data?.cmsDeleteArticle;
};
