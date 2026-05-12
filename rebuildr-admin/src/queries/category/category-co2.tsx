import { Category } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query CategoryCO2Factor {
    rootCategories {
      id
      name
      children {
        id
        name
        parentId
        co2Factor {
          id
          categoryName
          productName
          productionCoefficient
          disposalCoefficient
        }
      }
      co2Factor {
        id
        categoryName
        productName
        productionCoefficient
        disposalCoefficient
      }

    }
  }
`;

export const categoryCO2Factor = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ rootCategories: Category[] }>
  >("/", {
    query,
  });

  return response.data.data?.rootCategories;
};
