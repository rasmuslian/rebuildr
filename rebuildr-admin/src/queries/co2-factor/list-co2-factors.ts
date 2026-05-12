import apiClient from "@/lib/api-client";
import { Co2FactorWithDisposal } from "@/queries/co2-factor/update-co2-factor";

const query = `
  query Co2Factors {
    co2Factors {
      id
      categoryName
      productName
      productionCoefficient
      disposalCoefficient
    }
  }
`;

export const listCo2Factors = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ co2Factors: Co2FactorWithDisposal[] }>
  >("/", {
    query,
  });

  return response.data.data?.co2Factors ?? [];
};
