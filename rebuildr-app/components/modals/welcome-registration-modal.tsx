import { Image } from "expo-image";
import { Linking, ScrollView, View } from "react-native";
import LogoIcon from "@assets/images/logo-icon.png";
import { Button } from "@components/buttons/button";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Popup } from "@components/popup/popup";
import { Header } from "@components/navigation/headers/header";
import { Body, Display, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreateListing: () => void;
};

const WelcomeContent = ({
  onCreateListing,
}: {
  onCreateListing: () => void;
}) => (
  <View style={{ paddingBottom: 8 }}>
    <View style={{ alignItems: "center", marginBottom: 24, marginTop: 16 }}>
      <View
        style={{
          width: 127,
          height: 127,
          borderRadius: 100,
          backgroundColor: primitives.primary200,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image source={LogoIcon} style={{ width: 41, height: 57 }} />
      </View>
    </View>
    <View style={{ gap: 16 }}>
      <Display size="small" style={{ textAlign: "center" }}>
        Välkommen till RebuildR!
      </Display>
      <Title size="medium" style={{ textAlign: "center" }}>
        Ditt konto är klart — så här kommer du igång.
      </Title>
      <View style={{ gap: 4 }}>
        <Title size="small">Lägg upp din första annons.</Title>
        <Body size="medium" color="secondary">
          När profilen är klar är du redo att börja sälja.
        </Body>
      </View>
      <View style={{ gap: 4 }}>
        <Title size="small">Komplettera din profil.</Title>
        <Body size="medium" color="secondary">
          Lägg till en profilbild och en kort presentation — det ökar
          tryggheten och dina chanser att sälja.
        </Body>
      </View>
      <View style={{ gap: 4 }}>
        <Title size="small">Aktivera utbetalningar.</Title>
        <Body size="medium" color="secondary">
          Registrera ditt utbetalningskonto hos vår betalpartner Stripe så är
          du redo att få betalt när du sålt en vara.
        </Body>
      </View>
    </View>
    <Button
      label="Lägg upp annons"
      onPress={onCreateListing}
      style={{ marginTop: 24 }}
    />
    <Body size="medium" style={{ textAlign: "center", marginTop: 16 }}>
      {"Behöver du hjälp? "}
      <Body
        size="medium"
        isLink
        onPress={() => Linking.openURL("mailto:support@rebuildr.org")}
      >
        Kontakta oss
      </Body>
    </Body>
  </View>
);

export const WelcomeRegistrationModal = ({
  open,
  onClose,
  onCreateListing,
}: Props) => {
  const { isDesktop } = useScreenType();

  if (isDesktop) {
    return (
      <Popup open={open} onClose={onClose} type="partial">
        <View style={{ padding: 16 }}>
          <Header
            title="Välkommen till RebuildR!"
            showBackButton={false}
            ctas={[{ icon: "X", onPress: onClose }]}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            <WelcomeContent onCreateListing={onCreateListing} />
          </ScrollView>
        </View>
      </Popup>
    );
  }

  return (
    <BottomSheet
      name="welcome-registration"
      title="Välkommen till RebuildR!"
      open={open}
      onDismiss={onClose}
      scrollable
    >
      <WelcomeContent onCreateListing={onCreateListing} />
    </BottomSheet>
  );
};
