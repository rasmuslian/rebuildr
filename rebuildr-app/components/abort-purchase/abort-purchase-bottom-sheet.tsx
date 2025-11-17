import {
  AbortPurchaseMutation,
  AbortPurchaseMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Display, Body } from "@components/typography/text";
import { View } from "react-native";
import { Button } from "@components/buttons/button";
import { useScreenType } from "@hooks/useScreenType";
import { Popup } from "@components/popup/popup";

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

  const content = (
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
  );

  if (isDesktop) {
    return (
      <Popup open={show} onClose={onDismiss}>
        <View
          style={{
            padding: 24,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {content}
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
    />
  );
};
