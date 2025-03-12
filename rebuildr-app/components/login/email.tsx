import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Display, Title } from "@components/typography/text";
import { LoginModalContext } from "@context/loginModalContext";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useContext, useState } from "react";
import { Pressable, View } from "react-native";
import { z } from "zod";

type Props = {
  onSubmit: (email: string) => void;
  initialEmail?: string;
};

export default function Email({ onSubmit, initialEmail }: Props) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [error, setError] = useState(false);
  const colors = useThemeColor();
  const { setVisible } = useContext(LoginModalContext);

  const onEnterEmail = (email: string) => {
    const result = z.string().email().safeParse(email);
    if (result.error) {
      setError(true);
    }
    if (result.success) {
      onSubmit(email);
    }
  };

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
        <Title size="medium">Logga in eller skapa konto</Title>
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
          Skriv in din e-post för att fortsätta
        </Display>
        <Form
          fields={[
            {
              type: "text",
              heading: "E-postadress",
              onChangeText: (text) => {
                if (error) {
                  setError(false);
                }
                setEmail(text);
              },
              value: email,
              error,
            },
          ]}
        />
        <Button
          style={{ marginTop: 24 }}
          label="Logga in / Skapa konto"
          onPress={() => onEnterEmail(email)}
        />
      </View>
    </View>
  );
}
