import { CategoryInput, Category } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query Category($input: CategoryInput!) {
    category(input: $input) {
      id
      name
      description
      hasChildren
      inSeason
      inSelection
      measurements
      image {
        id
        name
        url
      }
    }
  }
`;

export const getCategory = async (input: CategoryInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ category: Category }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.category;
};
