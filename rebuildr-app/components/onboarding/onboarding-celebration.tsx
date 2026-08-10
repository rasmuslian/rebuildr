import { View } from "react-native";
import { Button } from "@components/buttons/button";
import { Body, Headline } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { primitives } from "@constants/colors";

export const OnboardingCelebration = ({
  onDismiss,
}: {
  onDismiss: () => void;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      backgroundColor: primitives.primary200,
      borderRadius: borderRadius.medium,
    }}
  >
    <View style={{ flex: 1, gap: 4 }}>
      <Headline size="small">Klart — du är igång! 🎉</Headline>
      <Body size="medium" color="secondary">
        Du har allt på plats. Lycka till med försäljningen!
      </Body>
    </View>
    <Button icon="X" type="text" onPress={onDismiss} />
  </View>
);
