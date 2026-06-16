import {
  DetailsOrgSummaryQuery,
  DetailsOrgSummaryQueryVariables,
  DetailsQueryQuery,
  DetailsValidUsernameQuery,
  DetailsValidUsernameQueryVariables,
  UpdateDetailsFieldsMutation,
  UpdateDetailsFieldsMutationVariables,
  UserType,
} from "@/gql/graphql";
import { formatOrgNumber } from "@/utils/formattings";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Check } from "@components/controls/check";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Display, Headline, Title } from "@components/typography/text";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { CreatePassword } from "./create-password";
import { useScreenType } from "@hooks/useScreenType";
import { useDebounceCallback } from "usehooks-ts";
import { useThemeColor } from "@hooks/useThemeColor";

const DETAILS_QUERY = gql`
  query DetailsQuery {
    me {
      id
      email
      type
      organizationNumber
    }
  }
`;

const DETAILS_ORG_SUMMARY = gql`
  query DetailsOrgSummary($orgNumber: String!) {
    lookupOrganizationNumber(orgNumber: $orgNumber) {
      name
      address
      zipCode
      city
      alreadyRegistered
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

const DETAILS_VALID_USERNAME = gql`
  query DetailsValidUsername($username: String!) {
    usernameIsValid(username: $username)
  }
`;

type Props = {
  onDone: () => void;
  onExit: () => void;
};
export const Details = ({ onDone, onExit }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);

  const colors = useThemeColor();
  const { isDesktop } = useScreenType();

  const { data } = useQuery<DetailsQueryQuery>(DETAILS_QUERY);
  const [updateDetails, { loading }] = useMutation<
    UpdateDetailsFieldsMutation,
    UpdateDetailsFieldsMutationVariables
  >(UPDATE_DETAILS_FIELDS);
  const [checkUsername, { data: checkUsernameData }] = useLazyQuery<
    DetailsValidUsernameQuery,
    DetailsValidUsernameQueryVariables
  >(DETAILS_VALID_USERNAME);
  const [getOrgSummary, { data: orgSummaryData }] = useLazyQuery<
    DetailsOrgSummaryQuery,
    DetailsOrgSummaryQueryVariables
  >(DETAILS_ORG_SUMMARY);

  const debouncedCheckUsername = useDebounceCallback(checkUsername, 300);

  const canContinue = () => {
    return passwordValid && !!username && termsAccepted && !loading;
  };

  const onChangeUsername = (name: string) => {
    debouncedCheckUsername({ variables: { username: name } });
    setUsername(name);
  };

  const onProceed = () => {
    if (loading) return;
    updateDetails({
      variables: { input: { username, password } },
      onCompleted: onDone,
    });
  };

  useEffect(() => {
    if (!data) return;
    if (data.me.type === UserType.Business && data.me.organizationNumber) {
      getOrgSummary({ variables: { orgNumber: data.me.organizationNumber } });
    }
  }, [data]);

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
        {orgSummaryData?.lookupOrganizationNumber && (
          <View style={{ gap: 16, marginTop: 8 }}>
            <View style={{ gap: 4 }}>
              <Title size="medium">
                {orgSummaryData.lookupOrganizationNumber.name}
              </Title>
              <Title size="medium">
                {orgSummaryData.lookupOrganizationNumber.address}
              </Title>
              <Title size="medium">
                {orgSummaryData.lookupOrganizationNumber.zipCode}{" "}
                {orgSummaryData.lookupOrganizationNumber.city}
              </Title>
            </View>
            <Divider />
          </View>
        )}
        {data.me.organizationNumber && (
          <View
            style={{
              borderBottomWidth: 1,
              borderColor: colors.dividers.neutral,
              paddingVertical: 16,
              gap: 4,
            }}
          >
            <Body size="medium" color="secondary">
              Ert organisationsnummer
            </Body>
            <Title size="medium">
              {formatOrgNumber(data.me.organizationNumber)}
            </Title>
          </View>
        )}
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
                    heading:
                      data.me.type === UserType.Business
                        ? "Företagsnamn"
                        : "Användarnamn",
                    description:
                      data.me.type === UserType.Business
                        ? "Ange det företagsnamn du vill visa publikt på din profil."
                        : "Ditt användarnamn är det namn som visas på din publika profil.",
                    value: username,
                    onChange: onChangeUsername,
                    disabled: loading,
                    error:
                      checkUsernameData &&
                      checkUsernameData.usernameIsValid === false
                        ? "Användarnamnet är redan taget"
                        : undefined,
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
                  <Body
                    size="medium"
                    link={{
                      pathname: "/article/[slug]",
                      params: { slug: "anvandaravtal" },
                    }}
                  >
                    villkoren
                  </Body>
                </Pressable>{" "}
                och{" "}
                <Pressable>
                  <Body
                    size="medium"
                    link={{
                      pathname: "/article/[slug]",
                      params: { slug: "integritetspolicy" },
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
        {isDesktop && (
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Button
              label="Fortsätt"
              loading={loading}
              onPress={() => {
                onProceed();
              }}
              disabled={!canContinue()}
              style={{ marginTop: 24 }}
            />
          </View>
        )}
        {!isDesktop && (
          <Button
            label="Fortsätt"
            loading={loading}
            onPress={() => {
              onProceed();
            }}
            disabled={!canContinue()}
            style={{ marginTop: 24 }}
          />
        )}
      </View>
    </>
  );
};
