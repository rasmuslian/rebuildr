import apiClient from "@/lib/api-client";
import { CmsCreatePartnerResponse, CmsUpdatePartnerInput } from "gql/graphql";

const query = `
  mutation CmsUpdatePartner($input: CmsUpdatePartnerInput!) {
    cmsUpdatePartner(input: $input) {
      imagePutUrl
      partner {
        id
        name
      }
    }
  }
`;

export const updatePartner = async (input: CmsUpdatePartnerInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdatePartner: CmsCreatePartnerResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUpdatePartner;
};
