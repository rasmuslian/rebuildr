import { Button, ButtonProps } from "@components/buttons/button";
import { Body, Headline } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";

export const EmptyStateCard = ({
  header,
  description,
  cta,
}: {
  header: string;
  description: string;
  cta?: ButtonProps;
}) => {
  const colors = useThemeColor();

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.medium,
      }}
    >
      <View style={{ maxWidth: 700, alignSelf: "center", gap: 16 }}>
        <Headline size="small" style={{ textAlign: "center" }}>
          {header}
        </Headline>
        <Body size="medium" style={{ textAlign: "center" }}>
          {description}
        </Body>
        {cta && <Button style={{ marginTop: 8 }} {...cta} />}
      </View>
    </View>
  );
};
