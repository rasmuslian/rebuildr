import { Button } from "@components/buttons/button";
import { Headline } from "@components/typography/text";
import { IconType } from "@icons/icon";
import { View } from "react-native";

type Props = {
  children: string;
  onPress?: () => void;
  icon?: IconType;
};

export const SectionHeader = ({ children, onPress, icon: _icon }: Props) => {
  const icon: IconType = _icon ?? "arrowRight";
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Headline size="small">{children}</Headline>
      {onPress ? (
        <Button icon={icon} type="text" onPress={onPress} />
      ) : (
        <View style={{ height: 40 }} />
      )}
    </View>
  );
};
