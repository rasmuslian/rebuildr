import { CmsPreviewSystemMessageInput } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query CmsPreviewSystemMessage($input: CmsPreviewSystemMessageInput!) {
    cmsPreviewSystemMessage(input: $input)
  }
`;

export const previewSystemMessage = async (
  input: CmsPreviewSystemMessageInput,
): Promise<string> => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsPreviewSystemMessage: string }>
  >("/", { query, variables: { input } });

  return response.data.data?.cmsPreviewSystemMessage ?? "";
};
