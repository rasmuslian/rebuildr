import apiClient from "@/lib/api-client";

const query = `
  mutation CmsUpdateNewsletterCompetition($input: CmsUpdateNewsletterCompetitionInput!) {
    cmsUpdateNewsletterCompetition(input: $input) {
      imagePutUrl
      newsletterCompetition {
        id
        productTitle
        productValue
        bodyText
        nextDrawDate
      }
    }
  }
`;

export type UpdateNewsletterCompetitionInput = {
  title: string;
  productTitle: string;
  productValue: string;
  bodyText: string;
  nextDrawDate: Date;
  productImage?: {
    url: string;
    name: string;
    mimeType: string;
    source: string;
  };
};

export type UpdateNewsletterCompetitionResponse = {
  imagePutUrl?: string;
  newsletterCompetition: { id: string };
};

export const updateNewsletterCompetition = async (
  input: UpdateNewsletterCompetitionInput,
): Promise<UpdateNewsletterCompetitionResponse> => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsUpdateNewsletterCompetition: UpdateNewsletterCompetitionResponse;
    }>
  >("/", { query, variables: { input } });

  return response.data.data.cmsUpdateNewsletterCompetition;
};
