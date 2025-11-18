import { AccountSettingsLayoutPayoutQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Slot } from "expo-router";

const ACCOUNT_SETTINGS_LAYOUT_PAYOUT = gql`
  query AccountSettingsLayoutPayout {
    me {
      id
      type
    }
  }
`;

export default function Layout() {
  const { data } = useQuery<AccountSettingsLayoutPayoutQuery>(
    ACCOUNT_SETTINGS_LAYOUT_PAYOUT,
  );
  const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PK!);

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <Elements stripe={stripePromise}>
      <Slot />
    </Elements>
  );
}
