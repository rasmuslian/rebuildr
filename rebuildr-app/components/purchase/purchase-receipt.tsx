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
import { ReportPurchaseBottomSheet } from "@components/report/report-purchase-bottom-sheet";
import { useScreenType } from "@hooks/useScreenType";
import { ImageGallery } from "@components/preview-product/image-gallery";
import { CreateReview } from "@components/review/create-review";
import { router } from "expo-router";
import { Popup } from "@components/popup/popup";
import { ShippingCodeContent } from "@components/shipping-code/shipping-code-content";

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
      qrCodeUrl
      qrCodeContent
      shippingPrice {
        id
        price
        maxWeight
        provider
      }
      product {
        id
        status
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
      reportPurchase {
        id
        resolution
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
  showDesktopCarousel?: boolean;
  carouselDesktopWidth?: number;
};

export const PurchaseReceipt = ({
  purchaseId,
  showDesktopCarousel = false,
  carouselDesktopWidth,
}: Props) => {
  const { isDesktop } = useScreenType();
  const [showAbortSheet, setShowAbortSheet] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [showQRCodePopup, setShowQRCodePopup] = useState(false);
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
      {isDesktop && !showDesktopCarousel ? (
        <ImageGallery
          images={data.purchase.product.images}
          status={data.purchase.product.status}
          displaySoldOverlay={false}
        />
      ) : (
        <ImageCarousel
          images={data.purchase.product.images}
          status={data.purchase.product.status}
          displaySoldOverlay={false}
          width={carouselDesktopWidth}
          ratio={carouselDesktopWidth ? 2 : 1}
        />
      )}
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
          onReport={() => setShowReportSheet(true)}
          onShowQRCode={() => {
            if (isDesktop) {
              setShowQRCodePopup(true);
            } else {
              router.navigate({
                pathname: "/account/sales/shipping-code",
                params: { purchaseId: data.purchase.id },
              });
            }
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
          {buyerIsMe ? (
            <Body
              size="medium"
              link={{
                pathname: "/conversations/[productId]/[userId]",
                params: {
                  productId: data.purchase.product.id,
                  userId: data.purchase.product.seller.id,
                },
              }}
            >
              kontakta säljaren
            </Body>
          ) : (
            <Body
              size="medium"
              link={{
                pathname: "/conversations/[productId]/[userId]",
                params: {
                  productId: data.purchase.product.id,
                  userId: data.purchase.buyer.id,
                },
              }}
            >
              kontakta köparen
            </Body>
          )}
          .
        </Body>
      </View>
      <AbortPurchaseBottomSheet
        purchaseId={data.purchase.id}
        purchaseStatus={data.purchase.status}
        show={showAbortSheet}
        onDismiss={() => setShowAbortSheet(false)}
        onAbortPurchaseCompleted={() => setShowAbortSheet(false)}
      />
      <CreateReview
        purchaseId={data.purchase.id}
        show={showReviewSheet}
        onDismiss={() => setShowReviewSheet(false)}
        onCreateReviewCompleted={() => {
          refetch();
        }}
      />
      <ReportPurchaseBottomSheet
        purchaseId={data.purchase.id}
        show={showReportSheet}
        onDismiss={() => setShowReportSheet(false)}
        onCreateReportComplete={() => refetch()}
      />
      {isDesktop && (
        <Popup onClose={() => setShowQRCodePopup(false)} open={showQRCodePopup}>
          <ShippingCodeContent purchase={data.purchase} showUpload />
        </Popup>
      )}
    </View>
  );
};
