import { TransportationQueryQuery } from "@/gql/graphql";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Href, router } from "expo-router";
import { Suspense, useState } from "react";
import { ProgressHeader } from "./progress-header";
import { Display, Headline } from "@components/typography/text";
import { View } from "react-native";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Pickup } from "@components/transport/pickup";
import { Shipping } from "@components/transport/shipping";
import { Delivery } from "@components/transport/delivery";
import { Button } from "@components/buttons/button";

type Props = {
  product: Exclude<
    TransportationQueryQuery["getDraftedProduct"],
    null | undefined
  >;
  title: string;
  nextUrl: Href;
  onDismiss: () => void;
};

export const TransportationScreen = ({
  product: dbProduct,
  title,
  nextUrl,
  onDismiss,
}: Props) => {
  const [addressEditLock, setAddressEditLock] = useState(false);
  const [shippingValid, setShippingValid] = useState(false);
  const [shippingSelected, setShippingSelected] = useState(
    !!dbProduct.shippingPrices?.length,
  );

  const onNext = () => {
    router.navigate(nextUrl);
  };
  const progress = () => {
    const address = dbProduct.project?.address ?? dbProduct.address;
    let progress = 0;

    if (dbProduct.pickupEnabled) {
      progress += address ? 100 : 50;
    }
    if (dbProduct.shippingPrices?.length) {
      progress += 100;
    }
    if (dbProduct.deliveryEnabled) {
      progress +=
        address && dbProduct.deliveryRadius && dbProduct.deliveryPrice
          ? 100
          : 50;
    }

    return Math.min(100, Math.max(0, progress));
  };
  const canContinue = () => {
    if (addressEditLock) {
      return false;
    }

    const validAddress = dbProduct.address || dbProduct.project?.address;
    const pickupSelected = dbProduct.pickupEnabled;
    const pickupValid = validAddress;
    const deliverySelected = dbProduct.deliveryEnabled;
    const deliveryValid =
      typeof dbProduct.deliveryPrice === "number" &&
      dbProduct.deliveryRadius &&
      validAddress;

    if (pickupSelected && !pickupValid) {
      return false;
    }
    if (deliverySelected && !deliveryValid) {
      return false;
    }
    if (shippingSelected && !shippingValid) {
      return false;
    }

    return true;
  };

  return (
    <ScreenLayout
      style={{ gap: 24, marginTop: 24 }}
      headerComponent={
        <ProgressHeader onClose={onDismiss} title={title} prog3={progress()} />
      }
      footerComponent={
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
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          />
          <Button
            label="Förhandsgranska"
            onPress={() => onNext()}
            style={{ flex: 1 }}
            disabled={!canContinue()}
            loading={false}
          />
        </View>
      }
    >
      <Display size="small">Leverans</Display>
      <Headline size="small">Vilka leveransalternativ kan du erbjuda?</Headline>
      <View style={{ gap: 16, paddingBottom: 16 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Pickup
            productId={dbProduct.id}
            canEdit={!addressEditLock}
            onEditing={() => setAddressEditLock(true)}
            onEditComplete={() => setAddressEditLock(false)}
          />
          <Shipping
            productId={dbProduct.id}
            onShippingValid={(valid) => setShippingValid(valid)}
            shippingSelected={shippingSelected}
            onShippingSelected={(selected) => setShippingSelected(selected)}
          />
          <Delivery
            productId={dbProduct.id}
            canEdit={!addressEditLock}
            onEditing={() => setAddressEditLock(true)}
            onEditComplete={() => setAddressEditLock(false)}
          />
        </Suspense>
      </View>
    </ScreenLayout>
  );
};
