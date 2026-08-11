import { isLoggedInVar } from "@/apollo/config";
import { AppQueryQuery, RegisterStatusEnum } from "@/gql/graphql";
import { gql, useQuery, useReactiveVar } from "@apollo/client";
import { Slot, Stack } from "expo-router";
import { LoginModalContext } from "@context/loginModalContext";
import { use, useEffect } from "react";
import { isWeb } from "@constants/layout";

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
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { data } = useQuery<AppQueryQuery>(APP_QUERY, {
    fetchPolicy: "network-only",
    variables: {
      isLoggedIn,
    },
  });

  useEffect(() => {
    if (data?.me?.registrationStatus === RegisterStatusEnum.Details) {
      setVisible(true);
    }
  }, [data?.me?.registrationStatus, setVisible]);

  // Web scrolls the document — render a plain Slot (native-stack pins screens).
  if (isWeb) return <Slot />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="product/[productId]" />
      <Stack.Screen name="conversations" />
      <Stack.Screen name="account" />
      <Stack.Screen name="search" />
      <Stack.Screen name="buy" />
      <Stack.Screen name="project-list" />
      <Stack.Screen name="product-list" />
      <Stack.Screen name="project" />
      <Stack.Screen name="article" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="aterbyggaren" />
      <Stack.Screen name="internal" />
    </Stack>
  );
}
