import apiClient from "@/lib/api-client";

const query = `
  mutation CmsDeleteFooterSection($footerSectionId: String!) {
    cmsDeleteFooterSection(footerSectionId: $footerSectionId)
  }
`;

export const deleteFooterSection = async (footerSectionId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeleteFooterSection: boolean }>
  >("/", {
    query,
    variables: { footerSectionId },
  });

  return response.data.data?.cmsDeleteFooterSection;
};
