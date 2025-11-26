import { Button } from "@components/buttons/button";
import { Body, Display, Title } from "@components/typography/text";
import { LoginModalContext } from "@context/loginModalContext";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useContext } from "react";
import { Pressable, View } from "react-native";

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
  const colors = useThemeColor();
  const { setVisible } = useContext(LoginModalContext);
  const { isDesktop } = useScreenType();

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: colors.dividers.neutral,
          paddingBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Pressable onPress={onBack}>
            <Icon icon="arrowLeft" size={18} />
          </Pressable>
          <Title size="medium">Logga in</Title>
        </View>
        <Pressable onPress={() => setVisible(false)}>
          <Icon icon="X" size={18} />
        </Pressable>
      </View>
      <View
        style={{
          paddingTop: 24,
          paddingBottom: 32,
        }}
      >
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
    </View>
  );
}
