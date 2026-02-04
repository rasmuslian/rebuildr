import apiClient from "@/lib/api-client";
import { CmsDeletePartnerInput, Partner } from "gql/graphql";

const query = `
  mutation CmsDeletePartner($input: CmsDeletePartnerInput!) {
    cmsDeletePartner(input: $input)
  }
`;

export const deletePartner = async (input: CmsDeletePartnerInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsDeletePartner: boolean }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsDeletePartner;
};
