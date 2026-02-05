import apiClient from "@/lib/api-client";
import { CmsCreatePartnerInput, CmsCreatePartnerResponse } from "gql/graphql";

const query = `
  mutation CmsCreatePartner($input: CmsCreatePartnerInput!) {
    cmsCreatePartner(input: $input) {
      imagePutUrl
      partner {
        id
        name
      }
    }
  }
`;

export const createPartner = async (input: CmsCreatePartnerInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCreatePartner: CmsCreatePartnerResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsCreatePartner;
};
