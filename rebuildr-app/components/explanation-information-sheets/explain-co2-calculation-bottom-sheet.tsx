import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Header } from "@components/navigation/headers/header";
import { Popup } from "@components/popup/popup";
import { Body, Display, Headline, Label } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { View } from "react-native";

type Props = {
  show: boolean;
  onDismiss: () => void;
};

export const ExplainCO2CalculationSheet = ({ show, onDismiss }: Props) => {
  const { isDesktop } = useScreenType();

  const content = (
    <View
      style={[
        { justifyContent: "space-between", flex: 1, marginBottom: 16 },
        isDesktop && { marginBottom: 0 },
      ]}
    >
      <View style={{ gap: 24 }}>
        <Display size="small">Hur vi räknar CO₂</Display>
        <Body size="medium">
          När du väljer en återbrukad vara undviker du den klimatpåverkan som
          annars hade uppstått vid tillverkning av en ny motsvarande produkt. Vi
          använder en metod som följer samma principer som byggbranschen och
          Boverket.
        </Body>
        {/**Step 1 */}
        <View style={{ gap: 8 }}>
          <Headline size="small">
            1. Ny vara – klimatdata från EPD eller Boverkets klimatdatabas
          </Headline>
          <Body size="medium">
            För nya produkter utgår vi från klimatdata i:
          </Body>
          <View>
            <Body size="medium">
              • EPD (Environmental Product Declaration), när sådan finns, eller
            </Body>
            <Body size="medium">
              • Boverkets klimatdatabas med standardiserade branschvärden.
            </Body>
          </View>
          <Body size="medium">
            Dessa värden omfattar utsläpp från råvaruutvinning och tillverkning
            fram till färdig produkt (A1–A3 enligt EN 15804). Det är denna
            klimatbelastning som undviks vid återbruk.
          </Body>
        </View>
        {/**Step 2 */}
        <View style={{ gap: 8 }}>
          <Headline size="small">
            2. Återbrukad vara – mycket små utsläpp
          </Headline>
          <Body size="medium">
            För återbruk uppstår endast små utsläpp från:
          </Body>
          <View>
            <Body size="medium">• transport till köpare eller hubb</Body>
            <Body size="medium">
              • eventuell enklare hantering eller demontering
            </Body>
          </View>
          <Body size="medium">
            Ingen nyproduktion krävs, vilket gör klimatpåverkan mycket låg.
          </Body>
        </View>
        {/**Step 3 */}
        <View style={{ gap: 8 }}>
          <Headline size="small">
            3. Klimatbesparing – skillnaden mellan nytt och återbruk
          </Headline>
          <Body size="medium">Vi visar klimatbesparingen som:</Body>
          <Label size="large">
            Klimatbesparing = Utsläpp för ny produkt – Utsläpp för återbruk
          </Label>
          <Body size="medium">
            I praktiken innebär detta ofta en besparing på 90–99 % jämfört med
            att köpa nytt.
          </Body>
        </View>
      </View>
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
            justifyContent: "center",
          }}
        >
          <Header
            title="Hur vi räknar CO₂"
            showBackButton={false}
            showDivider
            ctas={[
              {
                icon: "X",
                onPress: onDismiss,
              },
            ]}
          />
          <View style={{ padding: 48, paddingTop: 24 }}>{content}</View>
        </View>
      </Popup>
    );
  }

  return (
    <BottomSheet
      open={show}
      name="co2 explanation"
      title="Hur vi räknar CO₂"
      onDismiss={onDismiss}
      scrollable
    >
      {content}
    </BottomSheet>
  );
};
