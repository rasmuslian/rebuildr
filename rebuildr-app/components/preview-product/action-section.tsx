import { ProductStatusEnum } from "@/gql/graphql";
import { Button } from "@components/buttons/button";
import { useBuyModalContext } from "@context/buy-modal-context";
import { useEditProductContext } from "@context/edit-product-context";
import { LoginModalContext } from "@context/loginModalContext";
import { useScreenType } from "@hooks/useScreenType";
import { useUser } from "@hooks/useUser";
import { router } from "expo-router";
import { useContext } from "react";
import { View } from "react-native";

type Props = {
  productId: string;
  status: ProductStatusEnum;
  sellerId: string;
  isMyProduct: boolean;
  buyButtonDisabled: boolean;
  onRemovePress: () => void;
};

export const ActionSection = ({
  productId,
  status,
  sellerId,
  isMyProduct,
  buyButtonDisabled,
  onRemovePress,
}: Props) => {
  const { isLoggedIn } = useUser();
  const { setVisible } = useContext(LoginModalContext);
  const { editProduct } = useEditProductContext();
  const { isMobile } = useScreenType();
  const { setVisible: setBuyModalVisible, setContent: setBuyModalContent } =
    useBuyModalContext();
  return (
    <View style={{ gap: 8, paddingTop: isMobile ? 24 : 0 }}>
      {isMyProduct ? (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Button
            label="Ta bort"
            type="tonal"
            onPress={onRemovePress}
            style={{ flex: 1 }}
          />
          <Button
            label="Redigera"
            onPress={() => {
              editProduct(productId);
            }}
            style={{ flex: 1 }}
          />
        </View>
      ) : (
        <>
          {status === ProductStatusEnum.Published && (
            <Button
              label="Köp nu"
              onPress={() => {
                if (!isLoggedIn) {
                  setVisible(true);
                  return;
                }
                if (isMobile) {
                  router.navigate({
                    pathname: "/buy/[productId]",
                    params: { productId },
                  });
                } else {
                  setBuyModalContent({ buyState: "summary", productId });
                  setBuyModalVisible(true);
                }
              }}
              disabled={buyButtonDisabled}
            />
          )}
          <Button
            label="Kontakta säljaren"
            type="tonal"
            onPress={() => {
              if (!isLoggedIn) {
                setVisible(true);
              } else {
                router.navigate({
                  pathname: "/conversations/[productId]/[userId]",
                  params: { productId, userId: sellerId },
                });
              }
            }}
          />
        </>
      )}
    </View>
  );
};
