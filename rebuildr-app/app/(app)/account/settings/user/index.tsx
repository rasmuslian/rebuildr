import {
  AccountSettingsUpdateUserMutation,
  AccountSettingsUpdateUserMutationVariables,
  AccountSettingsUserQuery,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { CreatePassword } from "@components/login/create-password";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline, Title } from "@components/typography/text";
import { PropsWithChildren, useState } from "react";
import { View } from "react-native";
import * as z from "zod";
import { formatPostCode, formatSwedishNumber } from "@/utils/formattings";
import { apolloBadFieldsError } from "@/utils/apollo-errors";

const ACCOUNT_SETTINGS_USER_FRAGMENT = gql`
  fragment AccountSettingsUserFragment on User {
    id
    email
    username
    phoneNumber
    name
    address
    postCode
    city
  }
`;

const ACCOUNT_SETTINGS_USER = gql`
  query AccountSettingsUser {
    me {
      ...AccountSettingsUserFragment
    }
  }
  ${ACCOUNT_SETTINGS_USER_FRAGMENT}
`;

const ACCOUNT_SETTINGS_UPDATE_USER = gql`
  mutation AccountSettingsUpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        ...AccountSettingsUserFragment
      }
    }
  }
  ${ACCOUNT_SETTINGS_USER_FRAGMENT}
`;

export default function User() {
  const [email, setEmail] = useState<string | null>(null);
  const [errorEmail, setErrorEmail] = useState<string>();

  const [password, setPassword] = useState<string | null>(null);
  const [passwordValid, setPasswordValid] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const [name, setName] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [postCode, setPostCode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const { data } = useQuery<AccountSettingsUserQuery>(ACCOUNT_SETTINGS_USER);
  const [updateUser, { loading: updateUserLoading, error }] = useMutation<
    AccountSettingsUpdateUserMutation,
    AccountSettingsUpdateUserMutationVariables
  >(ACCOUNT_SETTINGS_UPDATE_USER);

  const onSaveEmail = () => {
    if (!data || updateUserLoading) {
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
            id: data.me.id,
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

  const onSaveDetails = () => {
    if (!data || (!passwordValid && !username) || updateUserLoading) {
      return null;
    }

    updateUser({
      variables: {
        input: {
          id: data.me.id,
          username: username === data.me.username ? undefined : username,
          password: password ? password : undefined,
        },
      },
      onCompleted: () => {
        setEmail(null);
        setPassword(null);
      },
      onError: () => {},
    });
  };

  const onSaveHomeDetails = () => {
    if (
      !data ||
      updateUserLoading ||
      (!name && !phoneNumber && !address && !postCode && !city)
    ) {
      return null;
    }

    updateUser({
      variables: {
        input: {
          id: data.me.id,
          name: name ? name : undefined,
          phoneNumber: phoneNumber ? phoneNumber : undefined,
          address: address ? address : undefined,
          postCode: postCode ? postCode : undefined,
          city: city ? city : undefined,
        },
      },
      onCompleted: () => {
        setName(null);
        setPhoneNumber(null);
        setAddress(null);
        setPostCode(null);
        setCity(null);
      },
      onError: () => {},
    });
  };

  if (!data) {
    return <LoadingSpinner />;
  }

  const hasHomeDetails =
    !!data.me.city &&
    !!data.me.address &&
    !!data.me.postCode &&
    !!data.me.name &&
    !!data.me.phoneNumber;

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
    <ScreenLayout headerComponent={<Header title="Kontaktuppgifter" />}>
      <Display size="small" style={{ marginBottom: 40 }}>
        Hantera e-post, inlogg och adresser
      </Display>
      <View style={{ gap: 16 }}>
        {email === null ? (
          <Entry
            title="Din e-post"
            onPress={() => {
              setEmail(data.me.email ?? "");
            }}
            isSet={!!data.me.email}
          >
            <Body size="medium" color="secondary">
              {data.me.email ?? "Ange din e-post"}
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
        <Divider />
        {password === null || username === null ? (
          <Entry
            title="Kontodetaljer"
            onPress={() => {
              setUsername(data.me.username ?? "");
              setPassword("");
            }}
            isSet={!!data.me.username}
          >
            <Body size="medium" color="secondary">
              Användarnamn: {data.me.username}
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
              disabled={username === data.me.username && !passwordValid}
            />
            {detailsError().map((e, i) => (
              <Body size="small" color="error" key={i}>
                {e}
              </Body>
            ))}
          </View>
        )}
        <Divider />
        {name === null ||
        phoneNumber === null ||
        address === null ||
        postCode === null ||
        city === null ? (
          <Entry
            title="Leveransadress"
            onPress={() => {
              setName(data.me.name ?? "");
              setPhoneNumber(data.me.phoneNumber ?? "");
              setAddress(data.me.address ?? "");
              setPostCode(data.me.postCode ?? "");
              setCity(data.me.city ?? "");
            }}
            isSet={hasHomeDetails}
          >
            {!hasHomeDetails ? (
              <Body size="medium" color="secondary">
                Lägg till adressen dit du vill få varor skickade.
              </Body>
            ) : (
              <View>
                <Body size="medium" color="secondary">
                  {data.me.name}
                </Body>
                <Body size="medium" color="secondary">
                  {formatSwedishNumber(data.me.phoneNumber ?? "")}
                </Body>
                <Body size="medium" color="secondary">
                  {data.me.address}
                  {data.me.postCode
                    ? ", " + formatPostCode(data.me.postCode)
                    : null}{" "}
                  {data.me.city}
                </Body>
              </View>
            )}
          </Entry>
        ) : (
          <View style={{ gap: 16 }}>
            <Headline size="small">Leveransadress</Headline>
            <Body size="medium">
              Den adress vi använder om du väljer frakt eller hemtransport i ett
              köp.
            </Body>
            <Form
              style={{ gap: 16 }}
              fields={[
                {
                  type: "text",
                  value: name,
                  onChange: (t) => setName(t),
                  heading: "För- och efternamn",
                },
                {
                  type: "text",
                  value: phoneNumber,
                  onChange: (t) => setPhoneNumber(t),
                  heading: "Telefonnummer",
                },
                {
                  type: "text",
                  value: address,
                  onChange: (t) => setAddress(t),
                  heading: "Gatuadress",
                },
                {
                  type: "text",
                  value: postCode,
                  onChange: (t) => setPostCode(t),
                  heading: "Postnummer",
                  horizontalSize: 1,
                },
                {
                  type: "text",
                  value: city,
                  onChange: (t) => setCity(t),
                  heading: "Stad",
                  horizontalSize: 2,
                },
              ]}
            />
            <Button
              label="Spara"
              onPress={onSaveHomeDetails}
              disabled={
                name === data.me.name &&
                phoneNumber === data.me.phoneNumber &&
                address === data.me.address &&
                postCode === data.me.postCode &&
                city === data.me.city
              }
            />
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}

type EntryProps = {
  title: string;
  onPress: () => void;
  isSet: boolean;
} & PropsWithChildren;

const Entry = ({ title, onPress, isSet, children }: EntryProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Title size="medium">{title}</Title>
        {children}
      </View>
      <Button
        type={isSet ? "tonal" : "filled"}
        label={isSet ? "Ändra" : "Lägg till"}
        onPress={onPress}
      />
    </View>
  );
};
