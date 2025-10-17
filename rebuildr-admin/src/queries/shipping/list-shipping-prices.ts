import apiClient from "@/lib/api-client";
import { ShippingPrice } from "gql/graphql";

const query = `
  query GetAllShippingPrices {
    getAllShippingPrices {
      id
      maxWeight
      provider
      price
    }
  }
`;

export const listShippingPrices = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ getAllShippingPrices: ShippingPrice[] }>
  >("/", {
    query,
  });

  return response.data.data?.getAllShippingPrices;
};
