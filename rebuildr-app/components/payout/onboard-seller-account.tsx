import { View } from "react-native";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { StripeConnectInstance } from "@stripe/connect-js";
import { gql, useLazyQuery } from "@apollo/client";
import { OnboardSellerGetAccountQuery } from "@/gql/graphql";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { useState } from "react";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body } from "@components/typography/text";
import * as Sentry from "@sentry/react-native";

const ONBOARD_SELLER_GET_ACCOUNT = gql`
  query OnboardSellerGetAccount {
    me {
      id
      sellerAccount {
        canReceivePayment
      }
    }
  }
`;

type Props = {
  onExit: () => void;
  onAbort: () => void;
  stripeConnectInstance: StripeConnectInstance | null;
  createConnectInstance: () => Promise<void>;
  fields: string[] | undefined;
};

export default function OnboardSellerAccount({
  onExit,
  onAbort,
  stripeConnectInstance,
  createConnectInstance,
  fields,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [checkSellerAccount] = useLazyQuery<OnboardSellerGetAccountQuery>(
    ONBOARD_SELLER_GET_ACCOUNT,
  );

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
    if (data?.me.sellerAccount?.canReceivePayment) {
      onExit();
      return;
    }
    Sentry.captureMessage(
      "onExitOnboarding completed without the user being able to recieve payment",
      {
        level: "info",
        contexts: {
          problem: {
            data,
            fields,
          },
        },
      },
    );

    createConnectInstance().then(() => {
      setSubmitting(false);
    });
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
                requirements: {
                  ...(fields?.length ? { only: fields } : {}),
                  exclude: ["summary"],
                },
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
