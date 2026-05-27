import { isLoggedInVar } from "@/apollo/config";
import { AppQueryQuery, RegisterStatusEnum } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Stack } from "expo-router";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { LoginModalContext } from "@context/loginModalContext";
import { use } from "react";

const APP_QUERY = gql`
  query AppQuery($isLoggedIn: Boolean!) {
    me @include(if: $isLoggedIn) {
      id
      registrationStatus
    }
  }
`;

export default function AppLayout() {
  const { setVisible } = use(LoginModalContext);
  const { data } = useQuery<AppQueryQuery>(APP_QUERY, {
    fetchPolicy: "network-only",
    variables: {
      isLoggedIn: isLoggedInVar(),
    },
  });

  if (data?.me?.registrationStatus === RegisterStatusEnum.Details) {
    setVisible(true);
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="product" />
      <Stack.Screen name="conversations" />
      <Stack.Screen name="account" />
      <Stack.Screen name="search" />
      <Stack.Screen name="buy" />
      <Stack.Screen name="project-list" />
      <Stack.Screen name="product-list" />
      <Stack.Screen name="project" />
      <Stack.Screen name="article" />
    </Stack>
  );
}
