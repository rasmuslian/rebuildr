import { RootCategoriesInput, Category } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query Category($input: RootCategoriesInput) {
    rootCategories(input: $input) {
      id
      name
    }
  }
`;

export const getRootCategories = async (input: RootCategoriesInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ rootCategories: [Category] }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.rootCategories;
};
