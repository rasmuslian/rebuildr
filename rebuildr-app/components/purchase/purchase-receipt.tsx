import {
  PurchaseReceiptQuery,
  PurchaseReceiptQueryVariables,
  TransportationEnum,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Avatar } from "@components/avatar/avatar";
import { ReceiptCard } from "@components/purchase/receipt-card";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ImageCarousel } from "@components/preview-product/image-carousel";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { shippingProviderStrings } from "@constants/shippingProviders";
import dayjs from "dayjs";
import { View } from "react-native";
import { PurchaseProgress } from "./purchase-progress";
import { useState } from "react";
import { AbortPurchaseBottomSheet } from "@components/abort-purchase/abort-purchase-bottom-sheet";
import { CreateReviewBottomSheet } from "@components/review/create-review-bottom-sheet";

export const PURCHASE_RECEIPT = gql`
  query PurchaseReceipt($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      status
      createdAt
      paymentAcceptedAt
      shipmentDroppedOffAt
      shipmentDeliveredAt
      sellerRespondedAt
      deliveredAt
      approvedAt
      pausedAt
      failedAt
      paymentMethod
      transportationMethod
      isFree
      isRefunded
      abortedById
      boughtForFree
      shippingPrice {
        id
        price
        maxWeight
        provider
      }
      product {
        id
        title
        price
        deliveryPrice
        seller {
          id
          username
        }
        images {
          id
          mimeType
          url
          name
        }
      }
      buyer {
        id
        username
        name
        address
        postCode
        city
        profilePicture {
          id
          url
        }
      }
      reviews {
        id
        reviewerId
        revieweeId
      }
    }
    me {
      id
      email
      type
    }
  }
`;

type Props = {
  purchaseId: string;
};

export const PurchaseReceipt = ({ purchaseId }: Props) => {
  const [showAbortSheet, setShowAbortSheet] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const { data, refetch } = useQuery<
    PurchaseReceiptQuery,
    PurchaseReceiptQueryVariables
  >(PURCHASE_RECEIPT, { variables: { input: { id: purchaseId } } });

  if (!data) {
    return <LoadingSpinner />;
  }

  const buyer = data.purchase.buyer;
  const buyerIsMe = buyer.id === data.me.id;

  return (
    <View style={{ gap: 24 }}>
      <ImageCarousel images={data.purchase.product.images} />
      <View style={{ gap: 16 }}>
        <Title size="large">{data.purchase.product.title}</Title>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Avatar imageUrl={buyer.profilePicture?.url} size={32} />
          <View>
            <Label size="medium">
              {buyerIsMe
                ? `Köpt av ${data.purchase.product.seller.username}`
                : `Sålt till ${buyer.username}`}
            </Label>
            <Body size="small" color="secondary">
              {dayjs(data.purchase.createdAt).format("DD MMMM, YYYY")}
            </Body>
          </View>
        </View>
      </View>
      <Divider />
      <View style={{ gap: 16 }}>
        <Headline size="small">Vad händer nu?</Headline>
        <PurchaseProgress
          purchaseData={data}
          onAbortPurchase={() => setShowAbortSheet(true)}
          onOpenReview={() => {
            setShowReviewSheet(true);
          }}
        />
      </View>
      <Divider />
      <View style={{ gap: 16 }}>
        <Headline size="small">Kvitto</Headline>
        <ReceiptCard
          price={data.purchase.product.price}
          paymentMethod={data.purchase.paymentMethod}
          payedAt={data.purchase.paymentAcceptedAt ?? data.purchase.createdAt}
          shippingPrice={data.purchase.shippingPrice}
          deliveryPrice={data.purchase.product.deliveryPrice}
          transportationMethod={data.purchase.transportationMethod}
          boughtForFree={data.purchase.boughtForFree}
          role={buyerIsMe ? "buyer" : "seller"}
          userType={data.me.type}
        />
      </View>
      <Divider />
      {data.purchase.transportationMethod === TransportationEnum.Shipping && (
        <>
          <View style={{ gap: 16 }}>
            <Headline size="small">Leveranssätt</Headline>
            <View style={{ gap: 4 }}>
              <Label size="medium">Leveransadress</Label>
              <Body size="medium">{buyer.name}</Body>
              <Body size="medium">
                {buyer.address}, {buyer.postCode} {buyer.city}
              </Body>
            </View>
            <View style={{ gap: 4 }}>
              <Label size="medium">
                Skickas med{" "}
                {data.purchase.shippingPrice?.provider
                  ? shippingProviderStrings[
                      data.purchase.shippingPrice?.provider
                    ]
                  : ""}
              </Label>
              <Body size="medium">
                {buyerIsMe
                  ? `Du får ett meddelande från ${data.purchase.shippingPrice?.provider ? shippingProviderStrings[data.purchase.shippingPrice?.provider] : ""} när paketet kan hämtas.`
                  : "Vi meddelar dig så snart köparen har hämtat ut paketet."}
              </Body>
            </View>
          </View>
          <Divider />
        </>
      )}
      <View style={{ gap: 16 }}>
        <Headline size="small">Har du några frågor?</Headline>
        <Body size="medium">
          Om något känns oklart kan du kika i våra{" "}
          <Body size="medium" isLink>
            vanliga frågor
          </Body>{" "}
          eller{" "}
          <Body size="medium" isLink>
            kontakta säljaren
          </Body>
          .
        </Body>
      </View>
      <AbortPurchaseBottomSheet
        purchaseId={data.purchase.id}
        show={showAbortSheet}
        onDismiss={() => setShowAbortSheet(false)}
        onAbortPurchaseCompleted={() => setShowAbortSheet(false)}
      />
      <CreateReviewBottomSheet
        purchaseId={data.purchase.id}
        show={showReviewSheet}
        onDismiss={() => setShowReviewSheet(false)}
        onCreateReviewCompleted={() => {
          refetch();
        }}
      />
    </View>
  );
};
