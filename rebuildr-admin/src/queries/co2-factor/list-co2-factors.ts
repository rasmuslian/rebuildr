import apiClient from "@/lib/api-client";
import { Co2Factor } from "gql/graphql";

const query = `
  query Co2Factors {
    co2Factors {
      id
      categoryName
      productName
      coefficient
    }
  }
`;

export const listCo2Factors = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ co2Factors: Co2Factor[] }>
  >("/", {
    query,
  });

  return response.data.data?.co2Factors ?? [];
};
