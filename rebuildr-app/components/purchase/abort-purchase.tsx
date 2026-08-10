import {
  AbortPurchaseMutation,
  AbortPurchaseMutationVariables,
  CanAbortDeniedReasonEnum,
  Purchase,
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
  canAbort?: Purchase["canAbort"];
  show: boolean;
  onDismiss: () => void;
  onAbortPurchaseCompleted: () => void;
};

export const AbortPurchase = ({
  purchaseId,
  canAbort,
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

  const deniedReasonToText = (reason: CanAbortDeniedReasonEnum) => {
    switch (reason) {
      case CanAbortDeniedReasonEnum.Handoff:
        return "Du kan inte längre avbryta köpet då det har passerat för långt.";
      case CanAbortDeniedReasonEnum.Shipping:
        return "Säljaren har redan skickat varan. När leveransen är påbörjad går det inte att avbryta köpet.";
    }
  };

  const content = (
    <View
      style={[
        { gap: 24 },
        //space-between + flex only fill the fixed-height desktop popup. On
        //mobile the sheet is dynamically sized, so flex: 1 would stretch this
        //to the full window and space-between would push the buttons far down.
        isDesktop && { justifyContent: "space-between", flex: 1 },
      ]}
    >
      {!canAbort ? (
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

          <Body>{deniedReasonToText(canAbort.deniedReason)}</Body>
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
