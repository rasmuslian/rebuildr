import { Button } from "@components/buttons/button";
import { Body, Display } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { View } from "react-native";

type Props = {
  onSubmit: () => void;
  onBack: () => void;
  currentEmail: string;
};

export default function ForgotPassword({
  onSubmit,
  onBack,
  currentEmail,
}: Props) {
  const { isDesktop } = useScreenType();

  return (
    <View>
      <Display style={{ marginBottom: isDesktop ? 24 : 16 }} size="small">
        Har du glömt ditt lösenord?
      </Display>
      <Body size="medium">
        Klicka på knappen så skickar vi en länk för återställning till:
      </Body>
      <Body size="medium" style={{ fontFamily: "Poppins-SemiBold" }}>
        {currentEmail}
      </Body>
      <Button
        style={{ marginTop: isDesktop ? 48 : 24 }}
        label="Beställ nytt lösenord"
        onPress={() => onSubmit()}
      />
    </View>
  );
}
