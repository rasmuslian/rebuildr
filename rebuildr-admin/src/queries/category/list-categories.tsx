import { Category, OrderCategoriesEnum } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query RootCategories($input: RootCategoriesInput) {
    rootCategories(input: $input) {
      id
      name
      hasChildren
      orderIndex
      children {
        id
        name
        hasChildren
        orderIndex
      }
    }
  }
`;

export const listCategories = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ rootCategories: Category[] }>
  >("/", {
    query,
    variables: {
      input: {
        orderBy: OrderCategoriesEnum.OrderIndexAsc,
      },
    },
  });

  return response.data.data?.rootCategories;
};
