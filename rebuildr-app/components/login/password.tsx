import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Body, Display, Title } from "@components/typography/text";
import { LoginModalContext } from "@context/loginModalContext";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useContext, useState } from "react";
import { Pressable, View } from "react-native";

type Props = {
  onSubmit: (password: string) => void;
  onBack: () => void;
  onForgotPassword: () => void;
  wrongPassword: boolean;
};

export default function Password({
  onSubmit,
  onBack,
  onForgotPassword,
  wrongPassword,
}: Props) {
  const [password, setPassword] = useState("");
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
        <Display style={{ marginBottom: 16 }} size="small">
          Hej igen!
        </Display>
        <Form
          fields={[
            {
              type: "text",
              masked: true,
              heading: "Lösenord",
              onChangeText: (text) => setPassword(text),
              value: password,
              error: wrongPassword,
            },
          ]}
        />
        <Pressable onPress={onForgotPassword}>
          <Body
            color="link"
            style={{
              textDecorationLine: "underline",
              textDecorationColor: colors.text.link,
              marginTop: 12,
            }}
            size="small"
          >
            Har du glömt lösenordet?
          </Body>
        </Pressable>
        <Button
          style={{ marginTop: 24 }}
          label="Logga in"
          onPress={() => onSubmit(password)}
        />
      </View>
    </View>
  );
}
