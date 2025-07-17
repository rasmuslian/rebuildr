import {
  PaymentMethod,
  ShippingPrice,
  TransportationEnum,
  UserType,
} from "@/gql/graphql";
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
  userType: UserType;
  role: "seller" | "buyer";
  payedAt: Date;
} & SellerReceiptCardProps &
  BuyerReceiptCardProps &
  BusinessReceiptCardProps;

export const ReceiptCard = ({ userType, role, payedAt, ...rest }: Props) => {
  const colors = useThemeColor();

  return (
    <View
      style={{
        borderRadius: borderRadius.medium,
        gap: 16,
        padding: 16,
        backgroundColor: colors.buttons.tonal.enabled,
      }}
    >
      {role === "buyer" && <BuyerReceiptCard {...rest} />}
      {role === "seller" && userType === UserType.Personal && (
        <SellerReceiptCard {...rest} />
      )}
      {role === "seller" && userType === UserType.Business && (
        <BusinessReceiptCard {...rest} />
      )}

      <Row left="Datum" right={dayjs(payedAt).format("D MMMM, YYYY")} />
      <Button label="Ladda hem kvitto" onPress={() => {}} />
    </View>
  );
};

type BuyerReceiptCardProps = {
  price: number;
  shippingPrice?: ShippingPrice | null;
  deliveryPrice?: number | null;
  paymentMethod?: PaymentMethod | null;
  transportationMethod: TransportationEnum;
};

const BuyerReceiptCard = ({
  price,
  shippingPrice,
  deliveryPrice,
  paymentMethod,
  transportationMethod,
}: BuyerReceiptCardProps) => {
  let totalPrice = price;
  if (transportationMethod === TransportationEnum.Delivery) {
    totalPrice += deliveryPrice ?? 0;
  }
  if (transportationMethod === TransportationEnum.Shipping) {
    totalPrice += shippingPrice?.price ?? 0;
  }
  return (
    <>
      <Row left="Pris för vara" right={`${price} kr`} />
      {shippingPrice &&
        transportationMethod === TransportationEnum.Shipping && (
          <Row
            left={`Frakt, ${shippingProviderStrings[shippingPrice.provider]} (max ${shippingPrice.maxWeight} kg)`}
            right={`${shippingPrice.price} kr`}
          />
        )}
      {deliveryPrice !== undefined &&
        deliveryPrice !== null &&
        transportationMethod === TransportationEnum.Delivery && (
          <Row left="Avhämtning" right={`${deliveryPrice} kr`} />
        )}
      <Row left="Totalt" right={`${totalPrice} kr`} isBold />
      <Divider />
      {paymentMethod && (
        <Row left="Betalsätt" right={paymentMethodStrings[paymentMethod]} />
      )}
    </>
  );
};
type SellerReceiptCardProps = {
  price: number;
  shippingPrice?: ShippingPrice | null;
  deliveryPrice?: number | null;
  paymentMethod?: PaymentMethod | null;
  transportationMethod: TransportationEnum;
};

const SellerReceiptCard = ({
  price,
  shippingPrice,
  deliveryPrice,
  paymentMethod,
  transportationMethod,
}: SellerReceiptCardProps) => {
  const provision = Math.round(price * 0.1);
  const earnings = price - provision;
  return (
    <>
      <Row left="Ditt försäljningspris" right={`${price} kr`} />
      <Row left="Provision till RebuildR (10%)" right={`-${provision} kr`} />
      <Row left="Du får utbetalt" right={`${earnings} kr`} isBold />
      <Divider />
      {paymentMethod && (
        <Row left="Betalsätt" right={paymentMethodStrings[paymentMethod]} />
      )}
      {transportationMethod === TransportationEnum.Shipping &&
        shippingPrice && (
          <Row
            left={`Frakt, ${shippingProviderStrings[shippingPrice.provider]} (max ${shippingPrice.maxWeight} kg)`}
            right="Betalas av köparen"
          />
        )}
      {deliveryPrice !== undefined &&
        deliveryPrice !== null &&
        transportationMethod === TransportationEnum.Delivery && (
          <Row left="Avhämtning" right={`${deliveryPrice} kr`} />
        )}
    </>
  );
};
type BusinessReceiptCardProps = {
  price: number;
  shippingPrice?: ShippingPrice | null;
  deliveryPrice?: number | null;
  paymentMethod?: PaymentMethod | null;
  transportationMethod: TransportationEnum;
};

const BusinessReceiptCard = ({
  price,
  shippingPrice,
  deliveryPrice,
  paymentMethod,
  transportationMethod,
}: SellerReceiptCardProps) => {
  const provision = Math.round(price * 0.1);
  const earnings = price - provision;
  const vat = Math.round(price * 0.25);
  return (
    <>
      <Row left="Ditt försäljningspris (inkl. moms)" right={`${price} kr`} />
      <Row left="Varav moms (25%)" right={`${vat} kr`} />
      <Row left="Provision till RebuildR (10%)" right={`-${provision} kr`} />
      <Divider />
      <Row left="Du får utbetalt" right={`${earnings} kr`} isBold />
      <Body size="small" color="secondary">
        Du som säljer ansvarar för att redovisa momsen på försäljningspriset.
      </Body>
      <Divider />
      {paymentMethod && (
        <Row left="Betalsätt" right={paymentMethodStrings[paymentMethod]} />
      )}
      {transportationMethod === TransportationEnum.Shipping &&
        shippingPrice && (
          <Row
            left={`Frakt, ${shippingProviderStrings[shippingPrice.provider]} (max ${shippingPrice.maxWeight} kg)`}
            right="Betalas av köparen"
          />
        )}
      {deliveryPrice !== undefined &&
        deliveryPrice !== null &&
        transportationMethod === TransportationEnum.Delivery && (
          <Row left="Avhämtning" right={`${deliveryPrice} kr`} />
        )}
    </>
  );
};

type RowProps = {
  left: string;
  right: string;
  isBold?: boolean;
};
const Row = ({ left, right, isBold }: RowProps) => {
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
          <Label size="large">{left}</Label>
          <Label size="large">{right}</Label>
        </>
      ) : (
        <>
          <Body size="small">{left}</Body>
          <Body size="small">{right}</Body>
        </>
      )}
    </View>
  );
};
