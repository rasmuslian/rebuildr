import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Popup } from "@components/popup/popup";
import { Header } from "@components/navigation/headers/header";
import { Body, Label } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";

type Props = {
  show: boolean;
  onDismiss: () => void;
};

const Badge = ({
  text,
  backgroundColor,
}: {
  text: string;
  backgroundColor: string;
}) => (
  <View
    style={{
      backgroundColor,
      borderRadius: 4,
      paddingHorizontal: 6,
      justifyContent: "center",
      alignSelf: "flex-start",
    }}
  >
    <Label size="small">{text}</Label>
  </View>
);

export const ExplainCO2WhyTwoNumbersSheet = ({ show, onDismiss }: Props) => {
  const { isDesktop } = useScreenType();
  const colors = useThemeColor();

  const introText =
    "Vi delar upp klimatnyttan för att undvika dubbelräkning. Köparen tar credit för att ny produktion undveks, säljaren tar credit för att materialet slapp deponi. Det är två olika delar av livscykeln — de överlappar aldrig.";

  const content = (
    <View style={{ gap: 24 }}>
      <Body size="small">{introText}</Body>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Badge text="A1 - A3" backgroundColor={colors.navigation.enabled} />
          <Label size="large">Köparens del · undvikt nyproduktion.</Label>
        </View>
        <Body size="small">{introText}</Body>
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Badge text="C2–C4" backgroundColor={colors.logo.background} />
          <Label size="large">Säljarens del · undvikt deponi.</Label>
        </View>
        <Body size="small">
          Transport till avfallsanläggning, deponigas (främst metan) och
          avfallsförbränning. Räknas bort eftersom materialet inte slängdes.
        </Body>
      </View>

      <Body size="small" color="secondary">
        Metodiken följer EN 15978 och IVL:s handledning Återbrukets
        klimateffekter vid byggnation (2020). Transport från säljare till köpare
        (A4) ingår inte i 1.0.
      </Body>
    </View>
  );

  if (isDesktop) {
    return (
      <Popup open={show} onClose={onDismiss}>
        <View
          style={{
            paddingTop: 16,
            paddingBottom: 24,
            paddingHorizontal: 24,
          }}
        >
          <Header
            title="Varför två siffror?"
            showBackButton={false}
            showDivider
            ctas={[{ icon: "X", onPress: onDismiss }]}
          />
          <View style={{ paddingTop: 24 }}>{content}</View>
        </View>
      </Popup>
    );
  }

  return (
    <BottomSheet
      open={show}
      name="co2 explanation"
      title="Varför två siffror?"
      onDismiss={onDismiss}
    >
      {content}
    </BottomSheet>
  );
};
