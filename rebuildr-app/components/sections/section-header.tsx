import { Button } from "@components/buttons/button";
import { Headline } from "@components/typography/text";
import { View } from "react-native";

type Props = {
  children: string;
  onPress?: () => void;
};

export const SectionHeader = ({ children, onPress }: Props) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Headline size="small">{children}</Headline>
      {!!onPress && <Button icon="arrowRight" type="text" onPress={onPress} />}
    </View>
  );
};
