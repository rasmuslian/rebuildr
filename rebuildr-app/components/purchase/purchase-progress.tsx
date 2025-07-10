import {
  PurchaseReceiptQuery,
  TransportationEnum,
  PurchaseStatusEnum,
} from "@/gql/graphql";
import { Button } from "@components/buttons/button";
import { ProgressIndicator } from "@components/progress-indicator/progress-indicator";
import { Body, Label } from "@components/typography/text";
import dayjs from "dayjs";
import { router } from "expo-router";
import React, { ComponentProps } from "react";
import { View } from "react-native";

type PurchaseProgressProps = {
  purchaseData: PurchaseReceiptQuery;
};

export const PurchaseProgress = ({ purchaseData }: PurchaseProgressProps) => {
  const purchase = purchaseData.purchase;
  const me = purchaseData.me;
  const isBuyer = me.id === purchase.buyer.id;
  const dateToString = (
    date?: Date,
    type: "simple" | "default" = "default",
  ) => {
    if (!date) {
      return "";
    }
    return dayjs(date).format(type === "simple" ? "D MMMM" : "DD/MM");
  };
  const dateForwardAWeek = (date: Date) => {
    return dayjs(date).add(7, "days").toDate();
  };
  const dateForwardADay = (date: Date) => {
    return dayjs(date).add(1, "day").format("D MMMM kl. hh:mm");
  };

  if (purchase.transportationMethod === TransportationEnum.Shipping) {
    if (isBuyer) {
      if (
        purchase.status === PurchaseStatusEnum.PaymentAccepted &&
        purchase.paymentAcceptedAt
      ) {
        return (
          <ProgressIndicator
            steps={[
              <ProgressEntry
                title="Du har betalat"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      { children: dateToString(purchase.paymentAcceptedAt) },
                    ],
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
              />,
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
                        isLink: true,
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
      }
      //SHIPPING_DELIVERED
      //DELIVERED
      //APPROVED
    }

    //seller
    if (
      purchase.status === PurchaseStatusEnum.PaymentAccepted &&
      purchase.paymentAcceptedAt
    ) {
      return (
        <ProgressIndicator
          steps={[
            <ProgressEntry
              title="Du har sålt en vara"
              elements={[
                {
                  type: "body",
                  textParts: [
                    { children: dateToString(purchase.paymentAcceptedAt) },
                  ],
                },
              ]}
            />,
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
                      //TODO: show QR-code
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
                      isLink: true,
                      children: "avbryta innan paketet skickas.",
                    },
                  ],
                },
              ]}
            />,
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
    }
    //SHIPMENT_DROPPED_OFF
    //DELIVERED
    //FINISHED_SUCCESS
  }
  //Delivery
  if (purchase.transportationMethod === TransportationEnum.Delivery) {
    if (isBuyer) {
      if (
        purchase.status === PurchaseStatusEnum.PaymentAccepted &&
        purchase.paymentAcceptedAt
      ) {
        return (
          <ProgressIndicator
            steps={[
              <ProgressEntry
                title="Du har betalat"
                elements={[
                  {
                    type: "body",
                    textParts: [
                      { children: dateToString(purchase.paymentAcceptedAt) },
                    ],
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
              />,
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
                          "Säljaren bekräftar när du har hämtat din vara.Då har du 48 timmar på dig att se så varan stämmer överens med annonsen innan pengarna betalas ut till säljaren.",
                      },
                    ],
                  },
                ]}
              />,
            ]}
            current={1}
          />
        );
      }

      //PAYMENT_ACCEPTED and response from seller
      //DELIVERED
      //APPROVED
    }
    //seller
    if (
      purchase.status === PurchaseStatusEnum.PaymentAccepted &&
      purchase.paymentAcceptedAt
    ) {
      return (
        <ProgressIndicator
          steps={[
            <ProgressEntry
              title="Du har sålt en vara"
              elements={[
                {
                  type: "body",
                  textParts: [
                    { children: dateToString(purchase.paymentAcceptedAt) },
                  ],
                },
              ]}
            />,
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
    }
    //PAYMENT_ACCEPTED and response from seller
    //DELIVERED
    //FINISHED_SUCCESS
  }
  //Pickup

  return null;
};

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
      <View style={{ gap: 16 }}>
        {elements.map((element, i) => {
          if (element.type === "body") {
            return (
              <Body size="medium" key={i} color={color}>
                {element.textParts.map((part, j) => (
                  <Body size="medium" key={j} color={color} {...part}>
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
