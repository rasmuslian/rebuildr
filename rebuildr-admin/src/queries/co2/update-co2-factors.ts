import apiClient from "@/lib/api-client";

const query = `
  mutation UpdateCO2Factors {
    updateCO2Factors
  }
`;

export const updateCO2Factors = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ updateCO2Factors: boolean }>
  >("/", {
    query,
  });

  return response.data.data?.updateCO2Factors;
};
