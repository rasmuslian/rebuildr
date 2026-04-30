import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Body, Display } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { Pressable, View } from "react-native";

type Props = {
  onSubmit: (password: string) => void;
  onForgotPassword: () => void;
  wrongPassword: boolean;
  loading?: boolean;
};

export default function Password({
  onSubmit,
  onForgotPassword,
  wrongPassword,
  loading,
}: Props) {
  const [password, setPassword] = useState("");
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  return (
    <View>
      <Display style={{ marginBottom: isDesktop ? 24 : 16 }} size="small">
        Hej igen!
      </Display>
      <Form
        fields={[
          {
            type: "masked",
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
        loading={loading}
        style={{ marginTop: isDesktop ? 48 : 24 }}
        label="Logga in"
        onPress={() => onSubmit(password)}
      />
    </View>
  );
}
