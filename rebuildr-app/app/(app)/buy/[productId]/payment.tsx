import {
  BuyProductCreatePurchaseMutation,
  BuyProductCreatePurchaseMutationVariables,
  BuyProductPaymentQuery,
  BuyProductPaymentQueryVariables,
  PaymentMethod,
  PaymentTypeEnum,
  PollSwishQuery,
  PollSwishQueryVariables,
  PurchaseStatusEnum,
  ShippingProviderEnum,
  TransportationEnum,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { AdList } from "@components/ad/ad-list";
import { Button } from "@components/buttons/button";
import { BuyersProtection } from "@components/buyers-protection/buyers-protection";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { TextInput } from "@components/forms/textInput";
import { ProgressHeader } from "@components/navigation/headers/progress-header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { Image } from "expo-image";
import SwishPaymentOption from "@assets/images/swish-payment-option.png";
import VisaPaymentOption from "@assets/images/visa-payment-option.png";
import MastercardPaymentOption from "@assets/images/mastercard-payment-option.png";
import TrustlyPaymentOption from "@assets/images/trustly-payment-option.png";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { VerifyBottomSheet } from "@components/bank-id/verify-bottom-sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import SwishImage from "@assets/images/swish-no-border.png";
import { Check } from "@components/controls/check";

const BUY_PRODUCT_PAYMENT = gql`
  query BuyProductPayment($input: GetProductInput!) {
    product(input: $input) {
      id
      title
      primaryQuantity
      primaryUnit
      condition
      price
      primaryImage {
        id
        url
      }
      pickupEnabled
      deliveryEnabled
      deliveryPrice
      shippingPrices {
        id
        price
      }
    }
    me {
      id
      email
    }
  }
`;

const BUY_PRODUCT_CREATE_PURCHASE = gql`
  mutation BuyProductCreatePurchase($input: PurchaseProductInput!) {
    purchaseProduct(input: $input) {
      purchase {
        id
        status
      }
      swishToken
      reference
    }
  }
`;

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
  const [email, setEmail] = useState<string>("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showBankId, setShowBankId] = useState(false);
  const [showSwishSheet, setShowSwishSheet] = useState(false);
  const { productId, transportationMethod, servicePointId, deliverTo } =
    useLocalSearchParams<{
      productId: string;
      transportationMethod: "pickup" | "shipping" | "delivery";
      servicePointId?: string;
      deliverTo?: string;
    }>();
  const colors = useThemeColor();

  const { data } = useQuery<
    BuyProductPaymentQuery,
    BuyProductPaymentQueryVariables
  >(BUY_PRODUCT_PAYMENT, {
    variables: { input: { id: productId } },
    onCompleted: (data) => {
      setEmail(data.me.email ?? "");
    },
  });
  const [createPurchase, { data: createPurchaseData }] = useMutation<
    BuyProductCreatePurchaseMutation,
    BuyProductCreatePurchaseMutationVariables
  >(BUY_PRODUCT_CREATE_PURCHASE);

  const progress = () => {
    if (email && isTermsAccepted && !!paymentMethod) {
      return 100;
    }
    return 80;
  };

  const onSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(paymentMethod === method ? undefined : method);
  };

  const onPurchase = () => {
    setShowBankId(true);
  };

  const onVerifyComplete = () => {
    setShowBankId(false);
    const convertMethod = () => {
      switch (transportationMethod) {
        case "pickup":
          return TransportationEnum.Pickup;
        case "shipping":
          return TransportationEnum.Shipping;
        case "delivery":
          return TransportationEnum.Delivery;
        default:
          return undefined;
      }
    };
    const convertedMethod = convertMethod();
    if (!convertedMethod) {
      router.back();
      return;
    }

    const deliverToLocation = deliverTo ? deliverTo.split(",") : undefined;

    if (paymentMethod === PaymentMethod.Swish) {
      createPurchase({
        variables: {
          input: {
            productId,
            paymentMethod: PaymentMethod.Swish,
            swishType:
              Platform.OS === "web"
                ? PaymentTypeEnum.Web
                : PaymentTypeEnum.Mobile,
            transportationMethod: convertedMethod,
            servicePointId,
            shippingProvider: ShippingProviderEnum.Postnord,
            deliverTo: deliverToLocation
              ? {
                  lat: parseFloat(deliverToLocation[0]),
                  lng: parseFloat(deliverToLocation[1]),
                }
              : undefined,
          },
        },
        onCompleted: () => {
          setShowSwishSheet(true);
        },
      });
    }
    //TODO: stripe
    //TODO: trustly
  };

  if (
    !data ||
    (transportationMethod !== "pickup" &&
      transportationMethod !== "shipping" &&
      transportationMethod !== "delivery")
  ) {
    return <LoadingSpinner />;
  }

  let totalPrice = data.product.price;
  if (transportationMethod === "shipping") {
    totalPrice += data.product.shippingPrices?.[0].price ?? 0;
  }
  if (transportationMethod === "delivery") {
    totalPrice += data.product.deliveryPrice ?? 0;
  }
  return (
    <ScreenLayout
      headerComponent={
        <ProgressHeader title="Bekräfta köp" progress={progress()} />
      }
      style={{ gap: 24, marginTop: 16 }}
    >
      <View style={{ gap: 16 }}>
        <AdList
          title={data.product.title}
          condition={data.product.condition}
          imageUrl={data.product.primaryImage?.url}
          imageSize="small"
          quantity={data.product.primaryQuantity}
          quantityUnit={data.product.primaryUnit}
          price={data.product.price}
        />
        <Divider />
      </View>
      <View style={{ gap: 16 }}>
        <Display size="small">Hur vill du betala?</Display>
        <View style={{ gap: 24 }}>
          <Body size="large">
            Alla betalalternativ tillhandahålls av Rocker.
          </Body>
          <Body>
            Betalningen till säljaren hålls av Rocker tills varan har
            överlämnats och du haft 48 timmar att kontrollera att allt stämmer.
          </Body>
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <PaymentCard
          title="Betala med Swish"
          onToggle={() => onSelectPaymentMethod(PaymentMethod.Swish)}
          toggledOn={paymentMethod === PaymentMethod.Swish}
          logoComponents={[
            <Image
              source={SwishPaymentOption.uri}
              style={{ width: 60, height: 18 }}
            />,
          ]}
        />
        <PaymentCard
          title="Betala med kort"
          onToggle={() => onSelectPaymentMethod(PaymentMethod.Stripe)}
          toggledOn={paymentMethod === PaymentMethod.Stripe}
          logoComponents={[
            <Image
              source={VisaPaymentOption.uri}
              style={{ width: 40, height: 16 }}
            />,
            <Image
              source={MastercardPaymentOption.uri}
              style={{ width: 30, height: 18 }}
            />,
          ]}
        />
        <PaymentCard
          title="Direkt från din bank"
          onToggle={() => onSelectPaymentMethod(PaymentMethod.Trustly)}
          toggledOn={paymentMethod === PaymentMethod.Trustly}
          logoComponents={[
            <Image
              source={TrustlyPaymentOption.uri}
              style={{ width: 60, height: 13 }}
            />,
          ]}
        />
      </View>
      <Divider />
      <View
        style={[
          {
            borderRadius: borderRadius.medium,
            gap: 16,
          },
          !isTermsAccepted && {
            padding: 16,
            backgroundColor: colors.buttons.tonal.enabled,
          },
          isTermsAccepted && {
            padding: 15,
            borderWidth: 1,
            borderColor: colors.textField.clicked,
          },
        ]}
      >
        <View>
          <Title size="medium">E-postadress för orderbekräftelse</Title>
          <Body size="medium">
            Vi skickar din orderbekräftelse till den här adressen.
          </Body>
        </View>
        <TextInput value={email} onChange={setEmail} />
        <Divider />
        <Form
          fields={[
            {
              type: "toggle",
              value: isTermsAccepted,
              onPress: () => setIsTermsAccepted(!isTermsAccepted),
              heading: "Köpvillkor",
              description:
                "Genom att fortsätta godkänner du RebuildRs köpvillkor.",
            },
          ]}
        />
      </View>
      <Divider />
      <View style={{ gap: 16, alignItems: "center" }}>
        {transportationMethod === "pickup" && (
          <Body size="medium">Du betalar:</Body>
        )}
        {transportationMethod === "shipping" && (
          <Body size="medium">
            Du betalar (ink. frakt {data.product.shippingPrices?.[0].price} kr):
          </Body>
        )}
        {transportationMethod === "delivery" && (
          <Body size="medium">Du betalar (ink. hemtransport 0 kr):</Body>
        )}
        <Display size="medium">{totalPrice} kr</Display>
      </View>
      <BuyersProtection />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          label="Tillbaka"
          icon="arrowLeft"
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.navigate({
                  pathname: "/buy/[productId]",
                  params: { productId },
                })
          }
        />
        <Button
          label="Betala"
          onPress={onPurchase}
          disabled={!paymentMethod && !isTermsAccepted && !email}
          style={{ flex: 1 }}
        />
      </View>
      <VerifyBottomSheet
        title="Bekräfta din identitet hos Rocker"
        text={
          <View style={{ gap: 24 }}>
            <Body size="medium">
              Du behöver verifiera dig med BankID hos vår betalpartner Rocker.
            </Body>
            <Body size="medium">
              Det är en trygghetsåtgärd som gör att betalningen hanteras säkert
              och hålls tills köpet är klart.
            </Body>
          </View>
        }
        qrTitle="Öppnad BankID och scanna koden"
        show={showBankId}
        onVerifyComplete={onVerifyComplete}
        onDismiss={() => setShowBankId(false)}
      />
      {createPurchaseData && (
        <SwishBottomSheet
          price={totalPrice}
          productId={productId}
          purchaseId={createPurchaseData.purchaseProduct.purchase.id}
          show={showSwishSheet}
          onDismiss={() => setShowSwishSheet(false)}
        />
      )}
    </ScreenLayout>
  );
}

type PaymentCardProps = {
  title: string;
  logoComponents: ReactElement[];
  onToggle: () => void;
  toggledOn: boolean;
};
const PaymentCard = ({
  title,
  logoComponents,
  onToggle,
  toggledOn,
}: PaymentCardProps) => {
  return (
    <ToggleCard
      title={title}
      offColor="none"
      description={
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          {logoComponents.map((logo, i) =>
            React.cloneElement(logo, { key: i }),
          )}
        </View>
      }
      onPress={onToggle}
      enabled={toggledOn}
    />
  );
};

const POLL_SWISH = gql`
  query PollSwish($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      status
    }
  }
`;

type SwishBottomSheetProps = {
  price: number;
  productId: string;
  purchaseId: string;
  show: boolean;
  onDismiss: () => void;
};

const SwishBottomSheet = ({
  price,
  productId,
  purchaseId,
  show,
  onDismiss,
}: SwishBottomSheetProps) => {
  const colors = useThemeColor();
  const ref = useRef<BottomSheetModal>(null);
  useQuery<PollSwishQuery, PollSwishQueryVariables>(POLL_SWISH, {
    variables: { input: { id: purchaseId } },
    pollInterval: 1000,
    onCompleted: (data) => {
      if (data.purchase.status === PurchaseStatusEnum.PaymentAccepted) {
        ref.current?.dismiss();
        onDismiss();
        router.navigate({
          pathname: "/buy/[productId]/success",
          params: { productId },
        });
      }
    },
  });

  useEffect(() => {
    if (show) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [show]);

  return (
    <BottomSheet name="Swish" title="Bekräfta köp" ref={ref} screenHeight>
      <>
        <View style={{ gap: 24 }}>
          <View
            style={{
              paddingVertical: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={SwishImage.uri}
              style={{ width: 187, height: 187 }}
            />
          </View>
          <View>
            <Display size="small" style={{ textAlign: "center" }}>
              Nästan klart!
            </Display>
            <Display size="small" style={{ textAlign: "center" }}>
              Öppna Swish för att betala
            </Display>
          </View>

          <Divider />

          <View style={{ gap: 16 }}>
            <Headline size="small">Såhär gör du:</Headline>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Check
                checkColor="primaryDark"
                selected
                color={colors.navigation.hovered}
              />
              <Body size="medium">Öppna din Swish-app</Body>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Check
                selected
                color={colors.navigation.hovered}
                checkColor="primaryDark"
              />
              <Body size="medium">
                Dubbelkolla att det står <Body size="medium">{price} kr</Body>{" "}
                och att mottagaren är Rocker
              </Body>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Check
                checkColor="primaryDark"
                selected
                color={colors.navigation.hovered}
              />
              <Body size="medium">Godkänn betalningen i Swish</Body>
            </View>
          </View>
        </View>

        <Button
          label="Avbryt"
          onPress={() => onDismiss()}
          style={{ marginTop: 82 }}
        />
      </>
    </BottomSheet>
  );
};
