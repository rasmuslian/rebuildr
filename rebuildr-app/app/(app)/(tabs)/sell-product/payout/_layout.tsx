import { RootPayoutMethodQueryQuery, UserType } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { ProgressHeader } from "@components/product/progress-header";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

const ROOT_PAYOUT_METHOD_QUERY = gql`
  query RootPayoutMethodQuery {
    me {
      id
      type
    }
  }
`;

export default function Layout() {
  const pathname = usePathname();
  const colors = useThemeColor();
  const { data } = useQuery<RootPayoutMethodQueryQuery>(
    ROOT_PAYOUT_METHOD_QUERY,
  );
  useEffect(() => {
    if (!data) {
      return;
    }

    //Make sure to skip route "index" in case user is Business
    if (
      data.me.type === UserType.Business &&
      pathname === "/sell-product/payout"
    ) {
      router.replace("/sell-product/payout/payout-method");
    }
  }, [pathname, data]);

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <Stack
      screenOptions={{
        header: () => (
          <View
            style={{
              paddingHorizontal: 16,
              backgroundColor: colors.background.neutral,
            }}
          >
            <ProgressHeader title="Ny annons" prog1={25} />
          </View>
        ),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="payout-method" />
      <Stack.Screen name="swish" />
      <Stack.Screen name="trustly" />
      <Stack.Screen name="rix" />
      <Stack.Screen name="bankgiro" />
      <Stack.Screen name="plusgiro" />
    </Stack>
  );
}
