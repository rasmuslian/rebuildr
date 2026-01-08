import apiClient from "@/lib/api-client";
import { CmsTestTemplateInput } from "gql/graphql";

const query = `
  mutation TestEmailTemplate($input: CmsTestTemplateInput!) {
    cmsTestTemplate(input: $input)
  }
`;

export const testTemplates = async (input: CmsTestTemplateInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsTestTemplate: boolean }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsTestTemplate;
};
