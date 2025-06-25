import { TransportationQueryQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { ProgressHeader } from "@components/product/progress-header";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Delivery } from "@components/transport/delivery";
import { Pickup } from "@components/transport/pickup";
import { Shipping } from "@components/transport/shipping";
import { Display, Headline } from "@components/typography/text";
import { router } from "expo-router";
import { Suspense, useState } from "react";
import { View } from "react-native";

const TRANSPORTATION_QUERY = gql`
  query TransportationQuery {
    getDraftedProduct {
      id
      address
      pickupEnabled
      deliveryEnabled
      deliveryPrice
      deliveryRadius
      location {
        lat
        lng
      }
      approximatePlace {
        lat
        lng
        address
      }
      project {
        id
        title
        address
        location {
          lat
          lng
        }
        approximatePlace {
          lat
          lng
          address
        }
      }
      shippingPrices {
        id
        maxWeight
        price
        provider
      }
    }
  }
`;

export default function Transportation() {
  const [addressEditLock, setAddressEditLock] = useState(false);

  const { data } = useQuery<TransportationQueryQuery>(TRANSPORTATION_QUERY, {
    onCompleted: (data) => {
      if (!data.getDraftedProduct) {
        console.error("No draft found");
        router.replace("/");
      }
    },
  });

  const onNext = () => {
    router.navigate("/sell-product/preview");
  };
  const progress = () => {
    const address =
      data?.getDraftedProduct?.project?.address ??
      data?.getDraftedProduct?.address;
    let progress = 0;

    if (data?.getDraftedProduct?.pickupEnabled) {
      progress += address ? 100 : 50;
    }
    if (data?.getDraftedProduct?.shippingPrices?.length) {
      progress += 100;
    }
    if (data?.getDraftedProduct?.deliveryEnabled) {
      progress +=
        address &&
        data.getDraftedProduct.deliveryRadius &&
        data.getDraftedProduct.deliveryPrice
          ? 100
          : 50;
    }

    return Math.min(100, Math.max(0, progress));
  };
  const canContinue = () => {
    if (addressEditLock) {
      return false;
    }
    if (!pickupValid && !deliveryValid && !shippingValid) {
      return false;
    }
    return true;
  };

  if (!data?.getDraftedProduct) {
    return <LoadingSpinner />;
  }

  const validAddress =
    data.getDraftedProduct.address || data.getDraftedProduct.project?.address;
  const pickupValid = data.getDraftedProduct.pickupEnabled && validAddress;
  const deliveryValid =
    data.getDraftedProduct.deliveryEnabled &&
    typeof data.getDraftedProduct.deliveryPrice === "number" &&
    data.getDraftedProduct.deliveryRadius &&
    validAddress;
  const shippingValid = !!data.getDraftedProduct.shippingPrices?.length;

  return (
    <ScreenLayout
      style={{ gap: 24, marginTop: 24 }}
      headerComponent={
        <ProgressHeader
          onClose={() =>
            router.canDismiss() ? router.dismiss() : router.replace("/")
          }
          title="Ny annons"
          prog3={progress()}
        />
      }
    >
      <Display size="small">Leverans</Display>
      <Headline size="small">Vilka leveransalternativ kan du erbjuda?</Headline>
      <View style={{ gap: 16, paddingBottom: 16 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Pickup
            productId={data.getDraftedProduct.id}
            canEdit={!addressEditLock}
            onEditing={() => setAddressEditLock(true)}
            onEditComplete={() => setAddressEditLock(false)}
          />
          <Shipping productId={data.getDraftedProduct.id} />
          <Delivery
            productId={data.getDraftedProduct.id}
            canEdit={!addressEditLock}
            onEditing={() => setAddressEditLock(true)}
            onEditComplete={() => setAddressEditLock(false)}
          />
        </Suspense>
      </View>
      <View
        style={{
          paddingTop: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Button
          icon="arrowLeft"
          label="Tillbaka"
          onPress={() => router.navigate("/sell-product/project")}
        />
        <Button
          label="Förhandsgranska"
          onPress={() => onNext()}
          style={{ flex: 1 }}
          disabled={!canContinue()}
          loading={false}
        />
      </View>
    </ScreenLayout>
  );
}
