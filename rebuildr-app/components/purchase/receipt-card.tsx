import { PaymentMethod, ShippingPrice } from "@/gql/graphql";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Body, Label } from "@components/typography/text";
import { paymentMethodStrings } from "@constants/paymentMethods";
import { shippingProviderStrings } from "@constants/shippingProviders";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import dayjs from "dayjs";
import { View } from "react-native";

type Props = {
  price: number;
  shippingPrice?: ShippingPrice | null;
  deliveryPrice?: number | null;
  paymentMethod?: PaymentMethod | null;
  payedAt: Date;
};

export const ReceiptCard = ({
  price,
  shippingPrice,
  deliveryPrice,
  paymentMethod,
  payedAt,
}: Props) => {
  const colors = useThemeColor();

  const totalPrice = price + (shippingPrice?.price ?? 0) + (deliveryPrice ?? 0);

  const renderRow = (
    leftText: string,
    rightText: string,
    isBold: boolean = false,
  ) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {isBold ? (
          <>
            <Label size="large">{leftText}</Label>
            <Label size="large">{rightText}</Label>
          </>
        ) : (
          <>
            <Body size="small">{leftText}</Body>
            <Body size="small">{rightText}</Body>
          </>
        )}
      </View>
    );
  };

  return (
    <View
      style={{
        borderRadius: borderRadius.medium,
        gap: 16,
        padding: 16,
        backgroundColor: colors.buttons.tonal.enabled,
      }}
    >
      {renderRow("Pris för vara", `${price} kr`)}
      {shippingPrice &&
        renderRow(
          `Frakt, ${shippingProviderStrings[shippingPrice.provider]} (max ${shippingPrice.maxWeight} kg)`,
          `${shippingPrice.price} kr`,
        )}
      {deliveryPrice !== undefined &&
        deliveryPrice !== null &&
        renderRow("Avhämtning", `${deliveryPrice} kr`)}
      {renderRow("Totalt", `${totalPrice} kr`, true)}
      <Divider />
      {paymentMethod &&
        renderRow("Betalsätt", paymentMethodStrings[paymentMethod])}
      {renderRow("Datum", dayjs(payedAt).format("D MMMM, YYYY"))}
      <Button label="Ladda hem kvitto" onPress={() => {}} />
    </View>
  );
};
