import { CmsListUsersResponse } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  query CmsListUsers($input: CmsListUsersInput!) {
    cmsListUsers(input: $input) {
      users {
        id
        email
        username
        organizationNumber
        organizationApprovedAt
        createdAt
        creditsafeCheckStatus
        creditsafeData
      }
      total
    }
  }
`;

export const listPendingBusinesses = async (input: {
  page: number;
  pageSize: number;
  searchString: string;
}) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsListUsers: CmsListUsersResponse }>
  >("/", {
    query,
    variables: { input: { ...input, pendingApproval: true } },
  });

  return {
    users: response.data.data?.cmsListUsers.users,
    total: response.data.data?.cmsListUsers.total,
  };
};
