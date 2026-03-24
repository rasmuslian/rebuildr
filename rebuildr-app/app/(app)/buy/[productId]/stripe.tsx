import {
  PollStripeQuery,
  PollStripeQueryVariables,
  PurchaseStatusEnum,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Title } from "@components/typography/text";
import { useBuyModalContext } from "@context/buy-modal-context";
import { useScreenType } from "@hooks/useScreenType";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { trackEvent } from "@/utils/analytics";

const POLL_STRIPE = gql`
  query PollStripe($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      status
    }
  }
`;

export default function Stripe() {
  const { purchaseId, productId } = useLocalSearchParams<{
    purchaseId: string;
    productId: string;
  }>();
  return <StripeContent purchaseId={purchaseId} productId={productId} />;
}

export const StripeContent = ({
  purchaseId,
  productId,
}: {
  purchaseId: string;
  productId: string;
}) => {
  const [pollStripeResolution, setPollStripeResolution] = useState<
    "failed" | "none"
  >("none");
  const { isDesktop } = useScreenType();
  const { setVisible, setContent } = useBuyModalContext();
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setContent(null);
    }, 500);
  };

  const { data, error } = useQuery<PollStripeQuery, PollStripeQueryVariables>(
    POLL_STRIPE,
    {
      variables: { input: { id: purchaseId } },
      pollInterval: 1000,
      notifyOnNetworkStatusChange: true,
      skip: pollStripeResolution !== "none",
      onCompleted: (data) => {
        if (
          data.purchase.status === PurchaseStatusEnum.PaymentAccepted ||
          data.purchase.status === PurchaseStatusEnum.ShipmentBooked
        ) {
          trackEvent("purchase", {
            transaction_id: purchaseId,
            item_id: productId,
          });
          if (isDesktop) {
            setContent({
              buyState: "success",
              productId,
              purchaseId,
            });
            setVisible(true);
          } else {
            router.replace({
              pathname: "/buy/[productId]/success",
              params: { productId, purchaseId },
            });
          }
        }
      },
    },
  );

  useEffect(() => {
    if (!data) return;

    if (data.purchase.status === PurchaseStatusEnum.FinishedFailed) {
      setPollStripeResolution("failed");
    }
  }, [data]);
  useEffect(() => {
    if (!error) return;

    setPollStripeResolution("failed");
  }, [error]);

  return (
    <ScreenLayout
      contentHorizontalPadding={isDesktop ? 0 : undefined}
      headerComponent={
        <Header
          title="Bekräfta köp"
          onBack={isDesktop ? handleClose : undefined}
        />
      }
    >
      {pollStripeResolution === "failed" ? (
        <View style={{ gap: 12 }}>
          <Title>Betalningen misslyckades, vänligen försök igen.</Title>
          <Button
            label="Tillbaka"
            icon="arrowLeft"
            onPress={() => {
              setVisible(false);
              setContent(null);
              router.navigate({
                pathname: "/product/[productId]",
                params: { productId },
              });
            }}
          />
        </View>
      ) : (
        <Title>Bearbetar betalning...</Title>
      )}
    </ScreenLayout>
  );
};
