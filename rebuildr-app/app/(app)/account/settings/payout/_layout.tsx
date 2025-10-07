import { AccountSettingsLayoutPayoutQuery, UserType } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

const ACCOUNT_SETTINGS_LAYOUT_PAYOUT = gql`
  query AccountSettingsLayoutPayout {
    me {
      id
      type
    }
  }
`;

export default function Layout() {
  const colors = useThemeColor();
  const pathname = usePathname();
  const { data } = useQuery<AccountSettingsLayoutPayoutQuery>(
    ACCOUNT_SETTINGS_LAYOUT_PAYOUT,
  );
  useEffect(() => {
    if (!data) {
      return;
    }

    //Make sure to skip route bankId screens in case user is Business
    if (
      data.me.type === UserType.Business &&
      (pathname === "/account/settings/payout/change-method" ||
        pathname === "/account/settings/payout/verify")
    ) {
      router.replace("/account/settings/payout");
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
            <Header title="Utbetalningskonto" />
          </View>
        ),
        // headerShown: false,
        contentStyle: {
          backgroundColor: colors.background.neutral,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="change-method" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="payout-method" />
      <Stack.Screen name="swish" />
      <Stack.Screen name="trustly" />
      <Stack.Screen name="rix" />
      <Stack.Screen name="bankgiro" />
      <Stack.Screen name="plusgiro" />
    </Stack>
  );
}
