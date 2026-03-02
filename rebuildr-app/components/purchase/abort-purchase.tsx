import {
  AbortPurchaseMutation,
  AbortPurchaseMutationVariables,
  PurchaseStatusEnum,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Display, Body } from "@components/typography/text";
import { View } from "react-native";
import { Button } from "@components/buttons/button";
import { useScreenType } from "@hooks/useScreenType";
import { Popup } from "@components/popup/popup";
import { Header } from "@components/navigation/headers/header";

const ABORT_PURCHASE = gql`
  mutation AbortPurchase($input: AbortPurchaseInput!) {
    abortPurchase(input: $input) {
      id
      status
      abortedById
      isRefunded
    }
  }
`;

type Props = {
  purchaseId: string;
  purchaseStatus: PurchaseStatusEnum;
  show: boolean;
  onDismiss: () => void;
  onAbortPurchaseCompleted: () => void;
};

export const AbortPurchase = ({
  purchaseId,
  purchaseStatus,
  show,
  onDismiss,
  onAbortPurchaseCompleted,
}: Props) => {
  const { isDesktop } = useScreenType();
  const [abortPurchase, { error, loading }] = useMutation<
    AbortPurchaseMutation,
    AbortPurchaseMutationVariables
  >(ABORT_PURCHASE);

  const onAbortPurchase = () => {
    if (loading) {
      return;
    }
    abortPurchase({
      variables: { input: { purchaseId } },
      onCompleted: onAbortPurchaseCompleted,
    });
  };

  const canAbortPurchase = () => {
    switch (purchaseStatus) {
      case PurchaseStatusEnum.PaymentAccepted:
      case PurchaseStatusEnum.ShipmentBooked:
        return true;

      default:
        return false;
    }
  };

  const content = (
    <View style={[{ justifyContent: "space-between", flex: 1, gap: 24 }]}>
      {canAbortPurchase() ? (
        <>
          <View style={{ gap: 24 }}>
            <Display size="small" style={{ textAlign: "center" }}>
              Är du säker på att du vill avbryta köpet?
            </Display>

            {error && <Body color="error">Något gick fel</Body>}
          </View>

          <View style={{ gap: 8, paddingTop: 24 }}>
            <Button
              label="Ja, avbryt köp"
              onPress={onAbortPurchase}
              loading={loading}
              type="danger"
            />
            <Button
              label="Nej"
              onPress={onDismiss}
              disabled={loading}
              type="outlined"
            />
          </View>
        </>
      ) : (
        <>
          <Display size="small" style={{ textAlign: "center" }}>
            Köpet kan inte avbrytas
          </Display>

          <Body>
            Säljaren har redan skickat varan. När leveransen är påbörjad går det
            inte att avbryta köpet.{" "}
          </Body>
          <Button label="Ok" onPress={onDismiss} type="filled" />
        </>
      )}
    </View>
  );

  if (isDesktop) {
    return (
      <Popup open={show} onClose={onDismiss}>
        <View
          style={{
            padding: 24,
            justifyContent: "center",
          }}
        >
          <Header
            title="Avbryt köp"
            showBackButton={false}
            showDivider
            ctas={[
              {
                icon: "X",
                onPress: onDismiss,
              },
            ]}
          />
          <View style={{ padding: 48 }}>{content}</View>
        </View>
      </Popup>
    );
  }

  return (
    <BottomSheet
      name="Abort purchase"
      title="Avbryt köp"
      open={show}
      onDismiss={onDismiss}
    >
      {content}
    </BottomSheet>
  );
};
