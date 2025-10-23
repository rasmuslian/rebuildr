import {
  AccountSettingsUserQuery,
  AccountSettingsUpdateUserMutation,
  AccountSettingsUpdateUserMutationVariables,
} from "@/gql/graphql";
import { apolloBadFieldsError } from "@/utils/apollo-errors";
import { useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { CreatePassword } from "@components/login/create-password";
import { Body, Headline } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { Entry } from "./entry";
import { ACCOUNT_SETTINGS_UPDATE_USER } from "./queries";

type Props = {
  user: AccountSettingsUserQuery["me"];
};
export const AccountSetting = ({ user }: Props) => {
  const [password, setPassword] = useState<string | null>(null);
  const [passwordValid, setPasswordValid] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [updateUser, { loading: updateUserLoading, error }] = useMutation<
    AccountSettingsUpdateUserMutation,
    AccountSettingsUpdateUserMutationVariables
  >(ACCOUNT_SETTINGS_UPDATE_USER);

  const onSaveDetails = () => {
    if ((!passwordValid && !username) || updateUserLoading) {
      return null;
    }

    updateUser({
      variables: {
        input: {
          id: user.id,
          username: username === user.username ? undefined : username,
          password: password ? password : undefined,
        },
      },
      onCompleted: () => {
        setPassword(null);
        setUsername(null);
      },
    });
  };

  const detailsError = () => {
    const errors = error ? apolloBadFieldsError(error) : undefined;
    const usernameError = errors?.find((field) => field.name === "username");
    const errorTexts = [];
    if (usernameError) {
      errorTexts.push("Användarnamnet är upptaget");
    }
    const passwordError = errors?.find((field) => field.name === "password");
    if (passwordError) {
      errorTexts.push("Felaktigt lösenord");
    }
    return errorTexts;
  };
  return (
    <View style={{ gap: 16 }}>
      {password === null || username === null ? (
        <Entry
          title="Kontodetaljer"
          onPress={() => {
            setUsername(user.username ?? "");
            setPassword("");
          }}
          isSet={!!user.username}
        >
          <Body size="medium" color="secondary">
            Användarnamn: {user.username}
          </Body>
          <Body size="medium" color="secondary">
            Lösenord: {"•".repeat(8)}
          </Body>
        </Entry>
      ) : (
        <View style={{ gap: 16 }}>
          <Headline size="small">Kontodetaljer</Headline>
          <View style={{ gap: 24 }}>
            <Form
              fields={[
                {
                  type: "text",
                  heading: "Användarnamn",
                  description:
                    "Ditt användarnamn är det namn som visas på din publika profil.",
                  value: username,
                  onChange: (v) => setUsername(v),
                  disabled: updateUserLoading,
                },
              ]}
            />
            <CreatePassword
              password={password ?? ""}
              onChangePassword={(p) => setPassword(p)}
              onChangeValidity={setPasswordValid}
              loading={updateUserLoading}
            />
          </View>
          <Button
            label="Spara"
            onPress={onSaveDetails}
            disabled={username === user.username && !passwordValid}
          />
          {detailsError().map((e, i) => (
            <Body size="small" color="error" key={i}>
              {e}
            </Body>
          ))}
        </View>
      )}
    </View>
  );
};
