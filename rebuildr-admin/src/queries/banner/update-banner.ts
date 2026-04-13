import apiClient from "@/lib/api-client";
import { CmsCreateBannerResponse, CmsUpdateBannerInput } from "gql/graphql";

const query = `
  mutation CmsUpdateBanner($input: CmsUpdateBannerInput!) {
    cmsUpdateBanner(input: $input) {
      imagePutUrl
      banner {
        id
        label
        title
      }
    }
  }
`;

export const updateBanner = async (input: CmsUpdateBannerInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateBanner: CmsCreateBannerResponse }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUpdateBanner;
};
