import { Button } from "@components/buttons/button";
import { Body, Label } from "@components/typography/text";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  label: string;
  body: string;
  onPress: () => void;
};

export const LinkEntry = ({ label, body, onPress }: Props) => {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ gap: 2, flex: 1 }}>
          <Label size="large">{label}</Label>
          <Body size="small">{body}</Body>
        </View>
        <Button icon="arrowRight" type="text" onPress={onPress} />
      </View>
    </Pressable>
  );
};
