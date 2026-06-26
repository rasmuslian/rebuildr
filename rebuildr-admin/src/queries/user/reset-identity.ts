import apiClient from "@/lib/api-client";

const mutation = `
  mutation ResetUserIdentity($userId: String!) {
    resetUserIdentity(userId: $userId)
  }
`;

export const resetIdentity = async (userId: string): Promise<boolean> => {
  const response = await apiClient.post<
    GraphQLResponse<{ resetUserIdentity: boolean }>
  >("/", {
    query: mutation,
    variables: { userId },
  });

  if (response.data.errors?.length) {
    throw new Error(response.data.errors[0].message);
  }

  return response.data.data?.resetUserIdentity ?? false;
};
