import { View } from "react-native";
import { Button } from "@components/buttons/button";
import { ReactNode } from "react";
import { router } from "expo-router";
import { gql, useMutation } from "@apollo/client";
import {
  ConversationAcceptPurchaseMutation,
  ConversationAcceptPurchaseMutationVariables,
  ConversationMarkAsDeliveredMutation,
  ConversationMarkAsDeliveredMutationVariables,
  ConversationProductQuery,
  ProductStatusEnum,
} from "@/gql/graphql";
import { CONVERSATION_PRODUCT } from "@/app/(app)/conversations/[productId]/[userId]";
import { useScreenType } from "@hooks/useScreenType";
import { useBuyModalContext } from "@context/buy-modal-context";

const CONVERSATION_ACCEPT_PURCHASE = gql`
  mutation ConversationAcceptPurchase($input: AcceptPurchaseInput!) {
    acceptPurchase(input: $input) {
      id
      status
      approvedAt
    }
  }
`;

const CONVERSATION_MARK_AS_DELIVERED = gql`
  mutation ConversationMarkAsDelivered($input: MarkPurchaseAsDeliveredInput!) {
    markPurchaseAsDelivered(input: $input) {
      id
      status
      deliveredAt
    }
  }
`;

type Props = {
  data: ConversationProductQuery;
  onShowReview: () => void;
};
export const ChatActionButtons = ({ data, onShowReview }: Props) => {
  const purchase = data.latestPurchase;
  const sellerIsMe = data.me.id === data.product.seller.id;
  const { isDesktop } = useScreenType();
  const { setVisible: setBuyModalVisible, setContent: setBuyModalContent } =
    useBuyModalContext();

  const [acceptPurchase, { loading: acceptPurchaseLoading }] = useMutation<
    ConversationAcceptPurchaseMutation,
    ConversationAcceptPurchaseMutationVariables
  >(CONVERSATION_ACCEPT_PURCHASE, { refetchQueries: [CONVERSATION_PRODUCT] });
  const [markAsDelivered, { loading: markAsDeliveredLoading }] = useMutation<
    ConversationMarkAsDeliveredMutation,
    ConversationMarkAsDeliveredMutationVariables
  >(CONVERSATION_MARK_AS_DELIVERED, { refetchQueries: [CONVERSATION_PRODUCT] });

  let firstButton: ReactNode = null;
  if (!purchase && data.product.status === ProductStatusEnum.Published) {
    firstButton = !sellerIsMe ? (
      <Button
        label="Köp"
        onPress={() => {
          if (isDesktop) {
            setBuyModalContent({
              buyState: "summary",
              productId: data.product.id,
            });
            setBuyModalVisible(true);
          } else {
            router.navigate({
              pathname: "/buy/[productId]",
              params: { productId: data.product.id },
            });
          }
        }}
      />
    ) : null;
  }
  if (purchase) {
    firstButton = (
      <Button
        label="Visa kvitto"
        type="tonal"
        onPress={() => {
          router.navigate({
            pathname: "/account/purchases/[purchaseId]",
            params: { purchaseId: purchase.id },
          });
        }}
      />
    );
  }

  const renderSecondButton = () => {
    //No second button if there is no purchase
    if (!purchase) {
      return null;
    }
    const hasReviewed = purchase.reviews.some(
      (r) => r.reviewerId === data.me.id,
    );

    //If user has reviewed, there is no more action they can take, return null
    if (hasReviewed) {
      return null;
    }

    //Product is approved, buyer and seller is prompted to leave a review
    if (purchase.approvedAt) {
      return (
        <Button
          label="Lämna ett omdöme"
          onPress={() => {
            onShowReview();
          }}
        />
      );
    }
    //Seller actions
    if (sellerIsMe) {
      //Shipment is booked, seller can display their QR-code
      if (purchase.shipmentBookedAt && sellerIsMe && purchase.qrCodeUrl) {
        return (
          <Button
            label="Visa QR-kod"
            onPress={() => {
              router.navigate({
                pathname: "/account/sales/shipping-code",
                params: { purchaseId: purchase.id },
              });
            }}
          />
        );
      }
      //Payment is accepted and tranportation method is NOT shipping, seller can mark as delivered
      if (
        purchase.paymentAcceptedAt &&
        !purchase.isShipping &&
        purchase.sellerRespondedAt &&
        !purchase.deliveredAt
      ) {
        return (
          <Button
            label="Markera som överlämnad"
            onPress={() => {
              if (!purchase || markAsDeliveredLoading) {
                return;
              }
              markAsDelivered({
                variables: {
                  input: { purchaseId: purchase.id },
                },
              });
            }}
          />
        );
      }
    } else {
      //buyer actions
      //Product is delivered, buyer can now approve of it
      if (purchase.deliveredAt) {
        return (
          <Button
            label="Godkänn vara"
            onPress={() => {
              if (!purchase || acceptPurchaseLoading) {
                return;
              }
              acceptPurchase({
                variables: {
                  input: { purchaseId: purchase.id },
                },
              });
            }}
          />
        );
      }
    }

    return null;
  };
  const secondButton = renderSecondButton();

  if (isDesktop) {
    return (
      <>
        {firstButton}
        {secondButton}
      </>
    );
  }
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <View style={{ flex: 1 }}>{firstButton}</View>
      {secondButton && <View style={{ flex: 2 }}>{secondButton}</View>}
    </View>
  );
};
