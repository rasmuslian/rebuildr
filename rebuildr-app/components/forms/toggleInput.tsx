import { Toggle, ToggleProps } from "@components/controls/toggle";
import { Body } from "@components/typography/text";
import { View } from "react-native";

export type Props = { explainer?: string } & ToggleProps;

export const ToggleInput = ({ explainer, ...props }: Props) => {
  return (
    <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
      <Body color="primaryDark" numberOfLines={3}>
        {explainer}
      </Body>
      <Toggle {...props} />
    </View>
  );
};
