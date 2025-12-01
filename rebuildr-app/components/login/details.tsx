import {
  DetailsQueryQuery,
  UpdateDetailsFieldsMutation,
  UpdateDetailsFieldsMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Check } from "@components/controls/check";
import { Toggle } from "@components/controls/toggle";
import { Form } from "@components/forms/form";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import {
  Body,
  Display,
  Headline,
  Label,
  Title,
} from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { CreatePassword } from "./create-password";
import { useScreenType } from "@hooks/useScreenType";

const DETAILS_QUERY = gql`
  query DetailsQuery {
    me {
      id
      email
    }
  }
`;

const UPDATE_DETAILS_FIELDS = gql`
  mutation UpdateDetailsFields($input: FinalizeUserInput!) {
    finalizeUser(input: $input) {
      id
      username
    }
  }
`;

type Props = {
  onDone: () => void;
  onCreateBusiness: () => void;
  onExit: () => void;
};
export const Details = ({ onDone, onCreateBusiness, onExit }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dontCreateBusiness, setDontCreateBusiness] = useState(false);
  const [createBusiness, setCreateBusiness] = useState(false);

  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  const { data } = useQuery<DetailsQueryQuery>(DETAILS_QUERY);
  const [updateDetails, { data: updateDetailsData, reset, loading }] =
    useMutation<
      UpdateDetailsFieldsMutation,
      UpdateDetailsFieldsMutationVariables
    >(UPDATE_DETAILS_FIELDS);

  const canContinue = () => {
    const usernameCorrect = !!username;
    return (
      passwordValid &&
      usernameCorrect &&
      termsAccepted &&
      !loading &&
      (!updateDetailsData || dontCreateBusiness || createBusiness)
    );
  };

  const onProceed = () => {
    if (loading) {
      return;
    }
    if (!updateDetailsData) {
      updateDetails({
        variables: {
          input: {
            username,
            password,
          },
        },
      });
      return;
    }

    if (dontCreateBusiness) {
      onDone();
      return;
    }

    if (createBusiness) {
      onCreateBusiness();
    }
  };

  if (!data?.me) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <Display size="small" style={{ marginBottom: 24 }}>
          Kom igång
        </Display>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: colors.dividers.neutral,
            paddingVertical: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <View style={{ gap: 4 }}>
              <Title size="medium">Din e-post</Title>
              <Body size="medium" color="secondary">
                {data.me.email}
              </Body>
            </View>
            <Button label="Ändra" disabled />
          </View>
          <Body size="small" color="secondary">
            Om du behöver uppdatera din e-postadress kan du göra det i
            inställningarna efter att kontot är klart.
          </Body>
        </View>
        {updateDetailsData ? (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderColor: colors.dividers.neutral,
                paddingBottom: 16,
                paddingTop: 16,
              }}
            >
              <View>
                <Title size="medium" style={{ marginBottom: 4 }}>
                  Kontodetaljer
                </Title>
                <Body size="medium" color="secondary">
                  Användarnamn: {username}
                </Body>
                <Body size="medium" color="secondary">
                  Lösenord:{" "}
                  {"•".repeat(Math.min(8, Math.max(0, password.length - 3))) +
                    password.slice(password.length - 3)}
                </Body>
              </View>
              <Button
                type="tonal"
                label="Ändra"
                onPress={() => {
                  setCreateBusiness(false);
                  setDontCreateBusiness(false);
                  reset();
                }}
              />
            </View>
            <View style={{ marginTop: 16, gap: 16 }}>
              <Headline size="small">
                Vill du skaffa ett företagskonto?
              </Headline>
              <View
                style={[
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: borderRadius.medium,
                    backgroundColor: colors.buttons.tonal.enabled,
                    padding: 16,
                  },
                  dontCreateBusiness && {
                    borderColor: colors.textField.clicked,
                    borderWidth: 1,
                    padding: 15,
                    backgroundColor: colors.background.neutral,
                  },
                  createBusiness && {
                    backgroundColor: colors.buttons.filled.disabled,
                  },
                ]}
              >
                <View style={{ gap: 4, flex: 1 }}>
                  <Label size="medium">Nej, inte just nu</Label>
                  <Body size="medium">
                    Inga problem! Du kan alltid lägga till ett företagskonto
                    senare när det passar dig.
                  </Body>
                </View>
                <Toggle
                  value={dontCreateBusiness}
                  onPress={() => {
                    setCreateBusiness(false);
                    setDontCreateBusiness(!dontCreateBusiness);
                  }}
                />
              </View>
              <View
                style={[
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: borderRadius.medium,
                    backgroundColor: colors.buttons.tonal.enabled,
                    padding: 16,
                  },
                  createBusiness && {
                    borderColor: colors.textField.clicked,
                    borderWidth: 1,
                    padding: 15,
                    backgroundColor: colors.background.neutral,
                  },
                  dontCreateBusiness && {
                    backgroundColor: colors.buttons.filled.disabled,
                  },
                ]}
              >
                <View style={{ gap: 4, flex: 1 }}>
                  <Label size="medium">Ja, skapa ett företagskonto</Label>
                  <Body size="medium">
                    Perfekt! Vi hjälper dig att komma igång med företagskontot –
                    enkelt och smidigt!
                  </Body>
                </View>
                <Toggle
                  value={createBusiness}
                  onPress={() => {
                    setDontCreateBusiness(false);
                    setCreateBusiness(!createBusiness);
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={{ marginBottom: 16 }}>
            <Headline size="small" style={{ marginVertical: 16 }}>
              Kontodetaljer
            </Headline>
            <View style={{ gap: 24 }}>
              <View>
                <Form
                  fields={[
                    {
                      type: "text",
                      heading: "Användarnamn",
                      description:
                        "Ditt användarnamn är det namn som visas på din publika profil.",
                      value: username,
                      onChange: (v) => setUsername(v),
                      disabled: loading,
                    },
                  ]}
                />
              </View>
              <CreatePassword
                password={password}
                onChangePassword={setPassword}
                onChangeValidity={setPasswordValid}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 24,
                }}
              >
                <Body size="medium">
                  Genom att skapa ett konto hos RebuildR godkänner jag{" "}
                  <Pressable onPress={() => {}}>
                    <Body size="medium" isLink>
                      villkoren
                    </Body>
                  </Pressable>{" "}
                  och{" "}
                  <Pressable>
                    <Body size="medium" isLink>
                      integritetspolicyn
                    </Body>
                  </Pressable>
                  .
                </Body>
                <Check
                  selected={termsAccepted}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                />
              </View>
            </View>
          </View>
        )}
        {isDesktop && (
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Button
              label="Fortsätt"
              onPress={() => {
                onProceed();
              }}
              disabled={!canContinue()}
              style={{ marginTop: 24 }}
            />
          </View>
        )}
      </View>
      {!isDesktop && (
        <Button
          label="Fortsätt"
          onPress={() => {
            onProceed();
          }}
          disabled={!canContinue()}
          style={{ marginTop: 24 }}
        />
      )}
    </>
  );
};
