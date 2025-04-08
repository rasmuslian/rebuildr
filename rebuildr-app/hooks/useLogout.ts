import { isLoggedInVar } from "@/apollo/config";
import { useApolloClient } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const useLogout = () => {
  const client = useApolloClient();

  const logout = async () => {
    await client.clearStore();
    await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    isLoggedInVar(false);
    router.replace("/");
  };

  return {
    logout,
  };
};
