import { User, CmsUpdateUsersInput } from "gql/graphql";
import apiClient from "@/lib/api-client";

const query = `
  mutation Mutation($input: CmsUpdateUsersInput!) {
    cmsUpdateUser(input: $input) {
      id
      username
      internalAdsAccess
    }
  }
`;

export const updateUser = async (input: CmsUpdateUsersInput) => {
  const response = await apiClient.post<
    GraphQLResponse<{ cmsUpdateUser: User }>
  >("/", {
    query,
    variables: { input },
  });

  return response.data.data?.cmsUpdateUser;
};
