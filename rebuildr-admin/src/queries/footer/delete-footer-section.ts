import apiClient from "@/lib/api-client";

const query = `
  mutation CmsDeleteFooterSection($footerSectionId: String!) {
    cmsDeleteFooterSection(footerSectionId: $footerSectionId)
  }
`;

export const deleteFooterSection = async (footerSectionId: String) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeleteFooterSection: Boolean }>
  >("/", {
    query,
    variables: { footerSectionId },
  });

  return response.data.data?.cmsDeleteFooterSection;
};
