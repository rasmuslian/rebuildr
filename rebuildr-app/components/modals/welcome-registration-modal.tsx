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
  isBusiness?: boolean;
  isApproved?: boolean;
};

const ContactLink = () => (
  <Body size="medium" style={{ textAlign: "center" }}>
    {"Behöver du hjälp? "}
    <Body
      size="medium"
      isLink
      onPress={() => Linking.openURL("mailto:support@rebuildr.org")}
    >
      Kontakta oss
    </Body>
  </Body>
);

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

const WelcomeSteps = () => (
  <>
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
      <WelcomeSteps />
    </View>
  </View>
);

const BusinessApprovedWelcomeContent = () => (
  <View style={{ paddingBottom: 8, flex: 1 }}>
    <View style={{ alignItems: "center", marginBottom: 24, marginTop: 16 }}>
      <Image source={LogoIconLight} style={{ width: 127, height: 127 }} />
    </View>
    <View style={{ gap: 16 }}>
      <Display size="small" style={{ textAlign: "center" }}>
        Företagskontot är godkänt!
      </Display>
      <Title size="medium" style={{ textAlign: "center" }}>
        Ditt konto är klart — så här kommer du igång.
      </Title>
      <WelcomeSteps />
    </View>
  </View>
);

const BusinessPendingWelcomeContent = () => (
  <View style={{ paddingBottom: 8, flex: 1 }}>
    <View style={{ alignItems: "center", marginBottom: 24, marginTop: 16 }}>
      <View style={{ alignItems: "center", marginBottom: 24, marginTop: 16 }}>
        <Image source={LogoIconLight} style={{ width: 127, height: 127 }} />
      </View>
    </View>
    <View style={{ gap: 24 }}>
      <Display size="small" style={{ textAlign: "center" }}>
        Företagskontot är skapat!
      </Display>
      <Body size="medium" style={{ textAlign: "center" }}>
        {
          "Tack! Vi går nu igenom och verifierar uppgifterna för ditt företagskonto. Du får ett mejl så snart kontot är godkänt — "
        }
        <Title size="medium">vanligtvis inom 24 timmar.</Title>
      </Body>
      <Body size="medium" style={{ textAlign: "center" }}>
        Du kan logga in på ditt företagskonto först när verifieringen är klar.
      </Body>
    </View>
  </View>
);

export const WelcomeRegistrationModal = ({
  open,
  onClose,
  onCreateListing,
  isBusiness,
  isApproved,
}: Props) => {
  const { isDesktop } = useScreenType();

  const isPendingBusiness = isBusiness && !isApproved;

  const title = isPendingBusiness
    ? "Skapa ditt nya företagkonto"
    : "Välkommen till RebuildR!";
  const content = !isBusiness ? (
    <WelcomeContent />
  ) : isApproved ? (
    <BusinessApprovedWelcomeContent />
  ) : (
    <BusinessPendingWelcomeContent />
  );
  const footer = isPendingBusiness ? (
    <ContactLink />
  ) : (
    <WelcomeFooter onCreateListing={onCreateListing} />
  );

  if (isDesktop) {
    return (
      <Popup
        open={open}
        onClose={onClose}
        type="partial"
        footer={
          <View style={{ padding: 16, paddingBottom: 24 }}>{footer}</View>
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
            title={title}
            showBackButton={false}
            ctas={[{ icon: "X", onPress: onClose }]}
          />
          {content}
        </View>
      </Popup>
    );
  }

  return (
    <BottomSheet
      name="welcome-registration"
      title={title}
      open={open}
      onDismiss={onClose}
      scrollable
      screenHeight
      isStickyFooter
      footer={footer}
    >
      {content}
    </BottomSheet>
  );
};
