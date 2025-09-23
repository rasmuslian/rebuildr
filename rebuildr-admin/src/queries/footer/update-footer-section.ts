import { FooterSection, CmsUpdateFooterSectionInput } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation CmsCreateFooterSection($input: CmsUpdateFooterSectionInput!) {
    cmsUpdateFooterSection(input: $input) {
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

export const updateFooterSection = async (
  input: CmsUpdateFooterSectionInput,
) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateFooterSection: FooterSection }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUpdateFooterSection;
};
