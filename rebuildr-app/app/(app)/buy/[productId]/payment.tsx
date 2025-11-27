import {
  BuyProductCreatePurchaseMutation,
  BuyProductCreatePurchaseMutationVariables,
  BuyProductPaymentQuery,
  BuyProductPaymentQueryVariables,
  PaymentCancelPurchaseMutation,
  PaymentCancelPurchaseMutationVariables,
  PaymentMethod,
  ShippingProviderEnum,
  TransportationEnum,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { AdList } from "@components/ad/ad-list";
import { Button } from "@components/buttons/button";
import { BuyersProtection } from "@components/buyers-protection/buyers-protection";
import { Divider } from "@components/dividers/divider";
import { ProgressHeader } from "@components/navigation/headers/progress-header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import React, { ReactElement, useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import VisaPaymentOption from "@assets/images/visa-payment-option.png";
import MastercardPaymentOption from "@assets/images/mastercard-payment-option.png";
import AmExPaymentOption from "@assets/images/american-express-payment-option.png";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import {
  TransportationString,
  transportationStringToEnum,
} from "@/utils/transportationMethods";
import { StripeBottomSheet } from "@components/payment/stripe-bottom-sheet";
import { Toggle } from "@components/controls/toggle";
import { useScreenType } from "@hooks/useScreenType";
import { useBuyModalContext } from "@context/buy-modal-context";
import { progressValues } from "@components/buy/constants";

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
      reference
    }
  }
`;

const PAYMENT_CANCEL_PURCHASE = gql`
  mutation PaymentCancelPurchase($input: CancelPurchaseInput!) {
    cancelPurchase(input: $input) {
      id
      status
    }
  }
`;

export default function Payment() {
  const localSearchParams = useLocalSearchParams<{
    productId: string;
    transportationMethod: TransportationString;
    servicePointId?: string;
    deliverToLocation?: string;
    deliverToAddress?: string;
  }>();
  return <PaymentContent {...localSearchParams} />;
}

export type PaymentDeliveryProps = {
  transportationMethod: TransportationString;
  servicePointId?: string;
  deliverToLocation?: string;
  deliverToAddress?: string;
};

type PaymentContentProps = {
  productId: string;
} & PaymentDeliveryProps;

export const PaymentContent = ({
  productId,
  transportationMethod,
  servicePointId,
  deliverToLocation,
  deliverToAddress,
}: PaymentContentProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const colors = useThemeColor();
  const { isDesktop, isMobile } = useScreenType();
  const { setVisible, setContent } = useBuyModalContext();

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setContent(null);
    }, 500);
  };

  useEffect(() => {
    if (
      isDesktop &&
      paymentMethod === PaymentMethod.Card &&
      !!createPurchaseData?.purchaseProduct.reference
    ) {
      if (showStripeModal) {
        setContent({
          buyState: "stripeForm",
          productId,
          purchaseId: createPurchaseData.purchaseProduct.purchase.id,
          stripeClientSecret: createPurchaseData.purchaseProduct.reference,
        });
      } else {
        setContent({
          buyState: "payment",
          productId,
          delivery: {
            transportationMethod,
            servicePointId,
            deliverToLocation,
            deliverToAddress,
          },
        });
      }
    }
  }, [showStripeModal]);

  const { data, loading } = useQuery<
    BuyProductPaymentQuery,
    BuyProductPaymentQueryVariables
  >(BUY_PRODUCT_PAYMENT, {
    variables: { input: { id: productId } },
  });
  const [
    createPurchase,
    { data: createPurchaseData, loading: createPurchaseLoading },
  ] = useMutation<
    BuyProductCreatePurchaseMutation,
    BuyProductCreatePurchaseMutationVariables
  >(BUY_PRODUCT_CREATE_PURCHASE);
  const [cancelPayment] = useMutation<
    PaymentCancelPurchaseMutation,
    PaymentCancelPurchaseMutationVariables
  >(PAYMENT_CANCEL_PURCHASE);

  const progress = () => {
    if (isTermsAccepted && !!paymentMethod) {
      return progressValues.done;
    }
    return progressValues.payment;
  };

  const onSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(paymentMethod === method ? undefined : method);
  };

  const onPurchase = () => {
    if (createPurchaseLoading) {
      return;
    }

    const transportationMethodEnum =
      transportationStringToEnum(transportationMethod);
    if (!transportationMethodEnum) {
      router.back();
      return;
    }

    const deliverToCoordinates = deliverToLocation
      ? deliverToLocation.split(",")
      : undefined;

    let partialInput: Partial<
      BuyProductCreatePurchaseMutationVariables["input"]
    > = {
      productId,
      paymentMethod,
      transportationMethod: transportationMethodEnum,
    };
    switch (transportationMethodEnum) {
      case TransportationEnum.Pickup:
        break;
      case TransportationEnum.Shipping:
        partialInput = {
          ...partialInput,
          servicePointId,
          shippingProvider: ShippingProviderEnum.Postnord,
        };
        break;
      case TransportationEnum.Delivery:
        partialInput = {
          ...partialInput,
          deliverToLocation: deliverToCoordinates
            ? {
                lat: parseFloat(deliverToCoordinates[0]),
                lng: parseFloat(deliverToCoordinates[1]),
              }
            : undefined,
          deliverToAddress,
        };
        break;
    }
    const createPurchaseInput =
      partialInput as BuyProductCreatePurchaseMutationVariables["input"];

    //Hide Swish until Stripe supports it
    // if (paymentMethod === PaymentMethod.Swish) {
    //   createPurchase({
    //     variables: {
    //       input: {
    //         ...createPurchaseInput,
    //         swishType:
    //           Platform.OS === "web"
    //             ? PaymentTypeEnum.Web
    //             : PaymentTypeEnum.Mobile,
    //       },
    //     },
    //     onCompleted: () => {
    //       setShowSwishSheet(true);
    //     },
    //   });
    // }
    if (paymentMethod === PaymentMethod.Card) {
      createPurchase({
        variables: {
          input: createPurchaseInput,
        },
        onCompleted: async () => {
          setShowStripeModal(true);
        },
      });
    }
  };

  const onDismissStripe = () => {
    if (!createPurchaseData) {
      return;
    }
    setShowStripeModal(false);
    cancelPayment({
      variables: {
        input: {
          purchaseId: createPurchaseData?.purchaseProduct.purchase.id,
        },
      },
    });
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

  const queriesLoading = loading || createPurchaseLoading;
  return (
    <ScreenLayout
      contentHorizontalPadding={isDesktop ? 0 : undefined}
      headerComponent={
        <ProgressHeader
          title="Bekräfta köp"
          progress={progress()}
          onBack={isDesktop ? handleClose : undefined}
        />
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
            Alla betalalternativ tillhandahålls av Stripe.
          </Body>
          <Body>
            Betalningen till säljaren hålls av Stripe tills du har tagit emot
            varan och haft 48 timmar på dig att kontrollera att allt stämmer.
          </Body>
        </View>
      </View>
      <View style={{ gap: 8 }}>
        {/*
        //Hide Swish until Stripe supports it
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
        /> */}
        <PaymentCard
          title="Betala med kort"
          onToggle={() => onSelectPaymentMethod(PaymentMethod.Card)}
          toggledOn={paymentMethod === PaymentMethod.Card}
          logoComponents={[
            <Image
              source={VisaPaymentOption.uri}
              style={{ width: 40, height: 16 }}
            />,
            <Image
              source={MastercardPaymentOption.uri}
              style={{ width: 30, height: 18 }}
            />,
            <Image
              source={AmExPaymentOption.uri}
              style={{ width: 40, height: 18 }}
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
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Title size="medium">Köpvillkor</Title>
            <Body size="medium">
              Genom att fortsätta godkänner du RebuildRs{" "}
              <Body isLink size="medium">
                köpvillkor
              </Body>
              .
            </Body>
          </View>
          <Toggle
            onPress={() => setIsTermsAccepted(!isTermsAccepted)}
            value={isTermsAccepted}
          />
        </View>
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
          <Body size="medium">
            Du betalar (ink. hemtransport {data.product.deliveryPrice} kr):
          </Body>
        )}
        <Display size="medium">{totalPrice} kr</Display>
      </View>
      <BuyersProtection />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          label="Tillbaka"
          icon="arrowLeft"
          onPress={() => {
            if (isDesktop) {
              setContent({ buyState: "summary", productId });
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.navigate({
                pathname: "/buy/[productId]",
                params: { productId },
              });
            }
          }}
        />
        <Button
          label="Betala"
          onPress={onPurchase}
          disabled={!paymentMethod || !isTermsAccepted}
          loading={queriesLoading}
          style={{ flex: 1 }}
        />
      </View>
      {isMobile &&
        paymentMethod === PaymentMethod.Card &&
        !!createPurchaseData?.purchaseProduct.reference && (
          <StripeBottomSheet
            show={showStripeModal}
            clientSecret={createPurchaseData.purchaseProduct.reference}
            productId={productId}
            purchaseId={createPurchaseData.purchaseProduct.purchase.id}
            onDismiss={() => onDismissStripe()}
          />
        )}
    </ScreenLayout>
  );
};

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
