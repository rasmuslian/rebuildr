import {
  PaymentMethod,
  ShippingPrice,
  TransportationEnum,
  UserType,
} from "@/gql/graphql";
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
    </View>
  );
};

type BuyerReceiptCardProps = {
  productPrice: number;
  purchasedQuantity?: number | null;
  shippingPrice?: ShippingPrice | null;
  deliveryPrice?: number | null;
  paymentMethod?: PaymentMethod | null;
  transportationMethod: TransportationEnum;
};

const BuyerReceiptCard = ({
  productPrice,
  purchasedQuantity,
  shippingPrice,
  deliveryPrice,
  paymentMethod,
  transportationMethod,
}: BuyerReceiptCardProps) => {
  const quantityPrice = productPrice * (purchasedQuantity ?? 1);
  let totalPrice = quantityPrice;
  if (transportationMethod === TransportationEnum.Delivery) {
    totalPrice += deliveryPrice ?? 0;
  }
  if (transportationMethod === TransportationEnum.Shipping) {
    totalPrice += shippingPrice?.price ?? 0;
  }
  return (
    <>
      <Row left="Pris för vara" right={`${quantityPrice} kr`} />
      {shippingPrice &&
        transportationMethod === TransportationEnum.Shipping && (
          <Row
            left={`Frakt, ${shippingProviderStrings[shippingPrice.provider]} (max ${shippingPrice.maxWeight} kg)`}
            right={`${shippingPrice.price} kr`}
          />
        )}
      {transportationMethod === TransportationEnum.Pickup && (
        <Row left="Avhämtning" right="0 kr" />
      )}
      {transportationMethod === TransportationEnum.Delivery && (
        <Row left="Hemtransport" right={`${deliveryPrice ?? 0} kr`} />
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
  productPrice: number;
  purchasedQuantity?: number | null;
  shippingPrice?: ShippingPrice | null;
  deliveryPrice?: number | null;
  paymentMethod?: PaymentMethod | null;
  transportationMethod: TransportationEnum;
  boughtForFree: boolean;
};

const SellerReceiptCard = ({
  productPrice,
  purchasedQuantity,
  shippingPrice,
  deliveryPrice,
  paymentMethod,
  transportationMethod,
  boughtForFree,
}: SellerReceiptCardProps) => {
  const quantityPrice = productPrice * (purchasedQuantity ?? 1);
  const provision = Math.round(quantityPrice * 0.1);
  const earnings = quantityPrice - provision;
  return (
    <>
      <Row left="Ditt försäljningspris" right={`${quantityPrice} kr`} />
      {!boughtForFree && (
        <Row left="Provision till RebuildR (10%)" right={`-${provision} kr`} />
      )}
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
      {transportationMethod === TransportationEnum.Pickup && (
        <Row left="Avhämtning" right="0 kr" />
      )}
      {transportationMethod === TransportationEnum.Delivery && (
        <Row left="Hemtransport" right={`${deliveryPrice ?? 0} kr`} />
      )}
    </>
  );
};
type BusinessReceiptCardProps = {
  productPrice: number;
  purchasedQuantity?: number | null;
  shippingPrice?: ShippingPrice | null;
  deliveryPrice?: number | null;
  paymentMethod?: PaymentMethod | null;
  transportationMethod: TransportationEnum;
};

const BusinessReceiptCard = ({
  productPrice,
  purchasedQuantity,
  shippingPrice,
  deliveryPrice,
  paymentMethod,
  transportationMethod,
}: SellerReceiptCardProps) => {
  const quantityPrice = productPrice * (purchasedQuantity ?? 1);
  const provision = Math.round(quantityPrice * 0.1);
  const earnings = quantityPrice - provision;
  const vat = Math.round(quantityPrice * 0.25);
  return (
    <>
      <Row
        left="Ditt försäljningspris (inkl. moms)"
        right={`${quantityPrice} kr`}
      />
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
      {transportationMethod === TransportationEnum.Pickup && (
        <Row left="Avhämtning" right="0 kr" />
      )}
      {transportationMethod === TransportationEnum.Delivery && (
        <Row left="Hemtransport" right={`${deliveryPrice ?? 0} kr`} />
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
