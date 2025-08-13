import {
  AbortPurchaseMutation,
  AbortPurchaseMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Display, Body } from "@components/typography/text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useEffect } from "react";
import { View } from "react-native";
import { Button } from "@components/buttons/button";

const ABORT_PURCHASE = gql`
  mutation AbortPurchase($input: AbortPurchaseInput!) {
    abortPurchase(input: $input) {
      id
      status
    }
  }
`;

type AbortPurchaseBottomSheetProps = {
  purchaseId: string;
  show: boolean;
  onDismiss: () => void;
  onAbortPurchaseCompleted: () => void;
};

export const AbortPurchaseBottomSheet = ({
  purchaseId,
  show,
  onDismiss,
  onAbortPurchaseCompleted,
}: AbortPurchaseBottomSheetProps) => {
  const ref = useRef<BottomSheetModal>(null);

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

  useEffect(() => {
    if (show) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [show]);

  return (
    <BottomSheet
      name="Abort purchase"
      title="Avbryt köp"
      ref={ref}
      onDismiss={onDismiss}
    >
      <View style={{ justifyContent: "space-between", flex: 1 }}>
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
      </View>
    </BottomSheet>
  );
};
