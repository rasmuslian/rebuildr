import { Check, CheckProps } from "@components/controls/check";
import { Body } from "@components/typography/text";
import { View } from "react-native";

export type Props = { explainer?: string } & CheckProps;

export const CheckboxInput = ({ explainer, ...props }: Props) => {
  return (
    <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
      <Body color="primaryDark" numberOfLines={3}>
        {explainer}
      </Body>
      <Check {...props} />
    </View>
  );
};
