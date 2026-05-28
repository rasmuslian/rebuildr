import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Display } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { useState } from "react";
import { View } from "react-native";
import { z } from "zod";

type Props = {
  onSubmit: (email: string) => void;
  initialEmail?: string;
};

export default function Email({ onSubmit, initialEmail }: Props) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [error, setError] = useState(false);
  const { isDesktop } = useScreenType();

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
      <Display style={{ marginBottom: isDesktop ? 24 : 16 }} size="small">
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
            onKeyPress(e) {
              if (e.nativeEvent.key === "Enter") {
                onEnterEmail(email);
              }
            },
            error: "Felaktig e-postadress",
          },
        ]}
      />
      <Button
        style={{ marginTop: isDesktop ? 48 : 24 }}
        label="Logga in / Skapa konto"
        onPress={() => onEnterEmail(email)}
      />
    </View>
  );
}
