import apiClient from "@/lib/api-client";
import { Banner } from "gql/graphql";

const query = `
  query CmsListBanners {
    cmsListBanners {
      id
      label
      title
      url
      action
      presetBackground
      placements
      logo {
        id
        url
      }
      backgroundImage {
        id
        url
      }
      showFrom
      showTo
      createdAt
    }
  }
`;

export const listBanners = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsListBanners: Banner[] }>
  >("/", {
    query,
  });

  return response.data.data?.cmsListBanners ?? [];
};
