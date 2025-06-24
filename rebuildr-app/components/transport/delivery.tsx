import {
  DeliveryQueryQuery,
  DeliveryQueryQueryVariables,
  DeliveryUpdateMutation,
  DeliveryUpdateMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation, useSuspenseQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Check } from "@components/controls/check";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { Map } from "@components/maps/map";
import { Body, Label, Title } from "@components/typography/text";
import { useLocationAddress } from "@hooks/useLocationAddress";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { defaultRadius } from "@constants/map";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { meterToKilometer } from "@/utils/conversions";
import { Slider } from "@components/slider/slider";

const DELIVERY_QUERY = gql`
  query DeliveryQuery($input: GetProductInput!) {
    product(input: $input) {
      id
      address
      deliveryRadius
      deliveryPrice
      deliveryEnabled
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
    }
  }
`;

const DELIVERY_UPDATE = gql`
  mutation DeliveryUpdate($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        id
        address
        deliveryRadius
        deliveryPrice
        deliveryEnabled
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
      }
    }
  }
`;

type Props = {
  productId: string;
  canEdit: boolean;
  onEditing: () => void;
  onEditComplete: () => void;
};

export const Delivery = ({
  productId,
  canEdit,
  onEditing,
  onEditComplete,
}: Props) => {
  const [_price, setPrice] = useState<number>();
  const [_radius, setRadius] = useState<number>();
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false);
  const [isMyLocation, setIsMyLocation] = useState(false);
  const colors = useThemeColor();
  const { data } = useSuspenseQuery<
    DeliveryQueryQuery,
    DeliveryQueryQueryVariables
  >(DELIVERY_QUERY, {
    variables: { input: { id: productId } },
  });
  const [updateDelivery, { loading: updatingDelivery }] = useMutation<
    DeliveryUpdateMutation,
    DeliveryUpdateMutationVariables
  >(DELIVERY_UPDATE);

  const radius = _radius ?? data.product.deliveryRadius ?? defaultRadius;
  const price = _price ?? data.product.deliveryPrice ?? 0;
  const _location = data.product.project
    ? {
        lat: data.product.project.location.lat,
        lng: data.product.project.location.lng,
      }
    : data.product.location
      ? { lat: data.product.location.lat, lng: data.product.location.lng }
      : undefined;
  const [isEditing, setIsEditing] = useState(!_location);

  const {
    address,
    updateAddress,
    location,
    setMyLocation,
    setMapLocation,
    autoCompletes,
    selectAutoComplete,
  } = useLocationAddress({
    address: data.product.project?.address ?? data.product.address ?? undefined,
    location: _location,
  });

  const approximateAddress =
    data.product.project?.approximatePlace.address ??
    data.product.approximatePlace?.address;

  const onBlurPrice = () => {
    if (updatingDelivery) {
      return;
    }

    updateDelivery({
      variables: {
        input: {
          id: productId,
          deliveryPrice: price,
        },
      },
    });
  };
  const onSetRadius = (r: number) => {
    setRadius(r);
  };
  const onChangeRadius = (radius: number) => {
    if (updatingDelivery) {
      return;
    }
    updateDelivery({
      variables: {
        input: {
          id: productId,
          deliveryRadius: Math.round(radius),
        },
      },
    });
  };
  const onUpdateAddress = (s: string) => {
    setIsMyLocation(false);
    setShowLocationsDropdown(true);
    updateAddress(s);
  };
  const onSelectAutoComplete = (s: string) => {
    setIsMyLocation(false);
    setShowLocationsDropdown(false);
    selectAutoComplete(s);
  };
  const onMapMove = (lat: number, lng: number) => {
    setIsMyLocation(false);
    setMapLocation(lat, lng);
  };
  const onSelectMyLocation = () => {
    setIsMyLocation(!isMyLocation);
    if (!isMyLocation) {
      setMyLocation();
    }
  };
  const onSaveAddress = () => {
    if (updatingDelivery) {
      return;
    }
    updateDelivery({
      variables: {
        input: {
          id: productId,
          location: { lat: location[0], lng: location[1] },
        },
      },
      onCompleted: () => {
        onEditComplete();
        setIsEditing(false);
      },
    });
  };
  const onSelectDelivery = () => {
    if (updatingDelivery) {
      return;
    }
    updateDelivery({
      variables: {
        input: {
          id: productId,
          deliveryEnabled: !data.product.deliveryEnabled,
          deliveryPrice: price,
          deliveryRadius: Math.round(radius),
        },
      },
    });
  };

  return (
    <ToggleCard
      title="Hemtransport"
      description="Du erbjuder hemtransport och levererar produkten direkt till köparen."
      onPress={onSelectDelivery}
      enabled={data.product.deliveryEnabled}
    >
      <View>
        <View style={{ gap: 24 }}>
          <View style={{ gap: 12 }}>
            <Form
              fields={[
                {
                  type: "price",
                  value: price,
                  onChange: (p) => setPrice(p),
                  onBlur: () => onBlurPrice(),
                  heading: "Transportpris",
                },
              ]}
            />
            <Body size="small" color="secondary">
              Transportpriset tillkommer på varans pris och innefattar alla
              kostnader. Inbärning av produkten ingår endast om det har avtalats
              i förväg.
            </Body>
          </View>
          <Divider />

          <View>
            <Title size="medium">Hur långt kan du åka?</Title>
            {data.product.project && !isEditing && (
              <Body size="medium" style={{ marginTop: 4 }}>
                Annonsen är kopplad till projektet "{data.product.project.title}
                ", vilket innebär att hemleveransen utgår från:
              </Body>
            )}
          </View>
          {!isEditing && data.product.project && (
            <View style={{ gap: 12 }}>
              <View>
                <Label size="medium">Adress</Label>
                <Body size="medium" style={{ marginTop: 4 }}>
                  {approximateAddress}
                </Body>
              </View>
              <Body size="small" color="secondary">
                Köparen ser inte projektets exakta adress ({address}), bara ett
                ungefärligt område på kartan enligt nedan. Din adress visas
                först när ett köp har genomförts.
              </Body>
            </View>
          )}
          <View style={{ gap: 12 }}>
            <Label size="medium">Välj max avstånd för hemtransport</Label>
            <View
              style={{ flexDirection: "row", gap: 16, alignItems: "center" }}
            >
              <Slider
                type="continuous"
                sliderProps={{
                  min: 1000,
                  max: 80000,
                  value: radius,
                  onChange: onSetRadius,
                  width: 240,
                  onRelease: (r) => onChangeRadius(r),
                }}
              />
              <Body size="medium">{meterToKilometer(radius)} km</Body>
            </View>
          </View>
          <View style={{ gap: 12 }}>
            <Map
              lat={location[0]}
              lng={location[1]}
              interactive={isEditing}
              zoom={10}
              radius={radius}
              onMoveEnd={onMapMove}
            />
            {isEditing && (
              <Body size="small" color="secondary">
                Dra kartan för att flytta nålen till rätt plats. Du kan zooma in
                och ut genom att nypa med två fingrar.
              </Body>
            )}
          </View>
          {!isEditing && !data.product.project && (
            <View style={{ gap: 12 }}>
              <View>
                <Label size="medium">Adress</Label>
                <Body size="medium" style={{ marginTop: 4 }}>
                  {approximateAddress}
                </Body>
              </View>
              <Body size="small" color="secondary">
                Köparen ser inte din exakta adress ({address}), bara ett
                ungefärligt område på kartan enligt nedan. Din adress visas
                först när ett köp har genomförts.
              </Body>
            </View>
          )}
          {isEditing && (
            <View style={{ gap: 24 }}>
              <View style={{ gap: 12 }}>
                <Form
                  fields={[
                    {
                      type: "text",
                      onChange: onUpdateAddress,
                      value: address,
                      heading: "Adress",
                      description:
                        "Köparen ser inte din exakta adress, bara ett ungefärligt område på kartan. Din adress visas först när ett köp har genomförts.",
                    },
                  ]}
                />
                {!!autoCompletes.length && showLocationsDropdown && (
                  <View style={{ gap: 6 }}>
                    {autoCompletes.map((data, i) => (
                      <Pressable
                        key={i}
                        onPress={() => {
                          onSelectAutoComplete(data);
                        }}
                        style={
                          i !== 0 && {
                            borderColor: colors.dividers.neutral,
                            borderTopWidth: 1,
                            paddingTop: 4,
                          }
                        }
                      >
                        <Body size="medium" color="secondary" numberOfLines={1}>
                          {data}
                        </Body>
                      </Pressable>
                    ))}
                  </View>
                )}
                {(!autoCompletes.length || !showLocationsDropdown) && (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 16,
                      alignItems: "center",
                    }}
                  >
                    <Check
                      selected={isMyLocation}
                      onPress={onSelectMyLocation}
                    />
                    <Body size="medium">Använd min plats</Body>
                  </View>
                )}
              </View>
              <Button label="Spara adress" onPress={onSaveAddress} />
            </View>
          )}
          {!isEditing && (
            <View style={{ gap: 12 }}>
              <Button
                label="Ändra adress"
                onPress={() => {
                  if (canEdit) {
                    setIsEditing(true);
                    onEditing();
                  }
                }}
                type="tonal"
                disabled={!canEdit}
              />
              {data.product.project && (
                <Body
                  size="small"
                  style={{ textAlign: "center" }}
                  color="secondary"
                >
                  Ändring av adress tar bort kopplingen till projektet "
                  {data.product.project.title}".
                </Body>
              )}
            </View>
          )}
        </View>
      </View>
    </ToggleCard>
  );
};
