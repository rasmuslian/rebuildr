import { isLoggedInVar } from "@/apollo/config";
import { useApolloClient, gql } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const LOGOUT = gql(`
  mutation Logout($input: LogoutInput!) {
    logout(input: $input)
  }
`);

export const useLogout = () => {
  const client = useApolloClient();

  const logout = async () => {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    const accessToken = await AsyncStorage.getItem("access_token");

    if (!refreshToken || !accessToken) {
      throw new Error("Missing tokens");
    }

    await client.mutate({
      mutation: LOGOUT,
      variables: { input: { refreshToken, accessToken } },
    });

    await client.clearStore();
    await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    isLoggedInVar(false);
    router.replace("/");
  };

  return {
    logout,
  };
};
