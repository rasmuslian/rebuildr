"use client";

import apiClient from "@/lib/api-client";
import { User } from "gql/graphql";

const GET_PROFILE = `
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
    query: GET_PROFILE,
  });

  return response.data.data?.me;
};
