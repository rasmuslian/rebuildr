import { Button } from "@components/buttons/button";
import { Body, Display, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useBankIdVerify } from "@hooks/useBankIdVerify";
import { useThemeColor } from "@hooks/useThemeColor";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type Props = {
  onSuccess: () => void;
};

export const VerifyBankId = ({ onSuccess }: Props) => {
  const colors = useThemeColor();
  const {
    step,
    qrData,
    initiating,
    handleSameDevice,
    handleOtherDevice,
    handleRetry,
  } = useBankIdVerify({ onResult: onSuccess });

  return (
    <View style={{ gap: 24 }}>
      {step === "idle" && (
        <>
          <Display size="small">Verifiera företaget med BankID</Display>
          <Body size="medium">
            Innan ditt företagskonto kan godkännas behöver vi verifiera att du
            har rätt att företräda företaget. Legitimera dig med BankID för att
            fortsätta.
          </Body>
          <View
            style={{
              backgroundColor: colors.buttons.tonal.enabled,
              borderRadius: borderRadius.medium,
              padding: 16,
              gap: 16,
            }}
          >
            <Label size="large">Det här händer när du verifierar dig</Label>
            <View>
              <Body size="small">
                • Vi kontrollerar dina firmatecknarrättigheter hos Creditsafe
              </Body>
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
          <Display size="small">Väntar på BankID</Display>
          <Body size="medium">
            Öppna BankID-appen på din enhet och följ instruktionerna där.
          </Body>
          <Button label="Avbryt" type="tonal" onPress={handleRetry} />
        </>
      )}

      {step === "qr" && (
        <>
          <Display size="small">BankID på annan enhet</Display>
          <Body size="medium">
            Öppna BankID-appen på din andra enhet, tryck på QR-ikonen och scanna
            koden nedan.
          </Body>
          <View style={{ alignItems: "center" }}>
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
          <Display size="small">Verifieringen misslyckades</Display>
          <Body size="medium">
            Något gick fel. Försök igen eller kontakta support om problemet
            kvarstår.
          </Body>
          <Button label="Försök igen" onPress={handleRetry} />
        </>
      )}
    </View>
  );
};
