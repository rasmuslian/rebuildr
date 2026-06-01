import { Image } from "expo-image";
import { Linking, View } from "react-native";
import LogoIconLight from "@assets/svgs/logo-icon-light.svg";
import { Button } from "@components/buttons/button";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Popup } from "@components/popup/popup";
import { Header } from "@components/navigation/headers/header";
import { Body, Display, Title } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreateListing: () => void;
};

const WelcomeFooter = ({
  onCreateListing,
}: {
  onCreateListing: () => void;
}) => (
  <>
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
  </>
);

const WelcomeContent = () => (
  <View style={{ paddingBottom: 8, flex: 1 }}>
    <View style={{ alignItems: "center", marginBottom: 24, marginTop: 16 }}>
      <Image source={LogoIconLight} style={{ width: 127, height: 127 }} />
    </View>
    <View style={{ gap: 16 }}>
      <Display size="small" style={{ textAlign: "center" }}>
        Välkommen till RebuildR!
      </Display>
      <Title size="medium" style={{ textAlign: "center" }}>
        Ditt konto är klart — så här kommer du igång.
      </Title>
      <View style={{ gap: 4 }}>
        <Title size="small" style={{ textAlign: "center" }}>
          Lägg upp din första annons.
        </Title>
        <Body size="medium" style={{ textAlign: "center" }}>
          När profilen är klar är du redo att börja sälja.
        </Body>
      </View>
      <View style={{ gap: 4 }}>
        <Title size="small" style={{ textAlign: "center" }}>
          Komplettera din profil.
        </Title>
        <Body size="medium" style={{ textAlign: "center" }}>
          Lägg till en profilbild och en kort presentation — det ökar tryggheten
          och dina chanser att sälja.
        </Body>
      </View>
      <View style={{ gap: 4 }}>
        <Title size="small" style={{ textAlign: "center" }}>
          Aktivera utbetalningar.
        </Title>
        <Body size="medium" style={{ textAlign: "center" }}>
          Registrera ditt utbetalningskonto hos vår betalpartner Stripe så är du
          redo att få betalt när du sålt en vara.
        </Body>
      </View>
    </View>
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
      <Popup
        open={open}
        onClose={onClose}
        type="partial"
        footer={
          <View style={{ padding: 16, paddingBottom: 24 }}>
            <WelcomeFooter onCreateListing={onCreateListing} />
          </View>
        }
      >
        <View
          style={{
            padding: 16,
            paddingBottom: 24,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
        >
          <Header
            title="Välkommen till RebuildR!"
            showBackButton={false}
            ctas={[{ icon: "X", onPress: onClose }]}
          />
          <WelcomeContent />
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
      screenHeight
      isStickyFooter
      footer={<WelcomeFooter onCreateListing={onCreateListing} />}
    >
      <WelcomeContent />
    </BottomSheet>
  );
};
