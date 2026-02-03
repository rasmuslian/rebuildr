import { Brand } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query Brands {
    brands {
      id
      name
      type
    }
  }
`;

export const getBrands = async () => {
  const response = await apiClient.post<GraphQLResponse<{ brands: Brand[] }>>(
    "/",
    {
      query,
    },
  );

  return response.data.data?.brands;
};
