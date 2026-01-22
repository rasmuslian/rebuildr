import { Button } from "@components/buttons/button";
import { Check } from "@components/controls/check";
import { Form } from "@components/forms/form";
import Map from "@components/maps/map";
import { Body, Title } from "@components/typography/text";
import { useLocationAddress } from "@hooks/useLocationAddress";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  address?: string;
  location?: { lat: number; lng: number };
  onSave: (lat: number, lng: number) => void;
  isLoading?: boolean;
};

export const EditPickup = ({
  address: _address,
  location: _location,
  onSave,
  isLoading,
}: Props) => {
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false);
  const [isMyLocation, setIsMyLocation] = useState(false);
  const {
    address,
    updateAddress,
    autoCompletes,
    selectAutoComplete,
    setMyLocation,
    location,
    setMapLocation,
  } = useLocationAddress({ address: _address, location: _location });
  const colors = useThemeColor();

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
  const onSelectMyLocation = () => {
    setIsMyLocation(!isMyLocation);
    if (!isMyLocation) {
      setMyLocation();
    }
  };
  const onMapMove = (lat: number, lng: number) => {
    setIsMyLocation(false);
    setMapLocation(lat, lng);
  };
  const onSaveAddress = () => {
    if (isLoading) {
      return;
    }
    onSave(location[0], location[1]);
  };

  return (
    <View style={{ gap: 24 }}>
      <Title size="medium">Plats för avhämtning</Title>
      <View style={{ gap: 14 }}>
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
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <Check selected={isMyLocation} onPress={onSelectMyLocation} />
            <Body size="medium">Använd min plats</Body>
          </View>
        )}
        <View style={{ gap: 12 }}>
          <Map lat={location[0]} lng={location[1]} onMoveEnd={onMapMove} />
          <Body size="small" color="secondary">
            Dra kartan för att flytta nålen till rätt plats. Du kan zooma in och
            ut genom att nypa med två fingrar.
          </Body>
        </View>
      </View>
      <Button
        label="Spara adress"
        onPress={onSaveAddress}
        disabled={!address}
        loading={isLoading}
      />
    </View>
  );
};
