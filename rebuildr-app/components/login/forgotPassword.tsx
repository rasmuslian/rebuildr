import { Button } from "@components/buttons/button";
import { Title } from "@components/typography/text";
import { LoginModalContext } from "@context/loginModalContext";
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
        <Title size="small">
          Klicka på knappen så skickar vi en länk för återställning till:
          {currentEmail}
        </Title>
        <Button
          style={{ marginTop: 24 }}
          label="Logga in / Skapa konto"
          onPress={() => onSubmit()}
        />
      </View>
    </View>
  );
}
