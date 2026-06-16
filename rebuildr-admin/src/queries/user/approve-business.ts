import { User } from "gql/graphql";
import apiClient from "@/lib/api-client";

const mutation = `
  mutation ApproveBusinessAccount($userId: String!) {
    approveBusinessAccount(userId: $userId) {
      id
      organizationApprovedAt
    }
  }
`;

export const approveBusiness = async (userId: string) => {
  const response = await apiClient.post<
    GraphQLResponse<{ approveBusinessAccount: User }>
  >("/", {
    query: mutation,
    variables: { userId },
  });

  return response.data.data?.approveBusinessAccount;
};
