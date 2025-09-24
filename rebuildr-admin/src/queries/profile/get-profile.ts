"use client";

import apiClient from "@/lib/api-client";
import { User } from "gql/graphql";

const query = `
  query Me {
    me {
      id
      username
      email
      profilePicture {
        id
        name
        url
      }
    }
  }
`;

export const getProfile = async () => {
  const response = await apiClient.post<GraphQLResponse<{ me: User }>>("/", {
    query,
  });

  return response.data.data?.me;
};
