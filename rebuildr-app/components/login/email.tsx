import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Body, Display } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { z } from "zod";

type Props = {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: (email: string) => void;
  onCreatePersonalAccount: (email: string) => void;
  onCreateBusinessAccount?: (email: string) => void;
  wrongPassword?: boolean;
  loading?: boolean;
  initialEmail?: string;
};

export default function Email({
  onLogin,
  onForgotPassword,
  onCreatePersonalAccount,
  onCreateBusinessAccount,
  wrongPassword,
  loading,
  initialEmail,
}: Props) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  const isEmailValid = z.string().email().safeParse(email).success;
  const canLogin = isEmailValid && password.length > 0;

  const handleLogin = () => {
    if (!isEmailValid) {
      setEmailError(true);
      return;
    }
    onLogin(email, password);
  };

  return (
    <View style={{ gap: isDesktop ? 24 : 16 }}>
      <Display size="small">Logga in eller skapa ett privat konto</Display>
      <Form
        fields={[
          {
            type: "text",
            heading: "E-postadress",
            value: email,
            onChangeText: (text) => {
              if (emailError) setEmailError(false);
              setEmail(text);
            },
            error: emailError ? "Felaktig e-postadress" : undefined,
          },
          {
            type: "masked",
            heading: "Lösenord",
            value: password,
            onChangeText: setPassword,
            error: wrongPassword ? "Felaktig epost eller lösenord" : undefined,
          },
        ]}
      />
      <Pressable onPress={() => onForgotPassword(email)}>
        <Body
          color="link"
          size="small"
          style={{
            textDecorationLine: "underline",
            textDecorationColor: colors.text.link,
          }}
        >
          Har du glömt lösenordet?
        </Body>
      </Pressable>
      <Button
        label="Logga in"
        onPress={handleLogin}
        loading={loading}
        disabled={!canLogin}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginVertical: 4,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colors.dividers.neutral,
          }}
        />
        <Body size="small" color="secondary">
          eller
        </Body>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colors.dividers.neutral,
          }}
        />
      </View>
      <View style={{ gap: 8 }}>
        <Button
          type="outlined"
          label="Skapa ett privat konto"
          onPress={() => onCreatePersonalAccount(email)}
        />
        {onCreateBusinessAccount && (
          <Button
            type="outlined"
            label="Skapa ett företagskonto"
            onPress={() => onCreateBusinessAccount(email)}
          />
        )}
      </View>
    </View>
  );
}
