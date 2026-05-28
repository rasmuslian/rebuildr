import apiClient from "@/lib/api-client";
import { FileInputType } from "gql/graphql";

const query = `
  mutation CmsUpdateNewsletterCompetition($input: CmsUpdateNewsletterCompetitionInput!) {
    cmsUpdateNewsletterCompetition(input: $input) {
      imagePutUrl
      newsletterCompetition {
        id
        title
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
  productImage?: FileInputType;
};

export type UpdateNewsletterCompetitionResponse = {
  imagePutUrl?: string;
  newsletterCompetition: { id: string };
};

export const updateNewsletterCompetition = async (
  input: UpdateNewsletterCompetitionInput,
) => {
  const response = await apiClient.post<
    GraphQLResponse<{
      cmsUpdateNewsletterCompetition: UpdateNewsletterCompetitionResponse;
    }>
  >("/", { query, variables: { input } });

  return response.data.data?.cmsUpdateNewsletterCompetition;
};
