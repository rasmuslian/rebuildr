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
  Product,
  ProductStatusEnum,
  Purchase,
  User,
  UserType,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import { useBuyModalContext } from "@context/buy-modal-context";
import { CONVERSATION } from "@/app/(app)/conversation/[conversationId]";

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
  product: Product;
  purchase?: Purchase | null;
  me: User;
  onShowReview?: () => void;
  onShowQRCode?: () => void;
};
export const ChatActionButtons = ({
  product,
  purchase,
  me,
  onShowReview,
  onShowQRCode,
}: Props) => {
  const sellerIsMe = me.id === product.seller.id;
  const { isDesktop } = useScreenType();
  const { setVisible: setBuyModalVisible, setContent: setBuyModalContent } =
    useBuyModalContext();

  const [acceptPurchase, { loading: acceptPurchaseLoading }] = useMutation<
    ConversationAcceptPurchaseMutation,
    ConversationAcceptPurchaseMutationVariables
  >(CONVERSATION_ACCEPT_PURCHASE, { refetchQueries: [CONVERSATION] });
  const [markAsDelivered, { loading: markAsDeliveredLoading }] = useMutation<
    ConversationMarkAsDeliveredMutation,
    ConversationMarkAsDeliveredMutationVariables
  >(CONVERSATION_MARK_AS_DELIVERED, { refetchQueries: [CONVERSATION] });

  let firstButton: ReactNode = null;
  if (!purchase && product.status === ProductStatusEnum.Published) {
    firstButton = !sellerIsMe ? (
      <Button
        label="Köp"
        onPress={() => {
          if (isDesktop) {
            setBuyModalContent({
              buyState: "summary",
              productId: product.id,
            });
            setBuyModalVisible(true);
          } else {
            router.navigate({
              pathname: "/buy/[productId]",
              params: { productId: product.id },
            });
          }
        }}
        disabled={me.type === UserType.Business}
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
    const hasReviewed = purchase.reviews.some((r) => r.reviewerId === me.id);

    //If user has reviewed, there is no more action they can take, return null
    if (hasReviewed) {
      return null;
    }
    if (purchase.failedAt) {
      return null;
    }

    //Product is approved, buyer and seller is prompted to leave a review
    if (purchase.approvedAt) {
      return (
        <Button
          label="Lämna ett omdöme"
          onPress={() => {
            onShowReview?.();
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
              onShowQRCode?.();
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
