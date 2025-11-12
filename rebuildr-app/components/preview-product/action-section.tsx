import { ProductStatusEnum } from "@/gql/graphql";
import { Button } from "@components/buttons/button";
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
                router.navigate({
                  pathname: "/buy/[productId]",
                  params: { productId },
                });
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
