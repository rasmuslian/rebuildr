import { Category } from "gql/graphql";

import apiClient from "@/lib/api-client";

export const regenerateCategoryImage = async (id: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsRegenerateCategoryImage: Category }>
  >("/", {
    query: `mutation CmsRegenerateCategoryImage($id: String!) {
      cmsRegenerateCategoryImage(id: $id) {
        id imageGenerationStatus imageGenerationError image { id name url }
      }
    }`,
    variables: { id },
  });
  return response.data.data?.cmsRegenerateCategoryImage;
};
