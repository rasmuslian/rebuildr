import apiClient from "@/lib/api-client";
import { Partner } from "gql/graphql";

const query = `
  query PartnerById {
    partners {
      id
      name
      description
      websiteUrl
      logo {
        id
        url
        name
      }
    }
  }
`;

export const getPartnerById = async ({ id }: { id: string }) => {
  const response = await apiClient.post<
    GraphQLResponse<{ partners: Partner[] }>
  >("/", {
    query,
  });

  return response.data.data?.partners.find((partner) => partner.id === id);
};
