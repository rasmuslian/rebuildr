import { ProductStatusEnum } from "@/gql/graphql";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { useBuyModalContext } from "@context/buy-modal-context";
import { useEditProductContext } from "@context/edit-product-context";
import { LoginModalContext } from "@context/loginModalContext";
import { useScreenType } from "@hooks/useScreenType";
import { useUser } from "@hooks/useUser";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect } from "react";
import { View } from "react-native";
import { trackEvent } from "@/utils/analytics";
import { GTMTagEnum } from "@constants/google-tag-manager";

const ACTION_SECTION_REDIRECT = gql`
  query ActionSectionRedirect($input: MyPurchaseInput!) {
    myPurchase(input: $input) {
      id
      status
    }
  }
`;

type Props = {
  productId: string;
  quantity?: number;
  status: ProductStatusEnum;
  isMyProduct: boolean;
  buyButtonDisabled: boolean;
  isUpcoming?: boolean;
  onRemovePress: () => void;
};

export const ActionSection = ({
  productId,
  quantity,
  status,
  isMyProduct,
  buyButtonDisabled,
  isUpcoming,
  onRemovePress,
}: Props) => {
  const { me, isLoggedIn, loading: loadingMe } = useUser();
  const { setVisible } = useContext(LoginModalContext);
  const { editProduct } = useEditProductContext();
  const { isMobile } = useScreenType();
  const {
    setVisible: setBuyModalVisible,
    setContent: setBuyModalContent,
    content,
  } = useBuyModalContext();
  const params = useLocalSearchParams();
  const [getMyLatestPurchase, { data: redirectData }] = useLazyQuery(
    ACTION_SECTION_REDIRECT,
  );

  /**
   * The following two useffects will handle redirects back to the productscreen.
   * In the case of redirect the buyContent state might be null but we have to populate it again.
   * To determine if we come from a redirect we first check the redirect is in params.
   * Then we find the latest purchase on this product and set the correct buyContent state
   */
  useEffect(() => {
    if (params.redirect_status?.length && !redirectData) {
      getMyLatestPurchase({
        variables: { input: { productId: params.productId } },
      });
    }
  }, [params.redirect_status]);
  useEffect(() => {
    if (!redirectData || !!content) return;
    setBuyModalContent({
      buyState: "stripe",
      productId,
      purchaseId: redirectData.myPurchase.id,
    });
    setBuyModalVisible(true);
  }, [redirectData]);

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
              editProduct(
                productId,
                isMobile
                  ? () =>
                      router.canGoBack() ? router.back() : router.navigate("/")
                  : undefined,
              );
            }}
            style={{ flex: 1 }}
          />
        </View>
      ) : (
        <>
          {status === ProductStatusEnum.Published && isUpcoming && (
            // "Snart till salu" isn't available for purchase yet — the buy
            // action unlocks when it flips to available (auto on its start
            // date, or when the seller marks it available).
            <Button label="Snart till salu" disabled />
          )}
          {status === ProductStatusEnum.Published && !isUpcoming && (
            <Button
              label="Köp nu"
              loading={loadingMe}
              onPress={() => {
                trackEvent(GTMTagEnum.BEGIN_CHECKOUT, { item_id: productId });
                if (!isLoggedIn) {
                  setVisible(true);
                  return;
                }
                if (!me) return;
                if (isMobile) {
                  router.navigate({
                    pathname: "/buy/[productId]",
                    params: { productId, quantity },
                  });
                } else {
                  setBuyModalContent({
                    buyState: "summary",
                    productId,
                    quantity,
                  });
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
              trackEvent(GTMTagEnum.CONTACT_SELLER, { item_id: productId });
              if (!isLoggedIn) {
                setVisible(true);
              } else {
                router.navigate({
                  pathname: "/conversations/[productId]",
                  params: { productId },
                });
              }
            }}
          />
        </>
      )}
    </View>
  );
};
