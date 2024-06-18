import { useReactiveVar } from "@apollo/client";
import React from "react";
import { isLoggedInVar } from "src/apollo/apollo";
import { LandingNavigation } from "./landingNavigation";
import { LoggedInNavigation } from "./loggedInNavigation";

export const RootNavigation = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  return isLoggedIn ? <LoggedInNavigation /> : <LandingNavigation />;
};
