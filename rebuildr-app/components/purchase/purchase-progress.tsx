import {
  PurchaseReceiptQuery,
  TransportationEnum,
  PurchaseStatusEnum,
  ApprovePurchaseMutation,
  ApprovePurchaseMutationVariables,
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
  return dayjs(date).add(1, "day").format("D MMMM kl. hh:mm");
};
type PurchaseType = PurchaseReceiptQuery["purchase"];
type MeType = PurchaseReceiptQuery["me"];

type PurchaseProgressProps = {
  purchaseData: PurchaseReceiptQuery;
  onAbortPurchase: () => void;
};

export const PurchaseProgress = ({
  purchaseData,
  onAbortPurchase,
}: PurchaseProgressProps) => {
  const purchase = purchaseData.purchase;
  const me = purchaseData.me;
  const isBuyer = me.id === purchase.buyer.id;

  const [approvePurchase, { loading: approvePurchaseLoading }] = useMutation<
    ApprovePurchaseMutation,
    ApprovePurchaseMutationVariables
  >(APPROVE_PURCHASE, { variables: { input: { purchaseId: purchase.id } } });

  if (purchase.transportationMethod === TransportationEnum.Shipping) {
    if (isBuyer) {
      switch (purchase.status) {
        case PurchaseStatusEnum.PaymentAccepted:
        case PurchaseStatusEnum.PaymentSent:
        case PurchaseStatusEnum.ShipmentBooked:
        case PurchaseStatusEnum.ShipmentDroppedOff:
        case PurchaseStatusEnum.ShippingStarted:
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
                buyerApproveEntry(approvePurchase, approvePurchaseLoading),
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
                purchaseCompleteEntry(purchase),
              ]}
              current={4}
            />
          );
        case PurchaseStatusEnum.Paused:
          return (
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
                    {
                      type: "body",
                      textParts: [
                        {
                          children:
                            "Vill du lämna ett omdöme redan nu?Du kan recensera din upplevelse, även om ärendet fortfarande pågår.",
                        },
                      ],
                    },
                    {
                      type: "button",
                      buttonProps: {
                        label: "Lämna ett omdöme",
                        onPress: () => {
                          //TODO: navigate to review screen
                        },
                      },
                    },
                  ]}
                />,
              ]}
              isProblem
              current={4}
            />
          );
      }
    }

    //seller
    switch (purchase.status) {
      case PurchaseStatusEnum.PaymentAccepted:
      case PurchaseStatusEnum.PaymentSent:
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
                      onPress: () => {
                        router.navigate({
                          pathname: "/account/sales/shipping-code",
                          params: { purchaseId: purchase.id },
                        });
                      },
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
                          "Pengarna har betalats ut till ditt valda utbetalningskonto",
                      },
                    ],
                  },
                  {
                    type: "button",
                    buttonProps: {
                      label: "Lämna ett omdöme",
                      onPress: () => {
                        //TODO: link to review screen
                      },
                    },
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children: "Tack för att du handlade med Rebuildr!",
                      },
                    ],
                  },
                ]}
              />,
            ]}
            current={4}
          />
        );
      case PurchaseStatusEnum.Paused:
        return (
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
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Vill du lämna ett omdöme redan nu?Du kan recensera din upplevelse, även om ärendet fortfarande pågår.",
                      },
                    ],
                  },
                  {
                    type: "button",
                    buttonProps: {
                      label: "Lämna ett omdöme",
                      onPress: () => {
                        //TODO: link to review screen
                      },
                    },
                  },
                ]}
              />,
            ]}
          />
        );
    }
  }
  if (
    purchase.transportationMethod === TransportationEnum.Delivery ||
    purchase.transportationMethod === TransportationEnum.Pickup
  ) {
    if (isBuyer) {
      switch (purchase.status) {
        case PurchaseStatusEnum.PaymentAccepted:
        case PurchaseStatusEnum.PaymentSent:
          if (purchase.sellerRespondedAt) {
            return (
              <ProgressIndicator
                steps={[
                  payedInitialEntry(purchase, me),
                  <ProgressEntry
                    title={`Åk och hämta senast ${dateToString(dateForwardAWeek(purchase.sellerRespondedAt))}`}
                    elements={[
                      {
                        type: "body",
                        textParts: [
                          {
                            children: `Hämta din vara senast ${dateToString(dateForwardAWeek(purchase.sellerRespondedAt))}, annars avbryts köpet och du får tillbaka dina pengar.`,
                          },
                        ],
                      },
                      {
                        type: "body",
                        textParts: [
                          { children: "Ångrat dig? Du kan fortfarande " },
                          {
                            children: "avbrytat köpet",
                            onPress: onAbortPurchase,
                          },
                          { children: "." },
                        ],
                      },
                    ]}
                  />,
                  <ProgressEntry
                    title="Säljaren får betalt"
                    elements={[
                      {
                        type: "body",
                        textParts: [
                          {
                            children:
                              "Säljaren bekräftar när du har hämtat din vara. Då har du 48 timmar på dig att se så varan stämmer överens med annonsen innan pengarna betalas ut till säljaren.",
                          },
                        ],
                      },
                    ]}
                  />,
                ]}
                current={2}
              />
            );
          }
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                <ProgressEntry
                  title="Dags att planera avhämtning"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children:
                            "När säljaren återkopplat kan ni bestämma tid och plats för avhämtning. Vill du ändå ta första steget?",
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
                          children:
                            "Om säljaren inte svarar inom 24 timmar betalas dina pengar tillbaka automatiskt.",
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
                            "Säljaren bekräftar när du har hämtat din vara. ",
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
              ]}
              current={1}
            />
          );
        case PurchaseStatusEnum.Delivered:
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                <ProgressEntry
                  title="Avhämtning bekräftad"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: `Säljaren bekräftade att varan överlämnades den ${dayjs(purchase.deliveredAt).format("D MMMM, kl hh:mm")}.`,
                        },
                      ],
                    },
                  ]}
                />,
                buyerApproveEntry(approvePurchase, approvePurchaseLoading),
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
                  title="Avhämtning bekräftad"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: `Säljaren bekräftade att varan överlämnades den ${dayjs(purchase.deliveredAt).format("D MMMM, kl hh:mm")}.`,
                        },
                      ],
                    },
                  ]}
                />,
                purchaseCompleteEntry(purchase),
              ]}
              current={3}
            />
          );
        case PurchaseStatusEnum.Paused:
          return (
            <ProgressIndicator
              steps={[
                payedInitialEntry(purchase, me),
                <ProgressEntry
                  title="Avhämtning bekräftad"
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: `Säljaren bekräftade att varan överlämnades den ${dayjs(purchase.deliveredAt).format("D MMMM, kl hh:mm")}`,
                        },
                      ],
                    },
                  ]}
                />,
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
                    {
                      type: "button",
                      buttonProps: {
                        label: "Lämna ett omdöme",
                        onPress: () => {
                          //TODO: navigate to review screen
                        },
                      },
                    },
                  ]}
                />,
              ]}
              isProblem
              current={3}
            />
          );
        case PurchaseStatusEnum.FinishedFailed:
          if (
            purchase.isRefunded &&
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
                      {
                        type: "body",
                        textParts: [
                          {
                            children: "Säljaren har valt att avbryta köpet.",
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
          if (
            purchase.isRefunded &&
            purchase.abortedById === purchase.buyer.id
          ) {
            return (
              <ProgressIndicator
                steps={[
                  soldInitialEntry(purchase),
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
    switch (purchase.status) {
      case PurchaseStatusEnum.PaymentAccepted:
      case PurchaseStatusEnum.PaymentSent:
        if (purchase.sellerRespondedAt) {
          return (
            <ProgressIndicator
              steps={[
                soldInitialEntry(purchase),
                <ProgressEntry
                  title={`Köparen hämtar senast ${dayjs(dateForwardAWeek(purchase.sellerRespondedAt)).format("D MMMM")}`}
                  elements={[
                    {
                      type: "body",
                      textParts: [
                        {
                          children: "Ångrat dig? Du kan fortfarande ",
                        },
                        {
                          onPress: onAbortPurchase,
                          children: "avbryta köpet",
                        },
                        { children: "." },
                      ],
                    },
                  ]}
                />,
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
                          //TODO: mark as delivered
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
              ]}
              current={2}
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
                        children:
                          "Skriv till köparen och bestäm tid och plats för avhämtning.",
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
                        children:
                          "Om du inte svarar i tid avbryts köpet automatiskt och köparen får tillbaka sina pengar",
                      },
                    ],
                  },
                ]}
              />,
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
              deliveryConfirmedEntry(purchase),
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
                  {
                    type: "button",
                    buttonProps: {
                      label: "Lämna ett omdöme",
                      onPress: () => {
                        //TODO: link to review screen
                      },
                    },
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children: "Tack för att du handlade med Rebuildr!",
                      },
                    ],
                  },
                ]}
              />,
            ]}
            current={3}
          />
        );
      case PurchaseStatusEnum.Paused:
        return (
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
                          "Köparen har meddelat att något inte stämmer med varan. Utbetalningen är därför pausad under tiden ärendet pågår.",
                      },
                    ],
                  },
                  {
                    type: "body",
                    textParts: [
                      {
                        children:
                          "Vill du lämna ett omdöme redan nu? Du kan recensera din upplevelse, även om ärendet fortfarande pågår.",
                      },
                    ],
                  },
                  {
                    type: "button",
                    buttonProps: {
                      label: "Lämna ett omdöme",
                      onPress: () => {
                        //TODO: link to review screen
                      },
                    },
                  },
                ]}
              />,
            ]}
            isProblem
            current={3}
          />
        );
      case PurchaseStatusEnum.FinishedFailed:
        if (purchase.isRefunded && purchase.abortedById !== purchase.buyer.id) {
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
        if (purchase.isRefunded && purchase.abortedById === purchase.buyer.id) {
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
                          children: "Köparen har valt att avbryta köpet",
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
    title="Du har sålt en vara"
    elements={[
      {
        type: "body",
        textParts: [{ children: dateToString(purchase.paymentAcceptedAt) }],
      },
    ]}
  />
);
const payedInitialEntry = (purchase: PurchaseType, me: MeType) => (
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
            children: `Du får en bekräftelse från Rocker till ${me.email}`,
          },
        ],
      },
    ]}
  />
);
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
            children: `Du bekräftade att varan överlämnades den ${dayjs(purchase.deliveredAt).format("D MMMM, kl hh:mm")}.`,
          },
        ],
      },
    ]}
  />
);
const buyerApproveEntry = (onApprove: () => void, approveLoading: boolean) => (
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
          },
        ],
      },
    ]}
  />
);
const purchaseCompleteEntry = (purchase: PurchaseType) => (
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
      {
        type: "button",
        buttonProps: {
          label: "Lämna ett omdöme",
          onPress: () => {
            //TODO: navigate to review screen
          },
        },
      },
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
