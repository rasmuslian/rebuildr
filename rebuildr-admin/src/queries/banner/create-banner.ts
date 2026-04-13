import apiClient from "@/lib/api-client";
import { CmsCreateBannerInput, CmsCreateBannerResponse } from "gql/graphql";

const query = `
  mutation CmsCreateBanner($input: CmsCreateBannerInput!) {
    cmsCreateBanner(input: $input) {
      imagePutUrl
      banner {
        id
        label
        title
      }
    }
  }
`;

export const createBanner = async (input: CmsCreateBannerInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsCreateBanner: CmsCreateBannerResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsCreateBanner;
};
