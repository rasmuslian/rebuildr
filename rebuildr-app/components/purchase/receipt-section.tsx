import {
  ReceiptSectionBaseQuery,
  ReceiptSectionBaseQueryVariables,
  ReceiptSectionBuyerPaymentQuery,
  ReceiptSectionBuyerPaymentQueryVariables,
  ReceiptSectionSellerPaymentQuery,
  ReceiptSectionSellerPaymentQueryVariables,
  TransportationEnum,
  UserType,
} from "@/gql/graphql";
import { formatCO2 } from "@/utils/formattings";
import { gql, useQuery } from "@apollo/client";
import { Divider } from "@components/dividers/divider";
import { ExplainCO2WhyTwoNumbersSheet } from "@components/explanation-information-sheets/explain-co2-why-two-numbers-sheet";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { conditions } from "@constants/conditions";
import { paymentMethodStrings } from "@constants/paymentMethods";
import { quantities } from "@constants/quantities";
import { shippingProviderStrings } from "@constants/shippingProviders";
import { borderRadius } from "@constants/sizes";
import { usePrintReceipt } from "@hooks/purchase/use-print-receipt";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import dayjs from "dayjs";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";

export const RECEIPT_HOST_ID = "receipt-print-host";

const RECEIPT_SECTION_BASE = gql`
  query ReceiptSectionBase($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      purchasedQuantity
      createdAt
      paymentAcceptedAt
      transportationMethod
      shippingPrice {
        id
        price
        maxWeight
        provider
      }
      product {
        id
        title
        primaryQuantity
        primaryUnit
        price
        condition
        deliveryPrice
        co2SavingSeller
        co2SavingBuyer
        seller {
          id
          type
          username
          organizationNumber
        }
      }
      buyer {
        id
        username
      }
    }
    me {
      id
      email
      type
    }
  }
`;

const RECEIPT_SECTION_BUYER_PAYMENT = gql`
  query ReceiptSectionBuyerPayment($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      paymentMethod
    }
  }
`;

const RECEIPT_SECTION_SELLER_PAYMENT = gql`
  query ReceiptSectionSellerPayment($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      boughtForFree
      payoutBankLast4
    }
  }
`;

type Props = {
  purchaseId: string;
};

export const ReceiptSection = ({ purchaseId }: Props) => {
  const colors = useThemeColor();
  const { print } = usePrintReceipt();

  const variables = { input: { id: purchaseId } };

  const { data: baseData } = useQuery<
    ReceiptSectionBaseQuery,
    ReceiptSectionBaseQueryVariables
  >(RECEIPT_SECTION_BASE, { variables });

  const buyerIsMe =
    baseData != null && baseData.me.id === baseData.purchase.buyer.id;

  const { data: buyerPaymentData } = useQuery<
    ReceiptSectionBuyerPaymentQuery,
    ReceiptSectionBuyerPaymentQueryVariables
  >(RECEIPT_SECTION_BUYER_PAYMENT, {
    variables,
    skip: !baseData || !buyerIsMe,
  });

  const { data: sellerPaymentData } = useQuery<
    ReceiptSectionSellerPaymentQuery,
    ReceiptSectionSellerPaymentQueryVariables
  >(RECEIPT_SECTION_SELLER_PAYMENT, {
    variables,
    skip: !baseData || buyerIsMe,
  });

  if (!baseData) return <LoadingSpinner />;
  if (buyerIsMe && !buyerPaymentData) return <LoadingSpinner />;
  if (!buyerIsMe && !sellerPaymentData) return <LoadingSpinner />;

  const purchase = baseData.purchase;
  const product = purchase.product;
  const me = baseData.me;

  const purchaseQuantityFactor = purchase.purchasedQuantity ?? 1;

  const quantityPrice = product.price * purchaseQuantityFactor;
  let totalPrice = quantityPrice;
  if (purchase.transportationMethod === TransportationEnum.Delivery) {
    totalPrice += product.deliveryPrice ?? 0;
  }
  if (purchase.transportationMethod === TransportationEnum.Shipping) {
    totalPrice += purchase.shippingPrice?.price ?? 0;
  }

  const quantityCO2SavingBuyer =
    (product.co2SavingBuyer ?? 0) * purchaseQuantityFactor;
  const quantityCO2SavingSeller =
    (product.co2SavingSeller ?? 0) * purchaseQuantityFactor;

  const payedAt = purchase.paymentAcceptedAt ?? purchase.createdAt;

  return (
    <View nativeID={RECEIPT_HOST_ID}>
      <View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View
            style={{
              backgroundColor: colors.navigation.focused,
              borderRadius: borderRadius.xSmall,
              padding: 12,
            }}
          >
            <Icon icon="receipt" />
          </View>
          <View style={{ justifyContent: "space-between", flex: 1 }}>
            <Title size="large">Transaktionskvitto</Title>
            <Body size="small">
              Verifikat för {buyerIsMe ? "ditt köp" : "din försäljning"}
            </Body>
          </View>
          {Platform.OS === "web" && (
            <Pressable nativeID="receipt-print-button" onPress={print}>
              <Icon icon="upload" />
            </Pressable>
          )}
        </View>
        <Body size="small" color="secondary" style={{ marginTop: 10 }}>
          {dayjs(payedAt).format("D MMMM, YYYY")}
        </Body>
      </View>
      {/**General information */}
      <View
        style={{
          borderColor: colors.dividers.neutral,
          borderRadius: borderRadius.medium,
          borderWidth: 1,
          padding: 16,
          paddingBottom: 24,
          marginTop: 16,
        }}
      >
        <Title size="medium">Hyvlade träpaneler i långa längder</Title>
        <Body
          color="secondary"
          size="small"
          numberOfLines={1}
          style={{ marginTop: 8 }}
        >
          {purchase.purchasedQuantity ?? product.primaryQuantity}{" "}
          {product.primaryUnit ? quantities[product.primaryUnit].plural : ""} •{" "}
          {conditions[product.condition].name}
        </Body>
        <Divider style={{ marginVertical: 16 }} />
        <View style={{ flexDirection: "row", gap: 36 }}>
          <View style={{ justifyContent: "space-between" }}>
            <Body size="small" color="secondary">
              Säljare
            </Body>
            <Body size="small" color="secondary">
              Köpare
            </Body>
          </View>
          <View style={{ gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Label size="medium">{product.seller.username}</Label>
              {product.seller.type !== UserType.Business &&
                !!product.seller.organizationNumber && (
                  <Body size="small" color="secondary">
                    {product.seller.organizationNumber}
                  </Body>
                )}
            </View>
            <Label size="medium">{purchase.buyer.username}</Label>
          </View>
        </View>
      </View>
      {/** Payment Summaries */}
      {buyerIsMe && buyerPaymentData && (
        <BuyerPaymentSummary
          quantityPrice={quantityPrice}
          totalPrice={totalPrice}
          purchase={purchase}
          product={product}
          paymentMethod={buyerPaymentData.purchase.paymentMethod}
        />
      )}
      {!buyerIsMe && me.type === UserType.Personal && sellerPaymentData && (
        <SellerPaymentSummary
          quantityPrice={quantityPrice}
          purchase={purchase}
          product={product}
          boughtForFree={sellerPaymentData.purchase.boughtForFree}
          payoutBankLast4={sellerPaymentData.purchase.payoutBankLast4}
        />
      )}
      {!buyerIsMe && me.type === UserType.Business && sellerPaymentData && (
        <BusinessPaymentSummary
          quantityPrice={quantityPrice}
          purchase={purchase}
          product={product}
          payoutBankLast4={sellerPaymentData.purchase.payoutBankLast4}
        />
      )}
      {/** CO2 summaries */}
      {buyerIsMe && (
        <BuyerCO2Summary
          quantityCO2SavingBuyer={quantityCO2SavingBuyer}
          quantityCO2SavingSeller={quantityCO2SavingSeller}
        />
      )}
      {!buyerIsMe && (
        <SellerCO2Summary
          quantityCO2SavingBuyer={quantityCO2SavingBuyer}
          quantityCO2SavingSeller={quantityCO2SavingSeller}
        />
      )}
    </View>
  );
};

type BuyerPaymentSummaryProps = {
  quantityPrice: number;
  purchase: ReceiptSectionBaseQuery["purchase"];
  product: ReceiptSectionBaseQuery["purchase"]["product"];
  totalPrice: number;
  paymentMethod: ReceiptSectionBuyerPaymentQuery["purchase"]["paymentMethod"];
};

const BuyerPaymentSummary = ({
  quantityPrice,
  purchase,
  product,
  totalPrice,
  paymentMethod,
}: BuyerPaymentSummaryProps) => {
  return (
    <View style={{ gap: 16, marginTop: 24 }}>
      <Row left="Pris för vara" right={`${quantityPrice} kr`} />
      {purchase.shippingPrice &&
        purchase.transportationMethod === TransportationEnum.Shipping && (
          <Row
            left={`Frakt, ${shippingProviderStrings[purchase.shippingPrice.provider]} (max ${purchase.shippingPrice.maxWeight} kg)`}
            right={`${purchase.shippingPrice.price} kr`}
          />
        )}
      {purchase.transportationMethod === TransportationEnum.Pickup && (
        <Row left="Avhämtning" right="0 kr" />
      )}
      {purchase.transportationMethod === TransportationEnum.Delivery && (
        <Row left="Hemtransport" right={`${product.deliveryPrice ?? 0} kr`} />
      )}
      <Row left="Totalt" right={`${totalPrice} kr`} isBold />
      {paymentMethod && (
        <Row left="Betalsätt:" right={paymentMethodStrings[paymentMethod]} />
      )}
    </View>
  );
};
type SellerPaymentSummaryProps = {
  quantityPrice: number;
  purchase: ReceiptSectionBaseQuery["purchase"];
  product: ReceiptSectionBaseQuery["purchase"]["product"];
  boughtForFree: ReceiptSectionSellerPaymentQuery["purchase"]["boughtForFree"];
  payoutBankLast4: ReceiptSectionSellerPaymentQuery["purchase"]["payoutBankLast4"];
};

const SellerPaymentSummary = ({
  quantityPrice,
  purchase,
  product,
  boughtForFree,
  payoutBankLast4,
}: SellerPaymentSummaryProps) => {
  const provision = Math.round(quantityPrice * 0.1);
  const earnings = quantityPrice - provision + (product.deliveryPrice ?? 0);
  return (
    <View style={{ gap: 16, marginTop: 24 }}>
      <Row left="Ditt försäljningspris" right={`${quantityPrice} kr`} />
      {!boughtForFree && (
        <Row left="Provision till RebuildR (10%)" right={`-${provision} kr`} />
      )}
      {purchase.transportationMethod === TransportationEnum.Shipping &&
        purchase.shippingPrice && (
          <Row
            left={`Frakt, ${shippingProviderStrings[purchase.shippingPrice.provider]} (max ${purchase.shippingPrice.maxWeight} kg)`}
            right="Betalas av köparen"
          />
        )}
      {purchase.transportationMethod === TransportationEnum.Pickup && (
        <Row left="Avhämtning" right="0 kr" />
      )}
      {purchase.transportationMethod === TransportationEnum.Delivery && (
        <Row left="Hemtransport" right={`${product.deliveryPrice ?? 0} kr`} />
      )}

      <Row left="Du får utbetalt" right={`${earnings} kr`} isBold />
      <Row
        left="Utbetalning till konto:"
        right={
          purchase.paymentAcceptedAt
            ? `****${payoutBankLast4}`
            : "Konto ej valt"
        }
      />
    </View>
  );
};
type BusinessPaymentSummaryProps = {
  quantityPrice: number;
  purchase: ReceiptSectionBaseQuery["purchase"];
  product: ReceiptSectionBaseQuery["purchase"]["product"];
  payoutBankLast4: ReceiptSectionSellerPaymentQuery["purchase"]["payoutBankLast4"];
};

const BusinessPaymentSummary = ({
  quantityPrice,
  purchase,
  product,
  payoutBankLast4,
}: BusinessPaymentSummaryProps) => {
  const provision = Math.round(quantityPrice * 0.1);
  const earnings = quantityPrice - provision + (product.deliveryPrice ?? 0);
  const vat = Math.round(quantityPrice * 0.25);
  return (
    <View style={{ gap: 16, marginTop: 24 }}>
      <Row
        left="Ditt försäljningspris (inkl. moms)"
        right={`${quantityPrice} kr`}
      />
      <Row left="Varav moms (25%)" right={`${vat} kr`} />
      <Row left="Provision till RebuildR (10%)" right={`-${provision} kr`} />
      {purchase.transportationMethod === TransportationEnum.Shipping &&
        purchase.shippingPrice && (
          <Row
            left={`Frakt, ${shippingProviderStrings[purchase.shippingPrice.provider]} (max ${purchase.shippingPrice.maxWeight} kg)`}
            right="Betalas av köparen"
          />
        )}
      {purchase.transportationMethod === TransportationEnum.Pickup && (
        <Row left="Avhämtning" right="0 kr" />
      )}
      {purchase.transportationMethod === TransportationEnum.Delivery && (
        <Row left="Hemtransport" right={`${product.deliveryPrice ?? 0} kr`} />
      )}
      <Row left="Du får utbetalt" right={`${earnings} kr`} isBold />
      <Row
        left="Utbetalning till konto:"
        right={
          purchase.paymentAcceptedAt
            ? `****${payoutBankLast4}`
            : "Konto ej valt"
        }
      />
      <Body size="small" color="secondary">
        Du som säljer ansvarar för att redovisa momsen på försäljningspriset.
      </Body>
    </View>
  );
};

type RowProps = {
  left: string;
  right: string;
  isBold?: boolean;
};
const Row = ({ left, right, isBold }: RowProps) => {
  const colors = useThemeColor();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        isBold && {
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: colors.background.secondary,
          borderRadius: borderRadius.xSmall,
        },
      ]}
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

type BuyerCO2SummaryProps = {
  quantityCO2SavingBuyer: number;
  quantityCO2SavingSeller: number;
};

const BuyerCO2Summary = ({
  quantityCO2SavingBuyer,
  quantityCO2SavingSeller,
}: BuyerCO2SummaryProps) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const colors = useThemeColor();
  return (
    <View
      style={{
        backgroundColor: colors.background.primary,
        borderColor: colors.dividers.primary,
        borderRadius: borderRadius.medium,
        borderWidth: 1,
        padding: 16,
        paddingBottom: 24,
        marginTop: 24,
      }}
    >
      <View style={{ gap: 2 }}>
        <Title size="medium">Klimatkvitto</Title>
        <Body size="small" color="secondary">
          Ditt klimatnytta av detta köp
        </Body>
      </View>
      <View
        style={{
          backgroundColor: colors.text.primaryLight,
          borderRadius: borderRadius.medium,
          padding: 16,
          gap: 6,
          marginTop: 12,
        }}
      >
        <Headline
          size="large"
          style={{ color: colors.logo.vector, marginTop: 6, marginBottom: 8 }}
        >
          {formatCO2(quantityCO2SavingBuyer)} kg CO₂e
        </Headline>
        <Label size="large">Undvikt nyproduktion</Label>
      </View>
      <View
        style={{
          backgroundColor: primitives.primary200,
          padding: 16,
          borderRadius: borderRadius.medium,
          marginTop: 16,
        }}
      >
        <Body size="small" style={{ color: colors.logo.vector }}>
          Säljaren undvek dessutom {quantityCO2SavingSeller} kg CO2e från
          deponi. Redovisas hos motparten - undviker dubbelräkning.
        </Body>
      </View>
      <Divider style={{ marginVertical: 16 }} color={colors.dividers.primary} />
      <Label size="medium" color="secondary">
        Transaktionens totala klimatnytta
      </Label>
      <Headline
        size="small"
        style={{ color: colors.logo.vector, marginTop: 10, marginBottom: 24 }}
      >
        {formatCO2(quantityCO2SavingSeller + quantityCO2SavingBuyer)} kg CO₂e
      </Headline>
      <Body
        nativeID="receipt-co2-read-more"
        size="small"
        onPress={() => setShowExplanation(true)}
      >
        Läs mer hur vi räknar
      </Body>
      <ExplainCO2WhyTwoNumbersSheet
        show={showExplanation}
        onDismiss={() => setShowExplanation(false)}
      />
    </View>
  );
};
type SellerCO2SummaryProps = {
  quantityCO2SavingBuyer: number;
  quantityCO2SavingSeller: number;
};

const SellerCO2Summary = ({
  quantityCO2SavingBuyer,
  quantityCO2SavingSeller,
}: SellerCO2SummaryProps) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const colors = useThemeColor();
  return (
    <View
      style={{
        backgroundColor: primitives.secondary200,
        borderColor: colors.dividers.secondary,
        borderRadius: borderRadius.medium,
        borderWidth: 1,
        padding: 16,
        paddingBottom: 24,
        marginTop: 24,
      }}
    >
      <View style={{ gap: 2 }}>
        <Title size="medium">Klimatkvitto</Title>
        <Body size="small" color="secondary">
          Ditt klimatnytta av denna försäljning
        </Body>
      </View>
      <View
        style={{
          backgroundColor: colors.text.primaryLight,
          borderRadius: borderRadius.medium,
          padding: 16,
          gap: 6,
          marginTop: 12,
        }}
      >
        <Headline
          size="large"
          style={{ color: colors.logo.vector, marginTop: 6, marginBottom: 8 }}
        >
          {formatCO2(quantityCO2SavingSeller)} kg CO₂e
        </Headline>
        <Label size="large">Undvikt deponi</Label>
      </View>
      <View
        style={{
          backgroundColor: primitives.primary200,
          padding: 16,
          borderRadius: borderRadius.medium,
          marginTop: 16,
        }}
      >
        <Body size="small" style={{ color: colors.logo.vector }}>
          Köparen undvek dessutom {quantityCO2SavingBuyer} kg CO2e från
          nyproduktion. Redovisas hos motparten - undviker dubbelräkning.
        </Body>
      </View>
      <Divider style={{ marginVertical: 16 }} color={colors.dividers.primary} />
      <Label size="medium" color="secondary">
        Transaktionens totala klimatnytta
      </Label>
      <Headline
        size="small"
        style={{ color: colors.logo.vector, marginTop: 10, marginBottom: 24 }}
      >
        {formatCO2(quantityCO2SavingSeller + quantityCO2SavingBuyer)} kg CO₂e
      </Headline>
      <Body
        nativeID="receipt-co2-read-more"
        size="small"
        onPress={() => setShowExplanation(true)}
      >
        Läs mer hur vi räknar
      </Body>
      <ExplainCO2WhyTwoNumbersSheet
        show={showExplanation}
        onDismiss={() => setShowExplanation(false)}
      />
    </View>
  );
};
