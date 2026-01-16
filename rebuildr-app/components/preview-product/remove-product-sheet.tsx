import { PRODUCT_LIST } from "@/app/(app)/product-list/[userId]";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Display } from "@components/typography/text";
import { useRemoveProduct } from "@hooks/product/use-remove-product";
import { router } from "expo-router";
import { View } from "react-native";

type Props = {
  open: boolean;
  onClose: () => void;
  canDelete: boolean;
  productId: string;
};

export const RemoveProductSheet = ({
  open,
  onClose,
  canDelete,
  productId,
}: Props) => {
  const { removeProduct, loading: loadingRemoveProduct } = useRemoveProduct();

  return (
    <BottomSheet
      open={open}
      onDismiss={onClose}
      name="removeProduct"
      title="Ta bort annons"
    >
      <View style={{ gap: 24, marginBottom: 16 }}>
        {canDelete ? (
          <>
            <Display
              size="small"
              style={{ marginVertical: 24, textAlign: "center" }}
            >
              Är du säker på att du vill ta bort annonsen?
            </Display>
            <View style={{ gap: 8 }}>
              <Button
                label="Ja, ta bort"
                type="danger"
                loading={loadingRemoveProduct}
                onPress={() => {
                  if (loadingRemoveProduct) return;
                  removeProduct({
                    variables: { input: { id: productId } },
                    refetchQueries: [PRODUCT_LIST],
                    onCompleted: () => {
                      onClose();
                      if (router.canGoBack()) {
                        router.back();
                      } else {
                        router.replace("/");
                      }
                    },
                  });
                }}
              />
              <Button label="Nej" type="outlined" onPress={onClose} />
            </View>
          </>
        ) : (
          <>
            <Display
              size="small"
              style={{ marginVertical: 24, textAlign: "center" }}
            >
              Du kan inte ta bort en annons under ett pågående köp
            </Display>
            <Button label="Ok" onPress={onClose} />
          </>
        )}
      </View>
    </BottomSheet>
  );
};
