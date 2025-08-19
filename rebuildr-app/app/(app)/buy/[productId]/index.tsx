import {
  BuyProductDeliveryOptionQuery,
  BuyProductDeliveryOptionQueryVariables,
  BuyProductInitialQuery,
  BuyProductInitialQueryVariables,
  BuyProductTransportationOptionsQuery,
  BuyProductTransportationOptionsQueryVariables,
  BuyProductUpdateUserMutation,
  BuyProductUpdateUserMutationVariables,
  CreateFreePurchaseMutation,
  CreateFreePurchaseMutationVariables,
} from "@/gql/graphql";
import { formatMetersToKm } from "@/utils/distanceHandling";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { AdList } from "@components/ad/ad-list";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Map } from "@components/maps/map";
import { ProgressHeader } from "@components/navigation/headers/progress-header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { Body, Display, Headline, Title } from "@components/typography/text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import SwishPaymentOption from "@assets/images/swish-payment-option.png";
import VisaPaymentOption from "@assets/images/visa-payment-option.png";
import MastercardPaymentOption from "@assets/images/mastercard-payment-option.png";
import TrustlyPaymentOption from "@assets/images/trustly-payment-option.png";
import { Image } from "expo-image";
import { shippingProviderStrings } from "@constants/shippingProviders";
import {
  TransportationString,
  transportationStringToEnum,
} from "@/utils/transportationMethods";
import { DeliveryCard } from "@components/buy/delivery";
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
      shippingPrices {
        id
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

const BUY_PRODUCT_DELIVERY_OPTION = gql`
  query BuyProductDeliveryOption($input: GetTransportationOptionsInput!) {
    getDeliveryOption(input: $input) {
      deliverToLocation {
        lat
        lng
      }
      isWithinRadius
      distanceFromProduct
      deliveryPrice
      postalCode
    }
  }
`;

const BUY_PRODUCT_UPDATE_USER = gql`
  mutation BuyProductUpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        name
        phoneNumber
        address
        postCode
        city
      }
    }
  }
`;

const BUY_PRODUCT_CREATE_FREE_PURCHASE = gql`
  mutation CreateFreePurchase($input: PurchaseProductInput!) {
    purchaseProduct(input: $input) {
      purchase {
        id
        status
      }
    }
  }
`;

export default function BuyProductInitial() {
  const [postCode, setPostCode] = useState("");
  const [transportationMethod, setTransportationMethod] =
    useState<TransportationString>();

  //shipping
  const [showShippingDetails, setShowShippingDetails] = useState(false);
  const [servicePoint, setServicePoint] =
    useState<
      BuyProductTransportationOptionsQuery["getShippingOptions"][0]["servicePoints"][0]
    >();
  const [name, setName] = useState<string>();
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [shippingAddress, setShippingAddress] = useState<string>();
  const [shippingPostCode, setShippingPostCode] = useState<string>();
  const [city, setCity] = useState<string>();

  //delivery
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryOption, setDeliveryOption] =
    useState<BuyProductDeliveryOptionQuery["getDeliveryOption"]>();
  const servicePointRef = useRef<BottomSheetModal>(null);
  const { productId } = useLocalSearchParams<{ productId: string }>();

  const { data } = useQuery<
    BuyProductInitialQuery,
    BuyProductInitialQueryVariables
  >(BUY_PRODUCT_INITIAL, { variables: { input: { id: productId } } });
  const [
    getTransportationOptions,
    { data: transportationData, loading: transportationLoading },
  ] = useLazyQuery<
    BuyProductTransportationOptionsQuery,
    BuyProductTransportationOptionsQueryVariables
  >(BUY_PRODUCT_TRANPORTATION_OPTIONS, {
    onCompleted: (data) => {
      if (data.getShippingOptions.length) {
        setServicePoint(data.getShippingOptions[0].servicePoints[0]);
      }
    },
  });
  const [getDeliveryOption, { loading: deliveryOptionLoading }] = useLazyQuery<
    BuyProductDeliveryOptionQuery,
    BuyProductDeliveryOptionQueryVariables
  >(BUY_PRODUCT_DELIVERY_OPTION, {
    onCompleted: (data) => {
      setDeliveryOption(data.getDeliveryOption);
    },
    fetchPolicy: "cache-and-network",
  });
  const [updateUser, { loading: updateUserloading }] = useMutation<
    BuyProductUpdateUserMutation,
    BuyProductUpdateUserMutationVariables
  >(BUY_PRODUCT_UPDATE_USER);
  const [purchaseProduct] = useMutation<
    CreateFreePurchaseMutation,
    CreateFreePurchaseMutationVariables
  >(BUY_PRODUCT_CREATE_FREE_PURCHASE);

  const onEnterPostalCode = () => {
    getTransportationOptions({
      variables: {
        input: {
          productId,
          postCode,
        },
      },
    });
  };

  const progress = () => {
    if (
      transportationMethod === "pickup" ||
      transportationMethod === "delivery"
    ) {
      return 75;
    }
    if (transportationMethod === "shipping") {
      return 50;
    }

    if (transportationData) {
      return 30;
    }
    return 10;
  };

  const onShippingProceed = () => {
    setShowShippingDetails(true);
    setName(data?.me.name ?? "");
    setPhoneNumber(data?.me.phoneNumber ?? "");
    setShippingAddress(data?.me.address ?? "");
    setShippingPostCode(data?.me.postCode ?? "");
    setCity(data?.me.city ?? "");
  };
  const onToPayment = () => {
    if (!data || !transportationMethod) {
      return;
    }

    const transportationEnum = transportationStringToEnum(transportationMethod);

    //If the whole purchase is free, create the purchase and move on directly to success screen, skipping payment screen
    if (totalPrice === 0) {
      purchaseProduct({
        variables: {
          input: {
            productId,
            transportationMethod: transportationEnum,
          },
        },
        onCompleted: (data) => {
          router.navigate({
            pathname: "/buy/[productId]/success",
            params: { productId, purchaseId: data.purchaseProduct.purchase.id },
          });
        },
      });
      return;
    }

    if (transportationMethod === "pickup") {
      router.navigate({
        pathname: "/buy/[productId]/payment",
        params: { productId, transportationMethod },
      });
    }
    if (transportationMethod === "shipping" && servicePoint) {
      if (updateUserloading) {
        return;
      }
      updateUser({
        variables: {
          input: {
            id: data.me.id,
            name,
            phoneNumber,
            address: shippingAddress,
            postCode: shippingPostCode,
            city,
          },
        },
        onCompleted: () => {
          router.navigate({
            pathname: "/buy/[productId]/payment",
            params: {
              productId,
              transportationMethod,
              servicePointId: servicePoint.id,
            },
          });
        },
      });
    }
    if (transportationMethod === "delivery" && deliveryOption) {
      router.navigate({
        pathname: "/buy/[productId]/payment",
        params: {
          productId,
          transportationMethod,
          deliverToLocation: `${deliveryOption.deliverToLocation.lat},${deliveryOption.deliverToLocation.lng}`,
          deliverToAddress: deliveryAddress,
        },
      });
    }
  };
  const onEnterDeliveryAddress = () => {
    if (!deliveryAddress || deliveryOptionLoading) {
      return null;
    }

    getDeliveryOption({
      variables: { input: { productId, address: deliveryAddress, postCode } },
    });
  };

  if (!data) {
    return <LoadingSpinner />;
  }

  let totalPrice = data.product.price;
  if (transportationMethod === "shipping") {
    totalPrice +=
      transportationData?.getShippingOptions[0].shippingPrice.price ?? 0;
  }
  if (transportationMethod === "delivery") {
    totalPrice += transportationData?.getDeliveryOption?.deliveryPrice ?? 0;
  }

  const shippingOption = transportationData?.getShippingOptions[0];
  const showTransportationOptions =
    transportationData && !transportationLoading && !showShippingDetails;
  const showSummary =
    transportationMethod === "pickup" ||
    transportationMethod === "shipping" ||
    transportationMethod === "delivery";
  let nrOfTransportationOptions = 0;
  if (transportationData?.getDeliveryOption) nrOfTransportationOptions += 1;
  if (transportationData?.getPickupOption) nrOfTransportationOptions += 1;
  if (transportationData?.getShippingOptions.length)
    nrOfTransportationOptions += 1;
  const isSingleTransportationMethod = nrOfTransportationOptions === 1;

  return (
    <>
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
        {!showShippingDetails && (
          <>
            <View style={{ gap: 16 }}>
              <Display size="small">Välj leverans eller upphämtning</Display>
              <Body size="large">
                Skriv in ditt postnummer för att se tillgängliga
                leveransalternativ i ditt område.
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
          </>
        )}
        {showTransportationOptions && (
          <View>
            <Divider />
            <Headline size="small" style={{ marginTop: 16 }}>
              Leveransalernativ:
            </Headline>
            <View style={{ gap: 8, marginTop: 12 }}>
              {!!transportationData.getPickupOption && (
                <ToggleCard
                  title="Avhämtning"
                  valueString="0 kr"
                  enabled={transportationMethod === "pickup"}
                  onPress={() => {
                    setTransportationMethod(
                      transportationMethod === "pickup" ? undefined : "pickup",
                    );
                  }}
                  headerDivider
                >
                  <View style={{ gap: 16 }}>
                    <View style={{ gap: 4 }}>
                      <Title size="medium">Plats för avhämtning</Title>
                      <Body size="medium">
                        Avhämtning planeras i chatten mellan dig och säljaren
                        och ska ske inom 7 dagar.
                      </Body>
                    </View>
                    <Map
                      radius={3000}
                      interactive={false}
                      lat={transportationData.getPickupOption.lat}
                      lng={transportationData.getPickupOption.lng}
                    />
                    <View style={{ gap: 12 }}>
                      <Body size="medium">
                        {transportationData.getPickupOption.address}
                      </Body>
                      <Body size="small" color="secondary">
                        Ungefärligt område. Adress visas först när ett köp har
                        genomförts.
                      </Body>
                    </View>
                  </View>
                </ToggleCard>
              )}
              {!!shippingOption && (
                <ToggleCard
                  title={`Frakt med ${shippingProviderStrings[shippingOption.shippingPrice.provider]}`}
                  valueString={`${shippingOption.shippingPrice.price} kr`}
                  enabled={transportationMethod === "shipping"}
                  onPress={() => {
                    setTransportationMethod(
                      transportationMethod === "shipping"
                        ? undefined
                        : "shipping",
                    );
                  }}
                  headerDivider
                >
                  <View style={{ gap: 16 }}>
                    <View>
                      <Title size="medium">
                        Skickas med{" "}
                        {
                          shippingProviderStrings[
                            shippingOption.shippingPrice.provider
                          ]
                        }
                      </Title>
                      <Body size="medium" style={{ marginTop: 4 }}>
                        Ditt paket kommer levereras till ditt närmsta{" "}
                        {shippingProviderStrings[
                          shippingOption.shippingPrice.provider
                        ].toLowerCase()}
                        ombud.
                      </Body>
                    </View>
                    <View
                      style={{ flexDirection: "row", gap: 16, marginTop: 16 }}
                    >
                      <View style={{ flex: 1 }}>
                        <Title size="medium">{servicePoint?.name}</Title>
                        <Body size="medium" style={{ marginTop: 4 }}>
                          {servicePoint?.distance
                            ? formatMetersToKm(servicePoint.distance)
                            : ""}{" "}
                          km
                        </Body>
                        <Body
                          size="medium"
                          color="secondary"
                          style={{ marginTop: 8 }}
                        >
                          {servicePoint?.streetName}{" "}
                          {servicePoint?.streetNumber},{" "}
                          {servicePoint?.postalCode} {servicePoint?.city}
                        </Body>
                      </View>
                      <Button
                        label="Ändra"
                        type="tonal"
                        onPress={() => {
                          servicePointRef.current?.present();
                        }}
                      />
                    </View>
                  </View>
                </ToggleCard>
              )}
              {transportationData.getDeliveryOption && (
                <DeliveryCard
                  price={transportationData.getDeliveryOption.deliveryPrice}
                  productId={productId}
                  methodSelected={transportationMethod === "delivery"}
                  toggleMethod={() => {
                    setTransportationMethod(
                      transportationMethod === "delivery"
                        ? undefined
                        : "delivery",
                    );
                  }}
                  updateDeliveryOption={setDeliveryOption}
                  deliveryOption={deliveryOption}
                  isSingleTransportationMethod={isSingleTransportationMethod}
                />
              )}
            </View>
          </View>
        )}
        {showShippingDetails && shippingOption && (
          <View style={{ gap: 24 }}>
            <Display size="small">Dina uppgifter</Display>
            <Form
              style={{ gap: 24 }}
              fields={[
                {
                  type: "text",
                  value: name,
                  onChange: (t) => setName(t),
                  heading: "För- och efternamn",
                },
                {
                  type: "text",
                  value: phoneNumber,
                  onChange: (t) => setPhoneNumber(t),
                  heading: "Telefonnummer",
                  description: `För leveransansvarig från ${shippingProviderStrings[shippingOption.shippingPrice.provider]}.`,
                },
                {
                  type: "text",
                  value: shippingAddress,
                  onChange: (t) => setShippingAddress(t),
                  heading: "Gatuadress",
                  description:
                    "För spårbarhet och identifiering vid eventuell felsortering eller retur.",
                },
                {
                  type: "text",
                  value: shippingPostCode,
                  onChange: (t) => setShippingPostCode(t),
                  heading: "Postnummer",
                  horizontalSize: 1,
                },
                {
                  type: "text",
                  value: city,
                  onChange: (t) => setCity(t),
                  heading: "Stad",
                  horizontalSize: 2,
                },
              ]}
            />
          </View>
        )}
        {showSummary && (
          <>
            <Divider />
            <View style={{ gap: 16, alignItems: "center" }}>
              {transportationMethod === "pickup" && (
                <Body size="medium">Du betalar:</Body>
              )}
              {transportationMethod === "shipping" && (
                <Body size="medium">
                  Du betalar (ink. frakt {shippingOption?.shippingPrice.price}{" "}
                  kr):
                </Body>
              )}
              {transportationMethod === "delivery" && (
                <Body size="medium">
                  Du betalar (ink. hemtransport{" "}
                  {transportationData?.getDeliveryOption?.deliveryPrice} kr):
                </Body>
              )}
              <Display size="medium">{totalPrice} kr</Display>
              <View style={{ alignSelf: "stretch" }}>
                {transportationMethod === "pickup" && (
                  <Button
                    label="Fortsätt till Betalning"
                    onPress={onToPayment}
                  />
                )}
                {transportationMethod === "shipping" &&
                  (showShippingDetails ? (
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button
                        label="Tillbaka"
                        onPress={() => {
                          setShowShippingDetails(false);
                        }}
                        icon="arrowLeft"
                      />
                      <Button
                        label="Fortsätt till Betalning"
                        onPress={onToPayment}
                        style={{ flex: 1 }}
                        disabled={
                          !name ||
                          !phoneNumber ||
                          !shippingAddress ||
                          !shippingPostCode ||
                          !city
                        }
                      />
                    </View>
                  ) : (
                    <Button
                      label="Fortsätt"
                      onPress={() => {
                        onShippingProceed();
                      }}
                    />
                  ))}
                {transportationMethod === "delivery" && (
                  <Button
                    label="Fortsätt till Betalning"
                    onPress={onToPayment}
                    disabled={!deliveryAddress}
                  />
                )}
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Image
                source={SwishPaymentOption.uri}
                style={{ width: 60, height: 18 }}
              />
              <Image
                source={VisaPaymentOption.uri}
                style={{ width: 40, height: 16 }}
              />
              <Image
                source={MastercardPaymentOption.uri}
                style={{ width: 30, height: 18 }}
              />
              <Image
                source={TrustlyPaymentOption.uri}
                style={{ width: 60, height: 13 }}
              />
            </View>
            <Body size="medium" style={{ textAlign: "center" }}>
              {transportationMethod === "pickup" &&
                "Du hämtar varan inom 7 dagar."}
              {transportationMethod === "shipping" &&
                "Säljaren skickar varan inom 7 dagar."}
              {transportationMethod === "delivery" &&
                "Leveransen planeras i chatten mellan dig och säljaren och ska ske inom 7 dagar."}
            </Body>
          </>
        )}
      </ScreenLayout>
      <BottomSheet ref={servicePointRef} name="Ombud" title="Välj ett ombud">
        <View style={{ gap: 24 }}>
          <Display size="small">Välj ett ombud nära dig</Display>
          <View style={{ gap: 16 }}>
            {shippingOption?.servicePoints.map((servicePoint, i) => (
              <View
                key={i}
                style={{ flexDirection: "row", gap: 16, marginTop: 16 }}
              >
                <View style={{ flex: 1 }}>
                  <Title size="medium">{servicePoint?.name}</Title>
                  <Body size="medium" style={{ marginTop: 4 }}>
                    {servicePoint?.distance
                      ? formatMetersToKm(servicePoint.distance)
                      : ""}{" "}
                    km
                  </Body>
                  <Body
                    size="medium"
                    color="secondary"
                    style={{ marginTop: 8 }}
                  >
                    {servicePoint?.streetName} {servicePoint?.streetNumber}
                    ,{" "}
                  </Body>
                  <Body size="medium" color="secondary">
                    {servicePoint?.postalCode} {servicePoint?.city}
                  </Body>
                </View>
                <Button
                  label="Välj"
                  onPress={() => {
                    setServicePoint(servicePoint);
                    servicePointRef.current?.close();
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
