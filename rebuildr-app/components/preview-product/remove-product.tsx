import { PRODUCT_LIST } from "@/app/(app)/product-list/[userId]";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Display } from "@components/typography/text";
import { useRemoveProduct } from "@hooks/product/use-remove-product";
import { router } from "expo-router";
import { View } from "react-native";
import { useScreenType } from "@hooks/useScreenType";
import { Popup } from "@components/popup/popup";
import { Header } from "@components/navigation/headers/header";

type Props = {
  productId: string;
  show: boolean;
  canDelete: boolean;
  onDismiss: () => void;
};

export default function RemoveProduct({
  productId,
  show,
  canDelete,
  onDismiss,
}: Props) {
  const { isDesktop } = useScreenType();
  const { removeProduct, loading: loadingRemoveProduct } = useRemoveProduct();

  const content = (
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
                    onDismiss();
                    if (router.canGoBack()) {
                      router.back();
                    } else {
                      router.replace("/");
                    }
                  },
                });
              }}
            />
            <Button label="Nej" type="outlined" onPress={onDismiss} />
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
          <Button label="Ok" onPress={onDismiss} />
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
            title="Ta bort annons"
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
      name="removeProduct"
      title="Ta bort annons"
      open={show}
      onDismiss={onDismiss}
    >
      {content}
    </BottomSheet>
  );
}
