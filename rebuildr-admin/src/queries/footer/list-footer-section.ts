import { FooterSection } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query ListFooterSection {
    listFooterSection {
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
          body
        }
      }
    }
  }
`;

export const listFooterSections = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ listFooterSection: FooterSection[] }>
  >("/", {
    query,
  });

  return response.data.data?.listFooterSection;
};
