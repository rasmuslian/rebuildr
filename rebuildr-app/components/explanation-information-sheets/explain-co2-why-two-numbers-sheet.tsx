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
    }}
  >
    <Label size="small">{text}</Label>
  </View>
);

export const ExplainCO2WhyTwoNumbersSheet = ({ show, onDismiss }: Props) => {
  const { isDesktop } = useScreenType();
  const colors = useThemeColor();

  const content = (
    <View style={{ gap: 24 }}>
      <Label size="large">Vikt × utsläppsfaktor. Det är hela formeln.</Label>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Badge text="A1 - A3" backgroundColor={colors.navigation.enabled} />
          <Label size="large">Köper du återbrukat</Label>
        </View>
        <Body size="small">
          slipper världen tillverka nytt. Besparingen är varans vikt gånger vad
          nytillverkningen hade släppt ut. Faktorn kommer från Boverkets
          klimatdatabas.
        </Body>
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Badge text="C2–C4" backgroundColor={colors.logo.background} />
          <Label size="large">Säljer du vidare</Label>
        </View>
        <Body size="small">
          går materialet till återbruk istället för till soptippen. Besparingen
          är samma vikt gånger vad transport och deponi hade släppt ut. Faktorn
          kommer från den europeiska databasen Ökobaudat.
        </Body>

        <Body size="small">
          Exempel: 55 kg träpaneler ger köparen 42 kg CO₂ i undvikt
          nytillverkning och säljaren 18,5 kg i undvikt deponi. Två besparingar
          från två olika delar av varans livscykel. Ingen siffra räknas dubbelt.
        </Body>
      </View>

      <Body size="small" color="secondary">
        Metodiken följer EN 15978 och IVL:s handledning för klimatberäkning av
        återbruk (2020). Transporten mellan säljare och köpare ingår inte.
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
            title="Så beräknar vi CO₂-besparingen"
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
      title="Så beräknar vi CO₂-besparingen"
      onDismiss={onDismiss}
    >
      {content}
    </BottomSheet>
  );
};
