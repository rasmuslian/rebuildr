import { View } from "react-native";
import { useStripeConnect } from "@hooks/stripe/use-stripe-connect";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { gql, useLazyQuery } from "@apollo/client";
import {
  PayoutCheckSellerAccountQuery,
  PayoutCheckSellerAccountQueryVariables,
} from "@/gql/graphql";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";

const PAYOUT_CHECK_SELLER_ACCOUNT = gql`
  query PayoutCheckSellerAccount {
    me {
      id
      sellerAccountIsEnabled
    }
  }
`;

type Props = {
  onExit: () => void;
  onAbort: () => void;
};

export default function PayoutStripe({ onExit, onAbort }: Props) {
  const { stripeConnectInstance, createConnectInstance } = useStripeConnect();

  const [checkSellerAccount] = useLazyQuery<
    PayoutCheckSellerAccountQuery,
    PayoutCheckSellerAccountQueryVariables
  >(PAYOUT_CHECK_SELLER_ACCOUNT);

  const onExitOnboarding = async () => {
    //Check if sellerAccount is enabled. If not, there are probably some requirements left
    //show the onboarding again to display the necessary requirements.
    const { data } = await checkSellerAccount({ fetchPolicy: "network-only" });
    if (data?.me.sellerAccountIsEnabled) {
      onExit();
      return;
    }

    createConnectInstance();
  };

  return (
    <View style={{ gap: 32 }}>
      {stripeConnectInstance && (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <ConnectAccountOnboarding
            collectionOptions={{
              fields: "eventually_due",
              futureRequirements: "include",
            }}
            onExit={() => {
              onExitOnboarding();
            }}
          />
        </ConnectComponentsProvider>
      )}
      <Divider />
      <Button label="Avbryt" onPress={onAbort} />
    </View>
  );
}
