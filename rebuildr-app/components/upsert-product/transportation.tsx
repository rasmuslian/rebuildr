import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Display } from "@components/typography/text";
import { Suspense, useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@components/buttons/button";
import { Pickup } from "./pickup";
import { Shipping } from "./shipping";
import { Delivery } from "./delivery";
import { ProjectChips } from "./project-chips";
import { AvailabilitySection } from "./availability-section";
import { InternalLocation } from "./internal-location";
import { ProductFields } from "./types";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  product: ProductFields;
  update: (product: Partial<ProductFields>) => void;
  onNext: () => void;
  onBack: () => void;
  nextIsDisabled: boolean;
  loading?: boolean;
  badFields?: { [key: string]: string };
  updateProgress: (progress: number) => void;
  internalMode?: boolean;
  nextLabel?: string;
  onInternalLocationSaveStart?: () => void;
  hideActions?: boolean;
  hideAvailability?: boolean;
};

export const Transportation = ({
  product,
  update,
  onNext,
  onBack,
  nextIsDisabled,
  loading = false,
  badFields,
  updateProgress,
  internalMode = false,
  nextLabel,
  onInternalLocationSaveStart,
  hideActions = false,
  hideAvailability = false,
}: Props) => {
  const { isDesktop } = useScreenType();
  const [addressEditLock, setAddressEditLock] = useState(false);
  const [shippingValid, setShippingValid] = useState(false);
  const [shippingSelected, setShippingSelected] = useState(
    !!product.shippingPrices?.length,
  );

  useEffect(() => {
    updateProgress(progress());
  }, [
    product.address,
    product.pickupEnabled,
    product.shippingPrices,
    product.deliveryRadius,
    product.deliveryPrice,
    shippingSelected,
    addressEditLock,
    product.location,
    product.project,
  ]);
  const progress = () => {
    if (internalMode) {
      return product.project || product.location ? 100 : 0;
    }

    const address = product.address;
    let nrMethodsChosen = 0;
    let progress = 0;

    if (product.pickupEnabled) {
      progress += address && !addressEditLock ? 100 : 50;
      nrMethodsChosen += 1;
    }
    if (shippingSelected) {
      progress += product.shippingPrices?.length ? 100 : 50;
      nrMethodsChosen += 1;
    }

    if (product.deliveryEnabled) {
      progress += address && !addressEditLock ? 100 : 50;
      nrMethodsChosen += 1;
    }

    progress = progress / nrMethodsChosen;

    return Math.min(100, Math.max(0, progress));
  };

  const canContinue = () => {
    if (internalMode) {
      return !!product.project || !!product.location;
    }

    if (addressEditLock) {
      return false;
    }

    const validAddress = product.address;
    const pickupSelected = product.pickupEnabled;
    const pickupValid = validAddress;
    const deliverySelected = product.deliveryEnabled;
    const deliveryValid =
      typeof product.deliveryPrice === "number" &&
      product.deliveryRadius &&
      validAddress;

    if (!pickupSelected && !deliverySelected && !shippingSelected) {
      return false;
    }
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
    <View style={{ gap: 24, marginTop: 24 }}>
      <ProjectChips
        product={product}
        update={update}
        internalMode={internalMode}
      />
      {internalMode ? (
        !product.project && (
          <InternalLocation
            product={product}
            update={update}
            onSaveStart={onInternalLocationSaveStart}
            error={product.location ? undefined : badFields?.["location"]}
          />
        )
      ) : (
        <>
          <Display size="small">Leverans</Display>
          <View style={{ gap: 16, paddingBottom: 16 }}>
            <Suspense fallback={<LoadingSpinner />}>
              <Pickup
                product={product}
                update={update}
                canEdit={!addressEditLock}
                onEditing={() => setAddressEditLock(true)}
                onEditComplete={() => setAddressEditLock(false)}
              />
              <Shipping
                product={product}
                update={update}
                onShippingValid={(valid) => setShippingValid(valid)}
                shippingSelected={shippingSelected}
                onShippingSelected={(selected) => setShippingSelected(selected)}
              />
              <Delivery
                product={product}
                update={update}
                canEdit={!addressEditLock}
                onEditing={() => setAddressEditLock(true)}
                onEditComplete={() => setAddressEditLock(false)}
                error={badFields?.["delivery"]}
              />
            </Suspense>
          </View>
        </>
      )}
      {!hideAvailability && (
        <AvailabilitySection
          product={product}
          update={update}
          error={badFields?.["availability"]}
        />
      )}
      {!hideActions && (
        <View
          style={[
            {
              paddingTop: 24,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            },
            isDesktop && {
              position: "sticky",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              backgroundColor: "white",
              paddingBottom: 32,
            },
          ]}
        >
          <Button icon="arrowLeft" label="Tillbaka" onPress={() => onBack()} />
          <Button
            label={nextLabel ?? "Förhandsgranska"}
            onPress={() => onNext()}
            style={{ flex: 1 }}
            disabled={!canContinue() || nextIsDisabled}
            loading={loading}
          />
        </View>
      )}
    </View>
  );
};
