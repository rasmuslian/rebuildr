import { SellProductBottomSheetQueryQuery } from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Display } from "@components/typography/text";
import { ProductFields } from "@components/upsert-product/types";
import { usePopupContext } from "@context/popup-context";
import { useScreenType } from "@hooks/useScreenType";
import { useEffect } from "react";
import { View } from "react-native";

const SELL_PRODUCT_BOTTOM_SHEET_DELETE = gql`
  mutation SellProductBottomSheetDelete($input: RemoveProductInput!) {
    deleteDraft(input: $input)
  }
`;

type Props = {
  show: boolean;
  onDismiss: () => void;
  dbDraft: SellProductBottomSheetQueryQuery["getOrCreateDraftProduct"];
  product: ProductFields;
  onSaveDraft: () => void;
  saveLoading: boolean;
  onProductDeleted: () => void;
};

export const HandleDraftBottomSheet = ({
  show,
  onDismiss,
  dbDraft,
  onSaveDraft,
  saveLoading,
  onProductDeleted,
}: Props) => {
  const { isDesktop } = useScreenType();
  const { setVisible, setContent } = usePopupContext();
  const [deleteDraft, { loading }] = useMutation(
    SELL_PRODUCT_BOTTOM_SHEET_DELETE,
  );

  const onDeleteDraft = () => {
    if (loading) {
      return;
    }

    deleteDraft({
      variables: {
        input: {
          id: dbDraft.id,
        },
      },
      onCompleted: () => {
        onProductDeleted();
      },
    });
  };

  const content = (
    <View
      style={[
        { justifyContent: "space-between", flex: 1, marginBottom: 16 },
        isDesktop && {
          paddingHorizontal: 40,
          paddingVertical: 24,
          alignItems: "center",
        },
      ]}
    >
      <View style={{ gap: 24, marginVertical: 24 }}>
        <Display size="small" style={{ textAlign: "center" }}>
          Vill du spara utkastet eller ta bort det?
        </Display>
      </View>

      <View style={[{ gap: 8, paddingTop: 24 }, isDesktop && { width: 400 }]}>
        <Button
          label="Ja, spara utkast"
          onPress={onSaveDraft}
          disabled={saveLoading}
          loading={saveLoading}
        />
        <Button
          label="Radera utkast"
          onPress={onDeleteDraft}
          disabled={saveLoading}
          loading={loading}
          type="outlined"
        />
      </View>
    </View>
  );

  useEffect(() => {
    if (isDesktop) {
      if (show) {
        setContent(content);
        setVisible("partial");
      } else {
        setVisible(false);
        setContent(null);
      }
    }
  }, [show]);

  if (isDesktop) {
    return null;
  }

  return (
    <BottomSheet
      open={show}
      name="handle draft"
      title="Hantera utkast"
      onDismiss={onDismiss}
    >
      {content}
    </BottomSheet>
  );
};
