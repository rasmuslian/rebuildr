import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Popup } from "@components/popup/popup";
import { Body, Display, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { useBankIdVerify } from "@hooks/useBankIdVerify";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type Props = {
  show: boolean;
  onDismiss: () => void;
  onResult: () => void;
  context?: "buy" | "publish";
};

const introCopy = {
  buy: {
    title: "Verifiera dig för att slutföra köpet",
    body: "För att genomföra köp på RebuildR behöver du verifiera dig med BankID. Det gör att alla affärer sker mellan verifierade användare.",
  },
  publish: {
    title: "Verifiera dig för att publicera",
    body: "För att publicera annonser på RebuildR behöver du verifiera dig med BankID. Det gör att alla affärer sker mellan verifierade användare.",
  },
};

export const VerifyMeBottomSheet = ({
  show,
  onDismiss,
  onResult,
  context = "buy",
}: Props) => {
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();
  const {
    step,
    qrData,
    initiating,
    handleSameDevice,
    handleOtherDevice,
    handleRetry,
    reset,
  } = useBankIdVerify({ onResult });

  const handleDismiss = () => {
    reset();
    onDismiss();
  };

  useEffect(() => {
    if (!show || Platform.OS !== "web") {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleDismiss();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [show]);

  const content = (
    <>
      {step === "idle" && (
        <>
          <Display size="small" style={{ marginBottom: 24 }}>
            {introCopy[context].title}
          </Display>

          <Body size="medium" style={{ marginBottom: 32 }}>
            {introCopy[context].body}
          </Body>

          <View
            style={{
              backgroundColor: colors.buttons.tonal.enabled,
              borderRadius: borderRadius.medium,
              padding: 16,
              gap: 16,
              marginBottom: 32,
            }}
          >
            <Label size="large">Det här händer när du verifierar dig</Label>
            <View>
              <Body size="small">
                • Säkrare handel mellan verifierade parter
              </Body>
              <Body size="small">• Personnummer hashas, ej i klartext</Body>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Button
              label="Verifiera med BankID"
              loading={initiating}
              onPress={handleSameDevice}
            />
            <Button
              label="BankID på annan enhet"
              type="tonal"
              loading={initiating}
              onPress={handleOtherDevice}
            />
          </View>
        </>
      )}

      {step === "waiting" && (
        <>
          <Display size="small" style={{ marginBottom: 24 }}>
            Väntar på BankID
          </Display>

          <Body size="medium" style={{ marginBottom: 32 }}>
            Öppna BankID-appen på din enhet och följ instruktionerna där.
          </Body>

          <Button label="Avbryt" type="tonal" onPress={handleRetry} />
        </>
      )}

      {step === "qr" && (
        <>
          <Display size="small" style={{ marginBottom: 16 }}>
            BankID på annan enhet
          </Display>

          <Body size="medium" style={{ marginBottom: 24 }}>
            Öppna BankID-appen på din andra enhet, tryck på QR-ikonen och scanna
            koden nedan.
          </Body>

          <View style={{ alignItems: "center", marginBottom: 32 }}>
            {qrData ? (
              <QRCode value={qrData} size={200} />
            ) : (
              <View style={{ width: 200, height: 200 }} />
            )}
          </View>

          <Button label="Avbryt" type="tonal" onPress={handleRetry} />
        </>
      )}

      {step === "failed" && (
        <>
          <Display size="small" style={{ marginBottom: 24 }}>
            Verifieringen misslyckades
          </Display>

          <Body size="medium" style={{ marginBottom: 32 }}>
            Något gick fel. Försök igen eller kontakta support om problemet
            kvarstår.
          </Body>

          <View style={{ gap: 8 }}>
            <Button label="Försök igen" onPress={handleRetry} />
            <Button label="Avbryt" type="tonal" onPress={handleDismiss} />
          </View>
        </>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <Popup open={show} onClose={handleDismiss}>
        <View style={{ padding: 24 }}>
          <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
            <Button icon="X" onPress={handleDismiss} type="text" />
          </View>
          {content}
        </View>
      </Popup>
    );
  }

  return (
    <BottomSheet
      title="BankID-verifiering"
      open={show}
      name="BankID"
      onDismiss={handleDismiss}
    >
      {content}
    </BottomSheet>
  );
};
