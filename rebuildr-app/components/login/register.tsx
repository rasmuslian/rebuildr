import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Display } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { z } from "zod";

type Props = {
  onSubmit: (email: string) => void;
  initialEmail?: string;
  loading?: boolean;
};

export default function Register({ onSubmit, initialEmail, loading }: Props) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    const result = z.string().email().safeParse(email);
    if (!result.success) {
      setError(true);
      return;
    }
    onSubmit(email);
  };

  return (
    <View style={{ gap: 16 }}>
      <Display size="small">Skriv in din e-post för att fortsätta</Display>
      <Form
        fields={[
          {
            type: "text",
            heading: "Ange din e-postadress",
            value: email,
            onChangeText: (text) => {
              if (error) setError(false);
              setEmail(text);
            },
            error: error ? "Felaktig e-postadress" : undefined,
          },
        ]}
      />
      <Button
        label="Fortsätt"
        onPress={handleSubmit}
        loading={loading}
        disabled={email.length === 0}
      />
    </View>
  );
}
