import {
  BuyProductDeliveryOptionCardQuery,
  BuyProductInitialQuery,
  BuyProductInitialQueryVariables,
  BuyProductTransportationOptionsQuery,
  BuyProductTransportationOptionsQueryVariables,
} from "@/gql/graphql";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { AdList } from "@components/ad/ad-list";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ProgressHeader } from "@components/navigation/headers/progress-header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline } from "@components/typography/text";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { TransportationString } from "@/utils/transportationMethods";
import { SingleDelivery } from "@components/buy/single-delivery";
import { DeliveryCard } from "@components/buy/delivery-card";
import { ShippingCard } from "@components/buy/shipping-card";
import { SingleShipping } from "@components/buy/single-shipping";
import { Summary } from "@components/buy/summary";
import { ShippingDetails } from "@components/buy/shipping-details";
import { PickupCard } from "@components/buy/pickup-card";
import { SinglePickup } from "@components/buy/single-pickup";
import { useSubmitSummary } from "@hooks/buy/use-submit-summary";
import { useScreenType } from "@hooks/useScreenType";
import { useBuyModalContext } from "@context/buy-modal-context";

const BUY_PRODUCT_INITIAL = gql`
  query BuyProductInitial($input: GetProductInput!) {
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
        provider
        price
      }
    }
    me {
      id
      name
      phoneNumber
      address
      postCode
      city
    }
  }
`;

const BUY_PRODUCT_TRANPORTATION_OPTIONS = gql`
  query BuyProductTransportationOptions(
    $input: GetTransportationOptionsInput!
  ) {
    getPickupOption(input: $input) {
      lat
      lng
      address
    }
    getShippingOptions(input: $input) {
      shippingPrice {
        id
        price
        provider
      }
      servicePoints {
        id
        name
        distance
        streetName
        streetNumber
        postalCode
        city
      }
    }
    getDeliveryOption(input: $input) {
      isWithinRadius
      distanceFromProduct
      deliveryPrice
    }
  }
`;

export default function BuyProductInitial() {
  return <Buy />;
}

type Props = {
  productId?: string;
};

export const Buy = ({ productId: _productId }: Props) => {
  const [progress, setProgress] = useState(10);
  const { isDesktop } = useScreenType();
  const { setVisible, setContent } = useBuyModalContext();

  const { productId: paramProductId } = useLocalSearchParams<{
    productId: string;
  }>();
  const productId = _productId ?? paramProductId;

  const { data } = useQuery<
    BuyProductInitialQuery,
    BuyProductInitialQueryVariables
  >(BUY_PRODUCT_INITIAL, { variables: { input: { id: productId } } });

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setContent(null);
    }, 500);
  };

  if (!data) {
    return <LoadingSpinner />;
  }

  let singleTransportationOption: TransportationString | undefined = undefined;
  if (data.product.pickupEnabled) {
    singleTransportationOption =
      data.product.shippingPrices?.length || data.product.deliveryEnabled
        ? undefined
        : "pickup";
  }
  if (data.product.shippingPrices?.length) {
    singleTransportationOption =
      data.product.pickupEnabled || data.product.deliveryEnabled
        ? undefined
        : "shipping";
  }
  if (data.product.deliveryEnabled) {
    singleTransportationOption =
      data.product.shippingPrices?.length || data.product.pickupEnabled
        ? undefined
        : "delivery";
  }
  let singleProgress = 30;
  if (
    singleTransportationOption === "pickup" ||
    singleTransportationOption === "delivery"
  ) {
    singleProgress = 75;
  }
  if (singleTransportationOption === "shipping") {
    singleProgress = 50;
  }

  return (
    <>
      <ScreenLayout
        contentHorizontalPadding={isDesktop ? 0 : undefined}
        headerComponent={
          <ProgressHeader
            title="Bekräfta köp"
            progress={singleTransportationOption ? singleProgress : progress}
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
        {!singleTransportationOption && (
          <MultipleOptions
            initialData={data}
            updateProgress={(progress) => setProgress(progress)}
          />
        )}
        {singleTransportationOption && (
          <SingleOptions
            transportationMethod={singleTransportationOption}
            initialData={data}
          />
        )}
      </ScreenLayout>
    </>
  );
}
type MultipleOptionsProps = {
  initialData: BuyProductInitialQuery;
  updateProgress: (progress: number) => void;
};
const MultipleOptions = ({
  initialData,
  updateProgress,
}: MultipleOptionsProps) => {
  const [postCode, setPostCode] = useState("");
  const [transportationMethod, setTransportationMethod] =
    useState<TransportationString>();

  const { submitPickup, submitDelivery } = useSubmitSummary();

  //shipping
  const [showShippingDetails, setShowShippingDetails] = useState(false);
  const [servicePointId, setServicePointId] = useState<string>();

  //delivery
  const [deliveryOption, setDeliveryOption] = useState<
    BuyProductDeliveryOptionCardQuery["getDeliveryOption"] & { address: string }
  >();
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const [
    getTransportationOptions,
    { data: transportationData, loading: transportationLoading },
  ] = useLazyQuery<
    BuyProductTransportationOptionsQuery,
    BuyProductTransportationOptionsQueryVariables
  >(BUY_PRODUCT_TRANPORTATION_OPTIONS, {});

  const onEnterPostalCode = () => {
    getTransportationOptions({
      variables: {
        input: {
          productId,
          postCode,
        },
      },
      onCompleted: (data) => {
        if (data.getShippingOptions) {
          setServicePointId(data.getShippingOptions[0].servicePoints[0].id);
        }
      },
    });
  };
  const shippingOption = transportationData?.getShippingOptions[0];
  const showTransportationOptions =
    transportationData && !transportationLoading && !showShippingDetails;
  let totalPrice = initialData.product.price;
  if (transportationMethod === "shipping") {
    totalPrice +=
      transportationData?.getShippingOptions[0].shippingPrice.price ?? 0;
  }
  if (transportationMethod === "delivery") {
    totalPrice += transportationData?.getDeliveryOption?.deliveryPrice ?? 0;
  }
  if (showShippingDetails && shippingOption && servicePointId) {
    return (
      <ShippingDetails
        initialData={initialData}
        shippingPrice={shippingOption.shippingPrice.price}
        shippingProvider={shippingOption.shippingPrice.provider}
        servicePointId={servicePointId}
        onBack={() => setShowShippingDetails(false)}
      />
    );
  }

  const onSelectTransportationMethod = (newMethod: TransportationString) => {
    if (newMethod === transportationMethod) {
      setTransportationMethod(undefined);
      updateProgress(30);
      return;
    }
    if (newMethod === "delivery" || newMethod === "pickup") {
      updateProgress(75);
    }
    if (newMethod === "shipping") {
      updateProgress(50);
    }
    setTransportationMethod(newMethod);
  };

  const onToPayment = () => {
    if (!transportationMethod) {
      return;
    }

    if (transportationMethod === "pickup") {
      submitPickup(productId, totalPrice);
    }
    if (transportationMethod === "delivery" && deliveryOption) {
      submitDelivery(
        productId,
        totalPrice,
        deliveryOption.deliverToLocation.lat,
        deliveryOption.deliverToLocation.lng,
        deliveryOption.address,
      );
    }
  };

  return (
    <>
      <View style={{ gap: 16 }}>
        <Display size="small">Välj leverans eller upphämtning</Display>
        <Body size="large">
          Skriv in ditt postnummer för att se tillgängliga leveransalternativ i
          ditt område.
        </Body>
      </View>
      <View style={{ gap: 16 }}>
        <Form
          fields={[
            {
              heading: "Ditt Postnummer",
              type: "text",
              value: postCode,
              onChange: (t) => setPostCode(t),
              helperText: "Tex. 34333",
            },
          ]}
        />
        {!transportationData && (
          <Button
            label="Visa mina alternativ"
            onPress={() => {
              onEnterPostalCode();
            }}
            loading={transportationLoading}
          />
        )}
        {!!transportationData && (
          <Button
            label="Uppdatera leveransalternativ"
            onPress={() => {
              onEnterPostalCode();
            }}
            loading={transportationLoading}
            type="tonal"
          />
        )}
      </View>
      {showTransportationOptions && (
        <View>
          <View style={{ marginBottom: 12 }}>
            <Divider />
            <Headline size="small" style={{ marginTop: 16 }}>
              Leveransalternativ:
            </Headline>
          </View>

          <View style={{ gap: 8 }}>
            {!!transportationData.getPickupOption && (
              <PickupCard
                methodSelected={transportationMethod === "pickup"}
                toggleMethod={() => onSelectTransportationMethod("pickup")}
                pickupOption={transportationData.getPickupOption}
              />
            )}
            {!!shippingOption && (
              <ShippingCard
                enabled={transportationMethod === "shipping"}
                toggleMethod={() => onSelectTransportationMethod("shipping")}
                shippingOption={shippingOption}
                selectServicePoint={(id) => setServicePointId(id)}
              />
            )}
            {transportationData.getDeliveryOption && (
              <DeliveryCard
                price={transportationData.getDeliveryOption.deliveryPrice}
                productId={productId}
                methodSelected={transportationMethod === "delivery"}
                toggleMethod={() => onSelectTransportationMethod("delivery")}
                updateDeliveryOption={setDeliveryOption}
                deliveryOption={deliveryOption}
              />
            )}
          </View>
        </View>
      )}
      {transportationMethod === "pickup" && (
        <Summary
          text="Du betalar:"
          price={totalPrice}
          mainButton={{
            label: totalPrice ? "Fortsätt till Betalning" : "Fortsätt",
            onPress: () => {
              onToPayment();
            },
          }}
          bottomText="Du hämtar varan inom 7 dagar."
        />
      )}
      {transportationMethod === "shipping" && (
        <Summary
          text={`Du betalar (ink. frakt ${initialData.product.shippingPrices?.[0].price} kr):`}
          price={totalPrice}
          mainButton={{
            label: "Fortsätt",
            onPress: () => {
              setShowShippingDetails(true);
            },
          }}
          bottomText="Säljaren skickar varan inom 7 dagar."
        />
      )}
      {transportationMethod === "delivery" && deliveryOption && (
        <Summary
          text={`Du betalar (ink. hemtransport ${deliveryOption.deliveryPrice} kr):`}
          price={totalPrice}
          mainButton={{
            label: totalPrice ? "Fortsätt till Betalning" : "Fortsätt",
            onPress: () => {
              onToPayment();
            },
          }}
          bottomText="Leveransen planeras i chatten mellan dig och säljaren och ska ske inom 7 dagar."
        />
      )}
    </>
  );
};

type SingleOptionProps = {
  transportationMethod: "pickup" | "shipping" | "delivery";
  initialData: BuyProductInitialQuery;
};
const SingleOptions = ({
  transportationMethod,
  initialData,
}: SingleOptionProps) => {
  const [showShippingDetails, setShowShippingDetails] = useState(false);
  const [servicePointId, setServicePointId] = useState<string>();

  const shippingPrice = initialData.product.shippingPrices?.[0];
  if (showShippingDetails && servicePointId && shippingPrice) {
    return (
      <ShippingDetails
        initialData={initialData}
        shippingPrice={shippingPrice.price}
        shippingProvider={shippingPrice.provider}
        servicePointId={servicePointId}
        onBack={() => setShowShippingDetails(false)}
      />
    );
  }
  return (
    <>
      <View>
        <Display size="small" style={{ marginBottom: 24 }}>
          Tillgängligt leveransalternativ
        </Display>
        <View>
          {transportationMethod === "pickup" && (
            <SinglePickup productId={initialData.product.id} />
          )}
          {transportationMethod === "shipping" && shippingPrice && (
            <SingleShipping
              shippingProvider={shippingPrice.provider}
              shippingPrice={shippingPrice.price}
              productId={initialData.product.id}
              productPrice={initialData.product.price}
              onContinue={() => {
                setShowShippingDetails(true);
              }}
              selectServicePoint={(id) => setServicePointId(id)}
            />
          )}
          {transportationMethod === "delivery" && (
            <SingleDelivery
              productPrice={initialData.product.price ?? 0}
              productId={initialData.product.id}
            />
          )}
        </View>
      </View>
    </>
  );
};
