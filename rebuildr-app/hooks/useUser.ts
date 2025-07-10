import { useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "@/apollo/config";

export const useUser = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  return {
    isLoggedIn,
  };
};
