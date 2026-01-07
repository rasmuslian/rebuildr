import {
  PurchaseReceiptQuery,
  TransportationEnum,
  PurchaseStatusEnum,
  ApprovePurchaseMutation,
  ApprovePurchaseMutationVariables,
  ReportPurchaseResolutionEnum,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { ProgressIndicator } from "@components/progress-indicator/progress-indicator";
import { Body, Label } from "@components/typography/text";
import { shippingProviderStrings } from "@constants/shippingProviders";
import dayjs from "dayjs";
import { router } from "expo-router";
import React, { ComponentProps } from "react";
import { View } from "react-native";

const APPROVE_PURCHASE = gql`
  mutation ApprovePurchase($input: AcceptPurchaseInput!) {
    acceptPurchase(input: $input) {
      id
      approvedAt
      status
    }
  }
`;

const RECEIPT_MARK_AS_DELIVERED = gql`
  mutation ReceiptMarkAsDelivered($input: MarkPurchaseAsDeliveredInput!) {
    markPurchaseAsDelivered(input: $input) {
      id
      status
      deliveredAt
    }
  }
`;

const dateToString = (date?: Date, type: "simple" | "default" = "default") => {
  if (!date) {
    return "";
  }
  return dayjs(date).format(type === "simple" ? "D MMMM" : "D MMMM, YYYY");
};
const dateForwardAWeek = (date: Date) => {
  return dayjs(date).add(7, "days").toDate();
};
const dateForwardADay = (date: Date) => {
  return dayjs(date).add(1, "day").format("D MMMM kl. HH:mm");
};
type PurchaseType = PurchaseReceiptQuery["purchase"];
type MeType = PurchaseReceiptQuery["me"];
type ElementsType = ComponentProps<typeof ProgressEntry>["elements"];

type PurchaseProgressProps = {
  purchaseData: PurchaseReceiptQuery;
  onAbortPurchase: () => void;
  onOpenReview: () => void;
  onReport: () => void;
  onShowQRCode: () => void;
};

export const PurchaseProgress = ({
  purchaseData,
  onAbortPurchase,
  onOpenReview,
  onReport,
  onShowQRCode,
}: PurchaseProgressProps) => {
  const purchase = purchaseData.purchase;
  const me = purchaseData.me;
  const isBuyer = me.id === purchase.buyer.id;

  const handoffIsPickup =
    purchaseData.purchase.transportationMethod === TransportationEnum.Pickup;

  const [approvePurchase, { loading: approvePurchaseLoading }] = useMutation<
    ApprovePurchaseMutation,
    ApprovePurchaseMutationVariables
  >(APPROVE_PURCHASE, { variables: { input: { purchaseId: purchase.id } } });
  const [markAsDelivered, { loading: markAsDeliveredLoading }] = useMutation(
    RECEIPT_MARK_AS_DELIVERED,
  );
  if (purchase.transportationMethod === TransportationEnum.Shipping) {
    if (isBuyer) {
      if (purchase.reportPurchase) {
        return purchase.reportPurchase.resolution ? (
          <ProgressIndicator
            steps={[
              payedInitialEntry(purchase, me),
              packageArrivedEntry(purchase),
              packageDeliveredBuyerEntry(purchase),
              reportResolvedEntry(
                purchase,
                me,
                purchase.reportPurchase.resolution,
                onOpenReview,
              ),
            ]}
            current={3}
          />
        ) : (
          <ProgressIndicator
            steps={[
              payedInitialEntry(purchase, me),
              packageArrivedEntry(purchase),
              packageDeliveredBuyerEntry(purchase),
              <ProgressEntry
                title="Du har rapporterat ett problem"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children: dateToString(purchase.pausedAt),
                      },
                    ],
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Du har meddelat att något inte stämmer med varan. Utbetalningen till säljaren är pausad under tiden ärendet pågår.",
                      },
                    ],
                  },
                  ...reviewDuringReportParts(purchase, me, onOpenReview),
                ]}
              />,
            ]}
            isProblem
            current={4}
          />
        );
      }
      switch (purchase.status) {
        case PurchaseStatusEnum.PaymentAccepted:
        case PurchaseStatusEnum.PaymentStarted:
        case PurchaseStatusEnum.ShipmentBooked:
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                <ProgressEntry
                  title="Paketet är snart på väg till dig"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: `${purchase.product.seller.username} skickar varan senast ${dateToString(dateForwardAWeek(purchase.paymentAcceptedAt))} `,
                        },
                      ],
                    },
                    {
                      type: "body",
                      textParts: [
                        {
                          children: "Ångrat dig? Inga problem!",
                        },
                        {
                          children: "\n",
                        },
                        {
                          children: "Du kan fortfarande ",
                        },
                        {
                          onPress: onAbortPurchase,
                          children: "avbryta innan paketet skickas.",
                        },
                      ],
                    },
                  ]}
                />,
                <ProgressEntry
                  disabled
                  title="Hämta ut ditt paket"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children:
                            "Du får ett mejl eller SMS från PostNord när paketet har kommit fram.",
                        },
                      ],
                    },
                  ]}
                />,
                <ProgressEntry
                  disabled
                  title="Säljaren får betalt"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children:
                            "När du har hämtat ut paketet har du 48 timmar på dig att se att allt stämmer, annars betalas pengarna ut automatiskt.",
                        },
                      ],
                    },
                  ]}
                />,
              ]}
              current={1}
            />
          );
        case PurchaseStatusEnum.ShipmentDroppedOff:
        case PurchaseStatusEnum.ShippingStarted:
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                <ProgressEntry
                  title="Paketet är på väg till dig"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: `Paketet har lämnats in och är på väg till dig.`,
                        },
                      ],
                    },
                  ]}
                />,
                <ProgressEntry
                  disabled
                  title="Hämta ut ditt paket"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children:
                            "Du får ett mejl eller SMS från PostNord när paketet har kommit fram.",
                        },
                      ],
                    },
                  ]}
                />,
                <ProgressEntry
                  disabled
                  title="Säljaren får betalt"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children:
                            "När du har hämtat ut paketet har du 48 timmar på dig att se att allt stämmer, annars betalas pengarna ut automatiskt.",
                        },
                      ],
                    },
                  ]}
                />,
              ]}
              current={1}
            />
          );
        case PurchaseStatusEnum.ShippingDelivered:
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                packageArrivedEntry(purchase),
                <ProgressEntry
                  title="Hämta ut ditt paket"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: `Hämta det hos ombud senast ${dateToString(dateForwardAWeek(purchase.shipmentDeliveredAt))}.
Du får en kod från ${purchase.shippingPrice ? shippingProviderStrings[purchase.shippingPrice.provider] : ""} via SMS eller mejl.`,
                        },
                      ],
                    },
                  ]}
                />,
                <ProgressEntry
                  disabled
                  title="Säljaren får betalt"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children:
                            "När du har hämtat ut paketet har du 48 timmar på dig att se att allt stämmer, annars betalas pengarna ut automatiskt.",
                        },
                      ],
                    },
                  ]}
                />,
              ]}
              current={2}
            />
          );
        case PurchaseStatusEnum.Delivered:
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                packageArrivedEntry(purchase),
                packageDeliveredBuyerEntry(purchase),
                buyerApproveEntry(
                  approvePurchase,
                  approvePurchaseLoading,
                  onReport,
                ),
              ]}
              current={3}
            />
          );
        case PurchaseStatusEnum.Approved:
        case PurchaseStatusEnum.PayoutStarted:
        case PurchaseStatusEnum.FinishedSuccess:
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                packageArrivedEntry(purchase),
                packageDeliveredBuyerEntry(purchase),
                purchaseCompleteEntry(purchase, me, onOpenReview),
              ]}
              current={4}
            />
          );
        case PurchaseStatusEnum.FinishedFailed:
          if (purchase.abortedById !== purchase.buyer.id) {
            return (
              <ProgressIndicator
                steps={[
                  payedInitialEntry(purchase, me),
                  <ProgressEntry
                    title="Köpet är avbrutet"
                    elements={[
                      {
                        type: "body",
                        textParts: [
                          {
                            children: dateToString(purchase.failedAt),
                          },
                        ],
                      },
                      {
                        type: "body",
                        textParts: [
                          {
                            children: "Säljaren lämnade inte in paketet i tid.",
                          },
                          { children: "\n" },
                          {
                            children:
                              "Köpet är nu avbrutet och dina pengar har återbetalats.",
                          },
                        ],
                      },
                    ]}
                  />,
                ]}
                isProblem
                current={2}
              />
            );
          }
          if (purchase.abortedById === purchase.buyer.id) {
            return (
              <ProgressIndicator
                steps={[
                  payedInitialEntry(purchase, me),
                  <ProgressEntry
                    title="Du har avbrutit köpet"
                    elements={[
                      {
                        type: "body",
                        textParts: [
                          {
                            children: dateToString(purchase.failedAt),
                          },
                        ],
                      },
                      {
                        type: "body",
                        textParts: [
                          {
                            children: "Du har valt att avbryta köpet.",
                          },
                          { children: "\n" },
                          {
                            children:
                              "Köpet är nu avbrutet och dina pengar återbetalas automatiskt.",
                          },
                        ],
                      },
                    ]}
                  />,
                ]}
                isProblem
                current={2}
              />
            );
          }
      }
    }

    //seller
    if (purchase.reportPurchase) {
      return purchase.reportPurchase.resolution ? (
        <ProgressIndicator
          steps={[
            soldInitialEntry(purchase),
            packageDroppedOffEntry(purchase),
            packageDeliveredSellerEntry(purchase),
            reportResolvedEntry(
              purchase,
              me,
              purchase.reportPurchase.resolution,
              onOpenReview,
            ),
          ]}
          current={3}
        />
      ) : (
        <ProgressIndicator
          isProblem
          current={4}
          steps={[
            soldInitialEntry(purchase),
            packageDroppedOffEntry(purchase),
            packageDeliveredSellerEntry(purchase),
            <ProgressEntry
              title="Ett problem har rapporterats"
              elements={[
                {
                  type: "body",
                  textParts: [
                    {
                      children: dateToString(purchase.pausedAt),
                    },
                  ],
                },
                {
                  type: "body",
                  textParts: [
                    {
                      children:
                        "Köparen har meddelat att något inte stämmer med varan. Utbetalningen är därför pausad under tiden ärendet pågår.",
                    },
                  ],
                },
                ...reviewDuringReportParts(purchase, me, onOpenReview),
              ]}
            />,
          ]}
        />
      );
    }
    switch (purchase.status) {
      case PurchaseStatusEnum.PaymentAccepted:
      case PurchaseStatusEnum.PaymentStarted:
      case PurchaseStatusEnum.ShipmentBooked:
        return (
          <ProgressIndicator
            steps={[
              soldInitialEntry(purchase),
              <ProgressEntry
                title="Lämna in paketet hos ombud"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children: `Lämna in paketet senast den ${dateToString(dateForwardAWeek(purchase.paymentAcceptedAt))} `,
                      },
                    ],
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Visa din QR-kod hos valfritt Postnord-ombud. Ombudet skriver ut fraktsedeln åt dig, så du behöver inte förbereda något hemma.",
                      },
                    ],
                  },
                  {
                    type: "button",
                    buttonProps: {
                      label: "Visa QR-kod",
                      onPress: onShowQRCode,
                    },
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children: "Ångrat dig? Inga problem!",
                      },
                      {
                        children: "\n",
                      },
                      {
                        children: "Du kan fortfarande ",
                      },
                      {
                        onPress: onAbortPurchase,
                        children: "avbryta innan paketet skickas.",
                      },
                    ],
                  },
                ]}
              />,
              <ProgressEntry
                disabled
                title="Köparen hämtar paketet"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Vi meddelar dig så snart köparen har hämtat ut paketet.",
                      },
                    ],
                  },
                ]}
              />,
              <ProgressEntry
                disabled
                title="Snart får du betalt"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Köparen har 48 timmar på sig att bekräfta att allt stämmer med annonsen efter att paketet har hämtats ut.",
                      },
                    ],
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Om allt stämmer betala pengarna ut automatiskt till ditt konto.",
                      },
                    ],
                  },
                ]}
              />,
            ]}
            current={1}
          />
        );
      case PurchaseStatusEnum.ShipmentDroppedOff:
      case PurchaseStatusEnum.ShippingStarted:
      case PurchaseStatusEnum.ShippingDelivered:
        return (
          <ProgressIndicator
            steps={[
              soldInitialEntry(purchase),
              packageDroppedOffEntry(purchase),
              <ProgressEntry
                title="Köparen hämtar paketet"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Vi meddelar dig så snart köparen har hämtat ut paketet.",
                      },
                    ],
                  },
                ]}
              />,
              <ProgressEntry
                disabled
                title="Snart får du betalt"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Köparen har 48 timmar på sig att bekräfta att allt stämmer med annonsen efter att paketet har hämtats ut.",
                      },
                    ],
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Om allt stämmer betala pengarna ut automatiskt till ditt konto.",
                      },
                    ],
                  },
                ]}
              />,
            ]}
            current={2}
          />
        );
      case PurchaseStatusEnum.Delivered:
        return (
          <ProgressIndicator
            steps={[
              soldInitialEntry(purchase),
              packageDroppedOffEntry(purchase),
              packageDeliveredSellerEntry(purchase),
              <ProgressEntry
                title="Snart får du betalt"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Köparen har 48 timmar på sig att bekräfta att allt stämmer med annonsen efter att paketet har hämtats ut.",
                      },
                    ],
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Om allt stämmer betala pengarna ut automatiskt till ditt konto.",
                      },
                    ],
                  },
                ]}
              />,
            ]}
            current={3}
          />
        );
      case PurchaseStatusEnum.Approved:
      case PurchaseStatusEnum.PayoutStarted:
      case PurchaseStatusEnum.FinishedSuccess:
        return (
          <ProgressIndicator
            steps={[
              soldInitialEntry(purchase),
              packageDroppedOffEntry(purchase),
              packageDeliveredSellerEntry(purchase),
              saleCompleteEntry(purchase, me, onOpenReview),
            ]}
            current={4}
          />
        );
      case PurchaseStatusEnum.FinishedFailed:
        if (purchase.abortedById !== purchase.buyer.id) {
          return (
            <ProgressIndicator
              steps={[
                soldInitialEntry(purchase),
                <ProgressEntry
                  title="Köpet är avbrutet"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: dateToString(purchase.failedAt),
                        },
                      ],
                    },
                    {
                      type: "body",
                      textParts: [
                        {
                          children: "Du lämnade inte in paketet i tid.",
                        },
                        {
                          children: "\n",
                        },
                        {
                          children:
                            "Köpet är nu avbrutet och köparens pengar har återbetalats.",
                        },
                      ],
                    },
                    {
                      type: "body",
                      textParts: [
                        {
                          children:
                            "Annonsen är nu aktiv och tillgänglig för nya köpare.",
                        },
                      ],
                    },
                    {
                      type: "button",
                      buttonProps: {
                        label: "Gå till annonsen",
                        onPress: () => {
                          router.navigate({
                            pathname: "/product/[productId]",
                            params: { productId: purchase.product.id },
                          });
                        },
                      },
                    },
                  ]}
                />,
              ]}
              isProblem
              current={2}
            />
          );
        }
        if (purchase.abortedById === purchase.buyer.id) {
          return (
            <ProgressIndicator
              steps={[
                soldInitialEntry(purchase),
                <ProgressEntry
                  title="Köparen har avbrutit köpet"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: dateToString(purchase.failedAt),
                        },
                      ],
                    },
                    {
                      type: "body",
                      textParts: [
                        {
                          children: "Köparen har valt att avbryta köpet.",
                        },
                        { children: "\n" },
                        {
                          children:
                            "Annonsen är nu aktiv och tillgänglig för nya köpare.",
                        },
                      ],
                    },
                    {
                      type: "button",
                      buttonProps: {
                        label: "Gå till annonsen",
                        onPress: () => {
                          router.navigate({
                            pathname: "/product/[productId]",
                            params: { productId: purchase.product.id },
                          });
                        },
                      },
                    },
                  ]}
                />,
              ]}
              isProblem
              current={2}
            />
          );
        }
    }
  }
  if (
    purchase.transportationMethod === TransportationEnum.Delivery ||
    purchase.transportationMethod === TransportationEnum.Pickup
  ) {
    if (isBuyer) {
      if (purchase.reportPurchase) {
        return purchase.reportPurchase.resolution ? (
          <ProgressIndicator
            steps={[
              payedInitialEntry(purchase, me),
              sellerConfirmedDelivery(purchase, handoffIsPickup),
              reportResolvedEntry(
                purchase,
                me,
                purchase.reportPurchase.resolution,
                onOpenReview,
              ),
            ]}
            current={3}
          />
        ) : (
          <ProgressIndicator
            steps={[
              payedInitialEntry(purchase, me),
              sellerConfirmedDelivery(purchase, handoffIsPickup),
              <ProgressEntry
                title="Du har rapporterat ett problem"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children: dateToString(purchase.pausedAt),
                      },
                    ],
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Du har meddelat att något inte stämmer med varan. Utbetalningen till säljaren är pausad under tiden ärendet pågår.",
                      },
                    ],
                  },
                  ...reviewDuringReportParts(purchase, me, onOpenReview),
                ]}
              />,
            ]}
            isProblem
            current={3}
          />
        );
      }
      switch (purchase.status) {
        case PurchaseStatusEnum.PaymentAccepted:
        case PurchaseStatusEnum.PaymentStarted:
          if (purchase.sellerRespondedAt) {
            return (
              <ProgressIndicator
                steps={[
                  payedInitialEntry(purchase, me),
                  <ProgressEntry
                    title={`${handoffIsPickup ? "Åk och hämta senast" : "Säljaren levererar"} ${dateToString(dateForwardAWeek(purchase.sellerRespondedAt))}`}
                    elements={[
                      {
                        type: "body",
                        textParts: [
                          {
                            children: `${handoffIsPickup ? "Hämta din vara senast" : "Hemtransporten sker senast"} ${dateToString(dateForwardAWeek(purchase.sellerRespondedAt))}, annars avbryts köpet och du får tillbaka dina pengar.`,
                          },
                        ],
                      },
                      {
                        type: "body",
                        textParts: [
                          { children: "Ångrat dig? Du kan fortfarande " },
                          {
                            children: purchase.boughtForFree
                              ? "avbryta affären"
                              : "avbrytat köpet",
                            onPress: onAbortPurchase,
                          },
                          { children: "." },
                        ],
                      },
                    ]}
                  />,
                  ...(purchase.boughtForFree
                    ? []
                    : [
                        <ProgressEntry
                          disabled
                          title="Säljaren får betalt"
                          elements={[
                            {
                              type: "body",
                              textParts: [
                                {
                                  children: `Säljaren bekräftar när du har ${handoffIsPickup ? "hämtat" : "tagit emot"} din vara. `,
                                },
                                {
                                  children: "\n",
                                },
                                {
                                  children:
                                    "Då har du 48 timmar på dig att se så varan stämmer överens med annonsen innan pengarna betalas ut till säljaren.",
                                },
                              ],
                            },
                          ]}
                        />,
                      ]),
                ]}
                current={purchase.boughtForFree ? 1 : 2}
              />
            );
          }
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                <ProgressEntry
                  title={`Dags att planera ${handoffIsPickup ? "avhämtning" : "hemtransport"}`}
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: `När säljaren återkopplat kan ni bestämma tid och plats för ${handoffIsPickup ? "avhämtning" : "hemtransport"}. Vill du ändå ta första steget?`,
                        },
                      ],
                    },
                    {
                      type: "button",
                      buttonProps: {
                        label: "Chatta med säljaren",
                        onPress: () => {
                          router.navigate({
                            pathname: "/conversations/[productId]/[userId]",
                            params: {
                              productId: purchase.product.id,
                              userId: purchase.product.seller.id,
                            },
                          });
                        },
                      },
                    },
                    {
                      type: "body",
                      textParts: [
                        {
                          children: purchase.boughtForFree
                            ? "Om säljaren inte svarar inom 24 timmar avbryts affären automatiskt."
                            : "Om säljaren inte svarar inom 24 timmar betalas dina pengar tillbaka automatiskt.",
                        },
                      ],
                    },
                  ]}
                />,
                ...(purchase.boughtForFree
                  ? []
                  : [
                      <ProgressEntry
                        disabled
                        title="Säljaren får betalt"
                        elements={[
                          {
                            type: "body",
                            textParts: [
                              {
                                children: `Säljaren bekräftar när du har ${handoffIsPickup ? "hämtat" : "tagit emot"} din vara. `,
                              },
                              {
                                children: "\n",
                              },
                              {
                                children:
                                  "Då har du 48 timmar på dig att se så varan stämmer överens med annonsen innan pengarna betalas ut till säljaren.",
                              },
                            ],
                          },
                        ]}
                      />,
                    ]),
              ]}
              current={1}
            />
          );
        case PurchaseStatusEnum.Delivered:
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                sellerConfirmedDelivery(purchase, handoffIsPickup),
                buyerApproveEntry(
                  approvePurchase,
                  approvePurchaseLoading,
                  onReport,
                ),
              ]}
              current={3}
            />
          );
        case PurchaseStatusEnum.Approved:
        case PurchaseStatusEnum.PayoutStarted:
        case PurchaseStatusEnum.FinishedSuccess:
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                <ProgressEntry
                  title={`${handoffIsPickup ? "Avhämtning" : "Hemtransport"} bekräftad`}
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: `Säljaren bekräftade att varan överlämnades den ${dayjs(purchase.deliveredAt).format("D MMMM, kl HH:mm")}.`,
                        },
                      ],
                    },
                    ...(purchase.boughtForFree
                      ? reviewButtonPart(purchase, me, onOpenReview)
                      : []),
                  ]}
                />,
                ...(purchase.boughtForFree
                  ? []
                  : [purchaseCompleteEntry(purchase, me, onOpenReview)]),
              ]}
              current={3}
            />
          );
        case PurchaseStatusEnum.FinishedFailed:
          if (
            (purchase.isRefunded || purchase.boughtForFree) &&
            purchase.abortedById !== purchase.buyer.id
          ) {
            return (
              <ProgressIndicator
                steps={[
                  payedInitialEntry(purchase, me),
                  <ProgressEntry
                    title="Köpet är avbrutet"
                    elements={[
                      {
                        type: "body",
                        textParts: [
                          {
                            children: dateToString(purchase.failedAt),
                          },
                        ],
                      },
                      {
                        type: "body",
                        textParts: [
                          {
                            children: "Säljaren har valt att avbryta köpet.",
                          },
                          ...(purchase.boughtForFree
                            ? []
                            : [
                                { children: "\n" },
                                {
                                  children:
                                    "Köpet är nu avbrutet och dina pengar har återbetalats.",
                                },
                              ]),
                        ],
                      },
                    ]}
                  />,
                ]}
                isProblem
                current={2}
              />
            );
          }
          if (
            (purchase.isRefunded || purchase.boughtForFree) &&
            purchase.abortedById === purchase.buyer.id
          ) {
            return (
              <ProgressIndicator
                steps={[
                  payedInitialEntry(purchase, me),
                  <ProgressEntry
                    title="Du har avbrutit köpet"
                    elements={[
                      {
                        type: "body",
                        textParts: [
                          {
                            children: dateToString(purchase.failedAt),
                          },
                        ],
                      },
                      ...(purchase.boughtForFree
                        ? []
                        : ([
                            {
                              type: "body",
                              textParts: [
                                {
                                  children: "Du har valt att avbryta köpet.",
                                },
                                { children: "\n" },
                                {
                                  children:
                                    "Köpet är nu avbrutet och dina pengar återbetalas automatiskt.",
                                },
                              ],
                            },
                          ] as ElementsType)),
                    ]}
                  />,
                ]}
                isProblem
                current={2}
              />
            );
          }
      }
    }
    //seller
    if (purchase.reportPurchase) {
      return purchase.reportPurchase.resolution ? (
        <ProgressIndicator
          steps={[
            soldInitialEntry(purchase),
            deliveryConfirmedEntry(purchase),
            reportResolvedEntry(
              purchase,
              me,
              purchase.reportPurchase.resolution,
              onOpenReview,
            ),
          ]}
          current={3}
        />
      ) : (
        <ProgressIndicator
          steps={[
            soldInitialEntry(purchase),
            deliveryConfirmedEntry(purchase),
            <ProgressEntry
              title="Ett problem har rapporterats"
              elements={[
                {
                  type: "body",
                  textParts: [
                    {
                      children: dateToString(purchase.pausedAt),
                    },
                  ],
                },
                {
                  type: "body",
                  textParts: [
                    {
                      children:
                        "Köparen har meddelat att något inte stämmer med varan. " +
                        (purchase.boughtForFree
                          ? ""
                          : "Utbetalningen är därför pausad under tiden ärendet pågår."),
                    },
                  ],
                },
                ...reviewDuringReportParts(purchase, me, onOpenReview),
              ]}
            />,
          ]}
          isProblem
          current={3}
        />
      );
    }
    switch (purchase.status) {
      case PurchaseStatusEnum.PaymentAccepted:
      case PurchaseStatusEnum.PaymentStarted:
        if (
          purchase.sellerRespondedAt &&
          purchase.status === PurchaseStatusEnum.PaymentAccepted
        ) {
          return (
            <ProgressIndicator
              steps={[
                soldInitialEntry(purchase),
                <ProgressEntry
                  title={`${handoffIsPickup ? "Köparen hämtar" : "Åk och leverera"} senast ${dayjs(dateForwardAWeek(purchase.sellerRespondedAt)).format("D MMMM")}`}
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: "Ångrat dig? Du kan fortfarande ",
                        },
                        {
                          onPress: onAbortPurchase,
                          children: `avbryta ${purchase.boughtForFree ? "affären" : "köpet"}`,
                        },
                        { children: "." },
                      ],
                    },
                    ...(purchase.boughtForFree
                      ? ([
                          {
                            type: "button",
                            buttonProps: {
                              label: "Markera som överlämnad",
                              onPress: () => {
                                if (!purchase || markAsDeliveredLoading) {
                                  return;
                                }
                                markAsDelivered({
                                  variables: {
                                    input: { purchaseId: purchase.id },
                                  },
                                });
                              },
                            },
                          },
                        ] as ElementsType)
                      : []),
                  ]}
                />,
                ...(purchase.boughtForFree
                  ? []
                  : [
                      <ProgressEntry
                        title="Markera som överlämnad för att få betalt"
                        elements={[
                          {
                            type: "body",
                            textParts: [
                              {
                                children:
                                  "För att få betalt måste du markera att varan har överlämnats.",
                              },
                            ],
                          },
                          {
                            type: "button",
                            buttonProps: {
                              label: "Markera som överlämnad",
                              onPress: () => {
                                if (!purchase || markAsDeliveredLoading) {
                                  return;
                                }
                                markAsDelivered({
                                  variables: {
                                    input: { purchaseId: purchase.id },
                                  },
                                });
                              },
                            },
                          },
                          {
                            type: "body",
                            textParts: [
                              {
                                children:
                                  "Efter det har köparen 48 timmar att godkänna eller rapportera ett problem, annars betalas pengarna ut automatiskt till dig.",
                              },
                            ],
                          },
                        ]}
                      />,
                    ]),
              ]}
              current={purchase.boughtForFree ? 1 : 2}
            />
          );
        }
        return (
          <ProgressIndicator
            steps={[
              soldInitialEntry(purchase),
              <ProgressEntry
                title="Svara köparen i chatten"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children: `Skriv till köparen och bestäm tid och plats för ${handoffIsPickup ? "avhämtning" : "hemleverans"}.`,
                      },
                    ],
                  },
                  {
                    type: "button",
                    buttonProps: {
                      label: "Chatta med köparen",
                      onPress: () => {
                        router.navigate({
                          pathname: "/conversations/[productId]/[userId]",
                          params: {
                            productId: purchase.product.id,
                            userId: purchase.buyer.id,
                          },
                        });
                      },
                    },
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children: `Du behöver svara inom 24 timmar (senast ${dateForwardADay(purchase.paymentAcceptedAt)}).`,
                      },
                    ],
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children: purchase.boughtForFree
                          ? "Om du inte svarar i tid avbryts köpet automatiskt."
                          : "Om du inte svarar i tid avbryts köpet automatiskt och köparen får tillbaka sina pengar",
                      },
                    ],
                  },
                ]}
              />,
              ...(purchase.boughtForFree
                ? []
                : [
                    <ProgressEntry
                      disabled
                      title="Markera som överlämnad för att få betalt"
                      elements={[
                        {
                          type: "body",
                          textParts: [
                            {
                              children:
                                "För att få betalt måste du markera att varan har överlämnats",
                            },
                          ],
                        },
                        {
                          type: "body",
                          textParts: [
                            {
                              children:
                                "Efter det har köparen 48 timmar att godkänna eller rapportera ett problem, annars betalas pengarna ut automatiskt till dig.",
                            },
                          ],
                        },
                      ]}
                    />,
                  ]),
            ]}
            current={1}
          />
        );
      case PurchaseStatusEnum.Delivered:
        return (
          <ProgressIndicator
            steps={[
              soldInitialEntry(purchase),
              deliveryConfirmedEntry(purchase),
              <ProgressEntry
                title="Snart får du betalt"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Du har markerat att varan har överlämnats. Köparen har nu 48 timmar på sig att godkänna köpet eller rapportera ett problem.",
                      },
                    ],
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Om inget rapporteras betalas pengarna ut automatiskt till ditt konto.",
                      },
                    ],
                  },
                ]}
              />,
            ]}
            current={2}
          />
        );
      case PurchaseStatusEnum.Approved:
      case PurchaseStatusEnum.PayoutStarted:
      case PurchaseStatusEnum.FinishedSuccess:
        return (
          <ProgressIndicator
            steps={[
              soldInitialEntry(purchase),
              ...(purchase.boughtForFree
                ? [
                    <ProgressEntry
                      title="Överlämning bekräftad"
                      elements={[
                        {
                          type: "body",
                          textParts: [
                            {
                              children: `Du bekräftade att varan överlämnades den ${dayjs(purchase.deliveredAt).format("D MMMM, kl HH:mm")}.`,
                            },
                          ],
                        },
                        ...(purchase.boughtForFree
                          ? ([
                              ...reviewButtonPart(purchase, me, onOpenReview),
                              {
                                type: "body",
                                textParts: [
                                  {
                                    children:
                                      "Tack för att du använder Rebuildr!",
                                  },
                                ],
                              },
                            ] as ElementsType)
                          : []),
                      ]}
                    />,
                  ]
                : [deliveryConfirmedEntry(purchase)]),
              ...(purchase.boughtForFree
                ? []
                : [saleCompleteEntry(purchase, me, onOpenReview)]),
            ]}
            current={3}
          />
        );
      case PurchaseStatusEnum.FinishedFailed:
        if (
          (purchase.isRefunded || purchase.boughtForFree) &&
          purchase.abortedById !== purchase.buyer.id
        ) {
          return (
            <ProgressIndicator
              steps={[
                soldInitialEntry(purchase),
                <ProgressEntry
                  title="Köpet är avbrutet"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: dateToString(purchase.failedAt),
                        },
                      ],
                    },
                    ...(purchase.boughtForFree
                      ? []
                      : ([
                          {
                            type: "body",
                            textParts: [
                              {
                                children:
                                  "Köpet är nu avbrutet och köparens pengar har återbetalats.",
                              },
                            ],
                          },
                        ] as ElementsType)),
                    {
                      type: "body",
                      textParts: [
                        {
                          children:
                            "Annonsen är nu aktiv och tillgänglig för nya köpare.",
                        },
                      ],
                    },
                    {
                      type: "button",
                      buttonProps: {
                        label: "Gå till annonsen",
                        onPress: () => {
                          router.navigate({
                            pathname: "/product/[productId]",
                            params: { productId: purchase.product.id },
                          });
                        },
                      },
                    },
                  ]}
                />,
              ]}
              isProblem
              current={2}
            />
          );
        }
        if (
          (purchase.isRefunded || purchase.boughtForFree) &&
          purchase.abortedById === purchase.buyer.id
        ) {
          return (
            <ProgressIndicator
              steps={[
                soldInitialEntry(purchase),
                <ProgressEntry
                  title="Köparen har avbrutit köpet"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: dateToString(purchase.failedAt),
                        },
                      ],
                    },
                    {
                      type: "body",
                      textParts: [
                        {
                          children: "Köparen har valt att avbryta köpet.",
                        },
                        { children: "\n" },
                        {
                          children:
                            "Annonsen är nu aktiv och tillgänglig för nya köpare.",
                        },
                      ],
                    },
                    {
                      type: "button",
                      buttonProps: {
                        label: "Gå till annonsen",
                        onPress: () => {
                          router.navigate({
                            pathname: "/product/[productId]",
                            params: { productId: purchase.product.id },
                          });
                        },
                      },
                    },
                  ]}
                />,
              ]}
              isProblem
              current={2}
            />
          );
        }
    }
  }

  return null;
};

//----------------- REPEATING ENTRIES --------------------------
const soldInitialEntry = (purchase: PurchaseType) => (
  <ProgressEntry
    title={
      purchase.boughtForFree
        ? "Du har sålt varan för 0 kr"
        : "Du har sålt en vara"
    }
    elements={[
      {
        type: "body",
        textParts: [{ children: dateToString(purchase.paymentAcceptedAt) }],
      },
    ]}
  />
);
const payedInitialEntry = (purchase: PurchaseType, me: MeType) => {
  if (purchase.boughtForFree) {
    return (
      <ProgressEntry
        title="Du har köpt varan för 0 kr"
        elements={[
          {
            type: "body",
            textParts: [{ children: dateToString(purchase.paymentAcceptedAt) }],
          },
          {
            type: "body",
            textParts: [
              {
                children: `Du får en bekräftelse till ${me.email}`,
              },
            ],
          },
        ]}
      />
    );
  }
  return (
    <ProgressEntry
      title="Du har betalat"
      elements={[
        {
          type: "body",
          textParts: [{ children: dateToString(purchase.paymentAcceptedAt) }],
        },
        {
          type: "body",
          textParts: [
            {
              children: `Du får en bekräftelse från Stripe till ${me.email}`,
            },
          ],
        },
      ]}
    />
  );
};
const packageDroppedOffEntry = (purchase: PurchaseType) => (
  <ProgressEntry
    title="Paketet är inlämnat"
    elements={[
      {
        type: "body",
        textParts: [{ children: dateToString(purchase.shipmentDroppedOffAt) }],
      },
      {
        type: "body",
        textParts: [
          {
            children: "Paketet har lämnats in och är nu på väg till köparen.",
          },
        ],
      },
    ]}
  />
);
const packageArrivedEntry = (purchase: PurchaseType) => (
  <ProgressEntry
    title="Paketet är framme"
    elements={[
      {
        type: "body",
        textParts: [
          {
            children: `${dateToString(purchase.shipmentDeliveredAt)}`,
          },
        ],
      },
    ]}
  />
);
const packageDeliveredSellerEntry = (purchase: PurchaseType) => (
  <ProgressEntry
    title="Köparen har hämtat paketet"
    elements={[
      {
        type: "body",
        textParts: [
          {
            children: dateToString(purchase.deliveredAt),
          },
        ],
      },
    ]}
  />
);
const packageDeliveredBuyerEntry = (purchase: PurchaseType) => (
  <ProgressEntry
    title="Du har hämtat ditt paket"
    elements={[
      {
        type: "body",
        textParts: [
          {
            children: `${dateToString(purchase.deliveredAt)}`,
          },
        ],
      },
    ]}
  />
);
const deliveryConfirmedEntry = (purchase: PurchaseType) => (
  <ProgressEntry
    title="Överlämning bekräftad"
    elements={[
      {
        type: "body",
        textParts: [
          {
            children: `Du bekräftade att varan överlämnades den ${dayjs(purchase.deliveredAt).format("D MMMM, kl HH:mm")}.`,
          },
        ],
      },
    ]}
  />
);
const sellerConfirmedDelivery = (purchase: PurchaseType, isPickup: boolean) => (
  <ProgressEntry
    title={`${isPickup ? "Avhämtning" : "Hemtransport"} bekräftad`}
    elements={[
      {
        type: "body",
        textParts: [
          {
            children: `Säljaren bekräftade att varan överlämnades den ${dayjs(purchase.deliveredAt).format("D MMMM, kl HH:mm")}`,
          },
        ],
      },
    ]}
  />
);
const buyerApproveEntry = (
  onApprove: () => void,
  approveLoading: boolean,
  onReport: () => void,
) => (
  <ProgressEntry
    title="Säljaren får betalt"
    elements={[
      {
        type: "body",
        textParts: [
          {
            children:
              "Du har 48 timmar på dig att kontrollera att varan stämmer med annonsen.",
          },
        ],
      },
      {
        type: "body",
        textParts: [
          {
            children:
              "Om allt ser bra ut betalas pengarna automatiskt ut till säljaren.",
          },
        ],
      },
      {
        type: "button",
        buttonProps: {
          label: "Godkänn varan",
          onPress: onApprove,
          loading: approveLoading,
        },
      },
      {
        type: "body",
        textParts: [
          { children: "Stämmer inte varan med annonsen?" },
          { children: "\n" },
          {
            children: "Rapportera ett problem med köp",
            isLink: true,
            onPress: onReport,
          },
        ],
      },
    ]}
  />
);
const purchaseCompleteEntry = (
  purchase: PurchaseType,
  me: MeType,
  onOpenReview: () => void,
) => {
  return (
    <ProgressEntry
      title="Köpet är slutfört"
      elements={[
        {
          type: "body",
          textParts: [
            {
              children: dateToString(purchase.approvedAt),
            },
          ],
        },
        {
          type: "body",
          textParts: [
            {
              children:
                "Du har godkänt varan och pengarna har nu betalats ut till säljaren.",
            },
          ],
        },
        ...reviewButtonPart(purchase, me, onOpenReview),
        {
          type: "body",
          textParts: [
            {
              children: "Tack för att du handlade med Rebuildr!",
            },
          ],
        },
      ]}
    />
  );
};
const saleCompleteEntry = (
  purchase: PurchaseType,
  me: MeType,
  onOpenReview: () => void,
) => {
  const reviewParts: ElementsType = [
    ...reviewButtonPart(purchase, me, onOpenReview),
    {
      type: "body",
      textParts: [
        {
          children: "Tack för att du handlade med Rebuildr!",
        },
      ],
    },
  ];
  return (
    <ProgressEntry
      title="Du har fått betalt"
      elements={[
        {
          type: "body",
          textParts: [
            {
              children: dateToString(purchase.approvedAt),
            },
          ],
        },
        {
          type: "body",
          textParts: [
            {
              children:
                "Pengarna har betalats ut till ditt valda utbetalningskonto.",
            },
          ],
        },
        ...(purchase.reviews.some((r) => r.reviewerId === me.id)
          ? []
          : reviewParts),
      ]}
    />
  );
};

const reportResolvedEntry = (
  purchase: PurchaseType,
  me: MeType,
  resolution: ReportPurchaseResolutionEnum,
  onOpenReview: () => void,
) => {
  let decision = "";
  const buyerIsMe = purchase.buyer.id === me.id;
  if (resolution === ReportPurchaseResolutionEnum.Refund) {
    decision = buyerIsMe
      ? "Pengarna återbetalas till dig"
      : "Pengarna återbetalas till köparen";
  }
  if (resolution === ReportPurchaseResolutionEnum.Proceed) {
    decision = buyerIsMe
      ? "Utbetalningen går vidare till säljaren"
      : "Utbetalningen går vidare till dig";
  }
  return (
    <ProgressEntry
      title="Kundsupport har avslutat ärendet"
      elements={[
        {
          type: "body",
          textParts: [
            {
              children:
                "Vi har granskat ärendet och fattat ett beslut baserat på informationen som skickats in.",
            },
          ],
        },
        {
          type: "body",
          textParts: [
            {
              children: `Beslut: ${decision}.`,
            },
          ],
        },
        {
          type: "body",
          textParts: [
            {
              children:
                "Har du frågor eller funderingar? Vänligen kontakta kundtjänst.",
            },
          ],
        },
        ...reviewButtonPart(purchase, me, onOpenReview),
      ]}
    />
  );
};
//--------------------------------------------------------------------

//--------------------------- ELEMENTS PARTS --------------------------
const reviewButtonPart = (
  purchase: PurchaseType,
  me: MeType,
  onOpenReview: () => void,
): ElementsType => {
  if (purchase.reviews.some((r) => r.reviewerId === me.id)) {
    return [];
  }
  return [
    {
      type: "button",
      buttonProps: {
        label: "Lämna ett omdöme",
        onPress: () => {
          onOpenReview();
        },
      },
    },
  ];
};
const reviewDuringReportParts = (
  purchase: PurchaseType,
  me: MeType,
  onOpenReview: () => void,
) => {
  if (purchase.reviews.some((r) => r.reviewerId === me.id)) {
    return [];
  }
  const reviewParts: ElementsType = [
    {
      type: "body",
      textParts: [
        {
          children: "Vill du lämna ett omdöme redan nu?",
        },
        {
          children: "\n",
        },
        {
          children:
            "Du kan recensera din upplevelse, även om ärendet fortfarande pågår.",
        },
      ],
    },
    ...reviewButtonPart(purchase, me, onOpenReview),
  ];
  return reviewParts;
};
//----------------------------------------------------------

type ProgressEntryProps = {
  disabled?: boolean;
  title: string;
  elements: (
    | {
        type: "body";
        textParts: ComponentProps<typeof Body>[];
      }
    | {
        type: "button";
        buttonProps: ComponentProps<typeof Button>;
      }
  )[];
};

const ProgressEntry = ({ title, elements, disabled }: ProgressEntryProps) => {
  const color = disabled ? "disabled" : "primaryDark";
  return (
    <View style={{ flex: 1 }}>
      <Label size="large" color={color}>
        {title}
      </Label>
      <View style={{ gap: 16, alignItems: "flex-start" }}>
        {elements.map((element, i) => {
          if (element.type === "body") {
            return (
              <Body size="small" key={i} color={color}>
                {element.textParts.map((part, j) => (
                  <Body size="small" key={j} color={color} {...part}>
                    {part.children}
                  </Body>
                ))}
              </Body>
            );
          }
          if (element.type === "button") {
            return <Button {...element.buttonProps} key={i} />;
          }
        })}
      </View>
    </View>
  );
};
