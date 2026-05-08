import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Header } from "@components/navigation/headers/header";
import { Popup } from "@components/popup/popup";
import { Body, Display, Headline } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { View } from "react-native";

type Props = {
  show: boolean;
  onDismiss: () => void;
};

export const ExplainPayoutsBottomSheet = ({ show, onDismiss }: Props) => {
  const { isDesktop } = useScreenType();

  const content = (
    <View
      style={[
        { justifyContent: "space-between", flex: 1, marginBottom: 16 },
        isDesktop && { marginBottom: 0 },
      ]}
    >
      <View style={{ gap: 24 }}>
        <Display size="small">Hur utbetalningar fungerar på RebuildR</Display>
        <Body size="medium">
          Alla betalningar på RebuildR hanteras via Stripe Connect, en säker
          betalningslösning som ser till att pengarna hanteras tryggt genom hela
          affären. När en affär är genomförd och varan har godkänts av köparen
          initieras utbetalningen automatiskt till ditt konto.
        </Body>
        <View style={{ gap: 8 }}>
          <Headline size="small">1. Säker hantering av pengar</Headline>
          <Body size="medium">
            När köparen genomför sin betalning hålls pengarna säkert under
            affären.
          </Body>
          <Body size="medium">Det innebär att:</Body>
          <View>
            <Body size="medium">• pengarna reserveras vid köp</Body>
            <Body size="medium">
              • de hålls tills varan är överlämnad och godkänd
            </Body>
            <Body size="medium">
              • utbetalning sker först när affären är slutförd
            </Body>
          </View>
          <Body size="medium">
            Detta skapar trygghet för både köpare och säljare.
          </Body>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">2. När får jag mina pengar?</Headline>
          <Body size="medium">När köparen har:</Body>
          <View>
            <Body size="medium">• mottagit varan</Body>
            <Body size="medium">• godkänt köpet</Body>
          </View>
          <Body size="medium">påbörjas utbetalningen via Stripe.</Body>
          <Body size="medium">Utbetalningstiden är:</Body>
          <View>
            <Body size="medium">
              • upp till 7 arbetsdagar vid första utbetalningen
            </Body>
            <Body size="medium">• därefter normalt 2–3 arbetsdagar</Body>
          </View>
          <Body size="medium">
            Den första utbetalningen tar längre tid eftersom Stripe verifierar
            ditt konto.
          </Body>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">3. Utbetalningar sker automatiskt</Headline>
          <Body size="medium">
            Du behöver inte göra något själv för att få dina pengar.
          </Body>
          <Body size="medium">När affären är godkänd:</Body>
          <View>
            <Body size="medium">• startas utbetalningen automatiskt</Body>
            <Body size="medium">
              • pengarna skickas till det konto du kopplat via Stripe
            </Body>
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">4. Kommande: Stripe Instant Pay</Headline>
          <Body size="medium">
            Inom kort kommer du kunna välja att aktivera Stripe Instant Pay.
          </Body>
          <Body size="medium">Det innebär att:</Body>
          <View>
            <Body size="medium">
              • pengarna kommer in på kontot direkt efter att affären är godkänd
              och avslutad
            </Body>
            <Body size="medium">
              • du får tillgång till dina pengar utan väntetid
            </Body>
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">Kort sagt:</Headline>
          <Body size="medium">
            Pengarna hålls säkert under affären och betalas ut automatiskt när
            allt är klart – med möjlighet till direkt utbetalning framöver.
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
            title="Hur utbetalningar fungerar på RebuildR"
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
      name="payouts explanation"
      title="Hur utbetalningar fungerar på RebuildR"
      onDismiss={onDismiss}
      scrollable
    >
      {content}
    </BottomSheet>
  );
};
