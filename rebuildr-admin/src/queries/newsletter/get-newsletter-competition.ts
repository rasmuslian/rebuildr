import apiClient from "@/lib/api-client";

const query = `
  query GetNewsletterCompetition {
    newsletterCompetition {
      id
      title
      productTitle
      productValue
      bodyText
      nextDrawDate
      productImage {
        id
        url
        name
        mimeType
      }
    }
  }
`;

export type NewsletterCompetitionData = {
  id: string;
  title: string;
  productTitle: string;
  productValue: string;
  bodyText: string;
  nextDrawDate: string;
  productImage?: {
    id: string;
    url: string;
    name?: string;
    mimeType: string;
  } | null;
};

export const getNewsletterCompetition = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ newsletterCompetition: NewsletterCompetitionData }>
  >("/", { query });

  return response.data.data?.newsletterCompetition;
};
