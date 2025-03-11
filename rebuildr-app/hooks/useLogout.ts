import { isLoggedInVar } from "@/apollo/config";
import { useApolloClient } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useLogout = () => {
  const client = useApolloClient();

  const logout = async () => {
    await client.clearStore();
    await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    isLoggedInVar(false);
  };

  return {
    logout,
  };
};
