import { useLocationAddress } from "@hooks/useLocationAddress";
import { View } from "react-native";
import { useEffect, useState } from "react";
import { Check } from "@components/controls/check";
import { Body } from "@components/typography/text";
import { Pressable } from "react-native-gesture-handler";
import { BaseFieldProps, Form } from "../forms/form";
import { useThemeColor } from "@hooks/useThemeColor";

export type Props = {
  changeAddress: (address: string) => void;
} & BaseFieldProps;

export const AddressAutoCompleteInput = ({
  changeAddress,
  ...baseFieldProps
}: Props) => {
  const colors = useThemeColor();
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false);
  const [isMyLocation, setIsMyLocation] = useState(false);
  const {
    address,
    updateAddress,
    setMyLocation,
    autoCompletes,
    selectAutoComplete,
  } = useLocationAddress();
  const onSelectAutoComplete = (s: string) => {
    setIsMyLocation(false);
    setShowLocationsDropdown(false);
    selectAutoComplete(s);
    changeAddress(s);
  };
  const onUpdateAddress = (s: string) => {
    setIsMyLocation(false);
    setShowLocationsDropdown(true);
    const address = updateAddress(s);
    changeAddress(address);
  };
  const onSelectMyLocation = () => {
    setIsMyLocation(!isMyLocation);
    if (!isMyLocation) {
      setMyLocation();
    }
  };

  useEffect(() => {
    changeAddress(address);
  }, [address]);

  return (
    <View style={{ gap: 12 }}>
      <Form
        fields={[
          {
            type: "text",
            onChange: onUpdateAddress,
            value: address,
            ...baseFieldProps,
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
          <Check selected={isMyLocation} onPress={onSelectMyLocation} />
          <Body size="medium">Använd min plats</Body>
        </View>
      )}
    </View>
  );
};
