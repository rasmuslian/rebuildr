import { Button } from "@components/buttons/button";
import { Title } from "@components/typography/text";
import { PropsWithChildren } from "react";
import { View } from "react-native";

type EntryProps = {
  title: string;
  onPress: () => void;
  isSet: boolean;
} & PropsWithChildren;

export const Entry = ({ title, onPress, isSet, children }: EntryProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Title size="medium">{title}</Title>
        {children}
      </View>
      <Button
        type={isSet ? "tonal" : "filled"}
        label={isSet ? "Ändra" : "Lägg till"}
        onPress={onPress}
      />
    </View>
  );
};
