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

export const ExplainReviewsBottomSheet = ({ show, onDismiss }: Props) => {
  const { isDesktop } = useScreenType();

  const content = (
    <View
      style={[
        { marginBottom: 16 },
        //space-between + flex only fill the fixed-height desktop popup. On
        //mobile the sheet is dynamically sized, so flex: 1 would stretch this
        //to the full window and space-between would push the buttons far down.
        isDesktop && {
          justifyContent: "space-between",
          flex: 1,
          marginBottom: 0,
        },
      ]}
    >
      <View style={{ gap: 24 }}>
        <Display size="small">Hur omdömen fungerar på RebuildR</Display>
        <View style={{ gap: 8 }}>
          <Body size="medium">
            Omdömen är en central del av RebuildR och en viktig förutsättning
            för att skapa trygghet i varje affär.
          </Body>
          <Body size="medium">
            När en affär är genomförd är det obligatoriskt för både köpare och
            säljare att lämna ett omdöme. Det är en del av att avsluta affären –
            men du kan vara lugn, det är enkelt och tar bara några sekunder.
          </Body>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">1. Trygghet i varje affär</Headline>
          <Body size="medium">
            Genom omdömen blir det tydligt vem du handlar med. En användare med
            goda omdömen visar att affärer tidigare har genomförts på ett
            seriöst och tillförlitligt sätt.
          </Body>
          <Body size="medium">Det hjälper dig att:</Body>
          <View>
            <Body size="medium">• förstå vem du handlar med</Body>
            <Body size="medium">• känna dig trygg i beslutet</Body>
            <Body size="medium">• undvika osäkerhet i affären</Body>
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">2. Seriösa användare lyfts fram</Headline>
          <Body size="medium">
            Omdömen gör att vi kan premiera användare som:
          </Body>
          <View>
            <Body size="medium">• håller vad de lovar</Body>
            <Body size="medium">• kommunicerar tydligt</Body>
            <Body size="medium">• genomför affärer korrekt</Body>
          </View>
          <Body size="medium">
            Det gäller både köpare och säljare och bidrar till en marknadsplats
            där förtroende byggs över tid.
          </Body>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">3. En bättre marknadsplats för alla</Headline>
          <Body size="medium">Varje omdöme bidrar till att:</Body>
          <View>
            <Body size="medium">• öka transparensen</Body>
            <Body size="medium">• minska risken för missförstånd</Body>
            <Body size="medium">• stärka kvaliteten på plattformen</Body>
          </View>
          <Body size="medium">
            Omdömen är därför en viktig del av hur RebuildR fungerar – inte bara
            en funktion.
          </Body>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">Kort sagt:</Headline>
          <Body size="medium">
            Alla lämnar omdöme. Det går snabbt. Och det gör hela marknadsplatsen
            bättre och tryggare för alla.
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
            title="Hur omdömen fungerar på RebuildR"
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
      name="reviews explanation"
      title="Hur omdömen fungerar på RebuildR"
      onDismiss={onDismiss}
      scrollable
    >
      {content}
    </BottomSheet>
  );
};
