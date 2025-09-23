import { FooterSection, CmsCreateFooterSectionInput } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsCreateFooterSection($input: CmsCreateFooterSectionInput!) {
    cmsCreateFooterSection(input: $input) {
      id
      title
      orderIndex
      articleFooterSections {
        articleId
        footerSectionId
        orderIndex
        article {
          id
          title
        }
      }
    }
  }
`;

export const createFooterSection = async (
  input: CmsCreateFooterSectionInput,
) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCreateFooterSection: FooterSection }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsCreateFooterSection;
};
