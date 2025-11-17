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
import { useState } from "react";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body } from "@components/typography/text";

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { stripeConnectInstance, createConnectInstance, fields } =
    useStripeConnect();

  const [checkSellerAccount] = useLazyQuery<
    PayoutCheckSellerAccountQuery,
    PayoutCheckSellerAccountQueryVariables
  >(PAYOUT_CHECK_SELLER_ACCOUNT);

  const onLoaderStart = () => {
    setLoading(false);
  };

  const onExitOnboarding = async () => {
    setSubmitting(true);

    //Check if sellerAccount is enabled. If not, there are probably some requirements left
    //show the onboarding again to display the necessary requirements.
    const { data } = await checkSellerAccount({
      fetchPolicy: "network-only",
    });
    if (data?.me.sellerAccountIsEnabled) {
      onExit();
      return;
    }

    setSubmitting(false);
    createConnectInstance();
  };

  if (submitting) {
    return (
      <View style={{ marginTop: 10, gap: 32 }}>
        <Body size="large">Granskar dina uppgifter...</Body>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={{ gap: 32 }}>
      {stripeConnectInstance && (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <View style={{ marginTop: 10 }}>
            {loading && <LoadingSpinner />}
            <ConnectAccountOnboarding
              collectionOptions={{
                fields: "eventually_due",
                requirements: fields?.length
                  ? {
                      only: fields,
                    }
                  : undefined,
                futureRequirements: "include",
              }}
              onLoaderStart={onLoaderStart}
              onExit={async () => {
                await onExitOnboarding();
              }}
            />
          </View>
        </ConnectComponentsProvider>
      )}
      <Divider />
      <Button label="Avbryt" onPress={onAbort} />
    </View>
  );
}
