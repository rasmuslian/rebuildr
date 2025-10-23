import { AccountSettingsLayoutPayoutQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { useThemeColor } from "@hooks/useThemeColor";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Stack } from "expo-router";
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
  const { data } = useQuery<AccountSettingsLayoutPayoutQuery>(
    ACCOUNT_SETTINGS_LAYOUT_PAYOUT,
  );
  const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PK!);

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <Elements stripe={stripePromise}>
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
          contentStyle: {
            backgroundColor: colors.background.neutral,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="add" />
      </Stack>
    </Elements>
  );
}
