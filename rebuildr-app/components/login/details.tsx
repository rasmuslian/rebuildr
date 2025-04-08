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
import { Icon } from "@icons/icon";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

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

enum PasswordRequirementEnum {
  ENOUGH_CHARS = "ENOUGH_CHARS",
  UPPER_CASE = "UPPER_CASE",
  LOWER_CASE = "LOWER_CASE",
  NON_LETTER = "NON_LETTER",
  REPEAT = "REPEAT",
}
type PasswordValidationType = {
  [key in PasswordRequirementEnum]: boolean | null;
};
const PasswordReuirementText: { [key in PasswordRequirementEnum]: string } = {
  ENOUGH_CHARS: "Minst 8 tecken",
  UPPER_CASE: "En bokstav i UPPERCASE",
  LOWER_CASE: "En bokstav med liten bokstav",
  NON_LETTER: "Minst en siffra eller ett specialtecken",
  REPEAT: "Inte mer än två upprepande tecken i rad",
};

type Props = {
  onDone: () => void;
  onCreateBusiness: () => void;
  onExit: () => void;
};
export const Details = ({ onDone, onCreateBusiness, onExit }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pwValidationResult, setPwValidationResult] =
    useState<PasswordValidationType>({
      ENOUGH_CHARS: null,
      UPPER_CASE: null,
      LOWER_CASE: null,
      NON_LETTER: null,
      REPEAT: null,
    });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dontCreateBusiness, setDontCreateBusiness] = useState(false);
  const [createBusiness, setCreateBusiness] = useState(false);
  // const [detailsDone, setDetailsDone] = useState(false);

  const colors = useThemeColor();

  const { data } = useQuery<DetailsQueryQuery>(DETAILS_QUERY);
  const [updateDetails, { data: updateDetailsData, reset, loading }] =
    useMutation<
      UpdateDetailsFieldsMutation,
      UpdateDetailsFieldsMutationVariables
    >(UPDATE_DETAILS_FIELDS);

  const onChangePassword = (password: string) => {
    const nonLetterRegex = new RegExp(/[!@#$%^&*(),.?":{}|<>\d]/);
    const repeatingRegex = new RegExp(/(.)\1{2,}/);
    const validationResult: PasswordValidationType = {
      ENOUGH_CHARS: password.length >= 8,
      UPPER_CASE: password !== password.toLowerCase(),
      LOWER_CASE: password !== password.toUpperCase(),
      NON_LETTER: nonLetterRegex.test(password),
      REPEAT: !repeatingRegex.test(password),
    };

    setPwValidationResult(validationResult);
    setPassword(password);
  };

  const canContinue = () => {
    const passwordCorrect = Object.values(pwValidationResult).every(
      (res) => !!res,
    );
    const usernameCorrect = !!username;
    return (
      passwordCorrect &&
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
          <Title size="medium">Skapa ditt nya konto</Title>
          <Pressable onPress={() => onExit()}>
            <Icon icon="X" size={18} />
          </Pressable>
        </View>

        <Display size="small" style={{ marginVertical: 24 }}>
          Kom igång
        </Display>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: colors.dividers.neutral,
            paddingBottom: 16,
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
                  selected={dontCreateBusiness}
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
                  selected={createBusiness}
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
                      onChangeText: (v) => setUsername(v),
                      disabled: loading,
                    },
                  ]}
                />
              </View>
              <View>
                <Form
                  fields={[
                    {
                      type: "text",
                      heading: "Välj ett lösenord",
                      masked: true,
                      value: password,
                      onChangeText: (v) => onChangePassword(v),
                      disabled: loading,
                    },
                  ]}
                />
                <Body
                  size="small"
                  style={{ marginTop: 12, marginBottom: 16 }}
                  color="secondary"
                >
                  Se till att ditt lösenord innehåller följande:
                </Body>
                <View style={{ gap: 4 }}>
                  {Object.keys(PasswordRequirementEnum).map((key, i) => {
                    const req: PasswordRequirementEnum =
                      key as PasswordRequirementEnum;

                    return (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                        key={i}
                      >
                        {pwValidationResult[req] === null && (
                          <>
                            <Icon icon="bullet" size={14} />
                            <Body size="small" color="secondary">
                              {PasswordReuirementText[req]}
                            </Body>
                          </>
                        )}
                        {pwValidationResult[req] === false && (
                          <>
                            <Icon icon="X" color="error" size={14} />
                            <Body size="small" color="error">
                              {PasswordReuirementText[req]}
                            </Body>
                          </>
                        )}
                        {pwValidationResult[req] === true && (
                          <>
                            <Icon icon="check" color="success" size={14} />
                            <Body size="small" color="success">
                              {PasswordReuirementText[req]}
                            </Body>
                          </>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
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
                    <Body
                      size="medium"
                      color="link"
                      style={{
                        textDecorationLine: "underline",
                        textDecorationColor: colors.text.link,
                      }}
                    >
                      villkoren
                    </Body>
                  </Pressable>{" "}
                  och
                  <Pressable>
                    <Body
                      size="medium"
                      color="link"
                      style={{
                        textDecorationLine: "underline",
                        textDecorationColor: colors.text.link,
                      }}
                    >
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
      </View>
      <Button
        label="Fortsätt"
        onPress={() => {
          onProceed();
        }}
        disabled={!canContinue()}
        style={{ marginTop: 24 }}
      />
    </>
  );
};
