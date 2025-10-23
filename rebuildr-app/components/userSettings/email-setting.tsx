import {
  AccountSettingsUserQuery,
  AccountSettingsUpdateUserMutation,
  AccountSettingsUpdateUserMutationVariables,
} from "@/gql/graphql";
import { apolloBadFieldsError } from "@/utils/apollo-errors";
import { useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Body, Headline } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import z from "zod";
import { Entry } from "./entry";
import { ACCOUNT_SETTINGS_UPDATE_USER } from "./queries";

type Props = {
  user: AccountSettingsUserQuery["me"];
};
export const EmailSetting = ({ user }: Props) => {
  const [email, setEmail] = useState<string | null>(null);
  const [errorEmail, setErrorEmail] = useState<string>();

  const [updateUser, { loading: updateUserLoading }] = useMutation<
    AccountSettingsUpdateUserMutation,
    AccountSettingsUpdateUserMutationVariables
  >(ACCOUNT_SETTINGS_UPDATE_USER);

  const onSaveEmail = () => {
    if (updateUserLoading) {
      return null;
    }
    const result = z.string().email().safeParse(email);
    setErrorEmail(undefined);
    if (result.error) {
      setErrorEmail("Felaktig e-post");
    }
    if (result.success) {
      updateUser({
        variables: {
          input: {
            id: user.id,
            email,
          },
        },
        onCompleted: () => {
          setEmail(null);
        },
        onError: (error) => {
          const errors = error ? apolloBadFieldsError(error) : undefined;
          const emailError = errors?.find((field) => field.name === "email");
          setErrorEmail(
            emailError?.type === "VALUE_TAKEN"
              ? "E-postadressen är upptagen"
              : "Något gick fel",
          );
        },
      });
    }
  };

  return (
    <View style={{ gap: 16 }}>
      {email === null ? (
        <Entry
          title="Din e-post"
          onPress={() => {
            setEmail(user.email ?? "");
          }}
          isSet={!!user.email}
        >
          <Body size="medium" color="secondary">
            {user.email ?? "Ange din e-post"}
          </Body>
        </Entry>
      ) : (
        <>
          <Headline size="small">Din e-post</Headline>
          <Form
            fields={[
              {
                type: "text",
                value: email,
                onChange: (t) => setEmail(t),
                error: !!errorEmail,
                heading: "Ange din e-postadress",
              },
            ]}
          />
          <Button
            label="Spara"
            onPress={onSaveEmail}
            loading={updateUserLoading}
          />
          {!!errorEmail && (
            <Body size="small" color="error">
              {errorEmail}
            </Body>
          )}
        </>
      )}
    </View>
  );
};
