import apiClient from "@/lib/api-client";
import { Banner } from "gql/graphql";

const query = `
  query CmsBannerById($id: String!) {
    cmsBannerById(id: $id) {
      id
      label
      title
      url
      action
      presetBackground
      placements
      ctaText
      logo {
        id
        url
        name
      }
      backgroundImage {
        id
        url
        name
      }
      showFrom
      showTo
      createdAt
    }
  }
`;

export const getBannerById = async (id: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsBannerById: Banner }>
  >("/", {
    query,
    variables: { id },
  });

  return response.data.data?.cmsBannerById;
};
