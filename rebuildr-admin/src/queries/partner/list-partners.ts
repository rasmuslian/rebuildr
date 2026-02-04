import apiClient from "@/lib/api-client";
import { Partner } from "gql/graphql";

const query = `
  query Partners {
    partners {
      id
      name
      description
      websiteUrl
      createdAt
      logo {
        id
        url
      }
    }
  }
`;

export const listPartners = async () => {
  const response = await apiClient.post<
    GraphQLResponse<{ partners: Partner[] }>
  >("/", {
    query,
  });

  return response.data.data?.partners ?? [];
};
