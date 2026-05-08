import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Header } from "@components/navigation/headers/header";
import { Popup } from "@components/popup/popup";
import { Body, Display, Headline } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { Linking, View } from "react-native";

type Props = {
  show: boolean;
  onDismiss: () => void;
};

export const ExplainCancelPurchaseBottomSheet = ({
  show,
  onDismiss,
}: Props) => {
  const { isDesktop } = useScreenType();

  const content = (
    <View
      style={[
        { justifyContent: "space-between", flex: 1, marginBottom: 16 },
        isDesktop && { marginBottom: 0 },
      ]}
    >
      <View style={{ gap: 24 }}>
        <Display size="small">Avbryta ett köp</Display>
        <View style={{ gap: 8 }}>
          <Body size="medium">
            Det finns såklart olika anledningar till att ett köp behöver
            avbrytas. Så länge det sker på ett korrekt sätt är det en naturlig
            del av en marknadsplats.
          </Body>
          <Body size="medium">
            {
              "Om du däremot misstänker att något inte står rätt till – exempelvis kring en annons, en köpare eller en säljare – ber vi dig att rapportera detta till oss genom att mejla "
            }
            <Body
              size="medium"
              isLink
              onPress={() => Linking.openURL("mailto:support@rebuildr.org")}
            >
              support@rebuildr.org
            </Body>
            . Vi prioriterar alltid ärenden där misstanke om bedrägeri eller
            brott finns.
          </Body>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">Viktigt att tänka på</Headline>
          <Body size="medium">
            Det är inte tillåtet att använda köpflödet för att "reservera" varor
            genom att genomföra ett köp med avsikt att senare avbryta det.
          </Body>
          <Body size="medium">
            Att sätta detta i system eller på annat sätt missbruka köp- och
            säljflödet strider mot våra regler och kan leda till att kontot
            stängs av.
          </Body>
        </View>
        <View style={{ gap: 8 }}>
          <Headline size="small">Kort sagt:</Headline>
          <Body size="medium">
            Avbryt köp vid behov – men använd funktionen ansvarsfullt och
            rapportera misstänkta beteenden.
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
            title="Avbryta ett köp"
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
      name="cancel purchase explanation"
      title="Avbryta ett köp"
      onDismiss={onDismiss}
    >
      {content}
    </BottomSheet>
  );
};
