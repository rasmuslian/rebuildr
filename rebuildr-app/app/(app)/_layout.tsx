import { isLoggedInVar } from "@/apollo/config";
import { AppQueryQuery, RegisterStatusEnum } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Redirect, Stack } from "expo-router";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

const APP_QUERY = gql`
  query AppQuery($isLoggedIn: Boolean!) {
    me @include(if: $isLoggedIn) {
      id
      registrationStatus
    }
  }
`;

export default function AppLayout() {
  const { data } = useQuery<AppQueryQuery>(APP_QUERY, {
    fetchPolicy: "network-only",
    variables: {
      isLoggedIn: isLoggedInVar(),
    },
  });

  if (data?.me?.registrationStatus === RegisterStatusEnum.Details) {
    return <Redirect href="/sign-up/details" />;
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product" options={{ headerShown: false }} />
      <Stack.Screen name="conversations" options={{ headerShown: false }} />
      <Stack.Screen name="account" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="buy" options={{ headerShown: false }} />
      <Stack.Screen name="project-list" options={{ headerShown: false }} />
      <Stack.Screen name="project" options={{ headerShown: false }} />
    </Stack>
  );
}
