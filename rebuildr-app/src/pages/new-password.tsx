import { useMutation } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { isLoggedInVar } from "src/apollo/apollo";
import { Button } from "src/components/button";
import { HiddenInput } from "src/components/inputs/hiddenInput";
import { Page } from "src/components/page";
import { Body } from "src/components/texts/text";
import { gql } from "src/gql";

const NEW_PASSWORD = gql(`
  mutation NewPassword($input: NewPasswordInput!) {
    newPassword(input:$input) {
      accessToken
    }
  }
`);

export const NewPassword = ({ route }) => {
  const { navigate } = useNavigation();
  const [password, setPassword] = useState("");

  const [newPassword, { loading, error }] = useMutation(NEW_PASSWORD);

  const onRequestNewPassword = () => {
    if (loading) {
      return;
    }

    //TODO: verify password
    if (!password) {
      return;
    }

    const { email, token } = route.params;
    newPassword({
      variables: {
        input: { email: email, resetPasswordToken: token, password: password },
      },
      onCompleted: async (data) => {
        await AsyncStorage.setItem(
          "access_token",
          data.newPassword.accessToken,
        );
        isLoggedInVar(true);
      },
    });
  };

  return (
    <Page title="Skapa nytt lösenord">
      <Body>Ange nytt lösenord</Body>
      <HiddenInput
        onChange={setPassword}
        value={password}
        placeholder={"Lösenord"}
      />
      <Button title="Skicka" onPress={onRequestNewPassword} />
      {error && <Body>Något gick fel</Body>}
    </Page>
  );
};
