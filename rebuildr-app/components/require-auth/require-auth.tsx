import { isLoggedInVar } from "@/apollo/config";
import { useReactiveVar } from "@apollo/client";
import { Redirect } from "expo-router";
import { ReactElement, ReactNode } from "react";

export function useRequireAuth(): {
  isLoggedIn: boolean;
  redirect: ReactElement | null;
} {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  return {
    isLoggedIn,
    redirect: isLoggedIn ? null : <Redirect href="/" />,
  };
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { redirect } = useRequireAuth();
  if (redirect) return redirect;
  return <>{children}</>;
}
