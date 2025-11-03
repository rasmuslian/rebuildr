import { Button } from "@components/buttons/button";
import { Headline } from "@components/typography/text";
import { IconType } from "@icons/icon";
import { View } from "react-native";

type Props = {
  children: string;
  onPress?: () => void;
  icon?: IconType;
  buttonTitle?: string;
};

export const SectionHeader = ({
  children,
  onPress,
  icon: _icon,
  buttonTitle,
}: Props) => {
  const icon: IconType = _icon ?? "arrowRight";

  let button = <Button icon={icon} type="text" onPress={onPress} />;
  if (buttonTitle) {
    button = <Button type="tonal" onPress={onPress} label={buttonTitle} />;
  }
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Headline size="small">{children}</Headline>
      {onPress ? button : <View style={{ height: 40 }} />}
    </View>
  );
};
