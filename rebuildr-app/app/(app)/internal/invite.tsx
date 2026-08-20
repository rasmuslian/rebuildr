import AsyncStorage from "@react-native-async-storage/async-storage";

import { isLoggedInVar } from "@/apollo/config";
import {
  AcceptOrganizationInviteMutation,
  AcceptOrganizationInviteMutationVariables,
  LoginMutation,
  LoginMutationVariables,
  OrganizationInviteQuery,
  OrganizationInviteQueryVariables,
} from "@/gql/graphql";
import {
  ACCEPT_ORGANIZATION_INVITE,
  ORGANIZATION_INVITE,
} from "@/queries/internal-ads";
import { gql, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { TextInput } from "@components/forms/textInput";
import { InternalTopBar } from "@components/navigation/internal-top-bar/internal-top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        email
      }
    }
  }
`;

export default function InternalAdsInvitePage() {
  const colors = useThemeColor();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const {
    data,
    loading: loadingInvite,
    error: inviteError,
  } = useQuery<OrganizationInviteQuery, OrganizationInviteQueryVariables>(
    ORGANIZATION_INVITE,
    { variables: { token: token ?? "" }, skip: !token },
  );
  const [acceptInvite, { loading: accepting, error: acceptError, reset }] =
    useMutation<
      AcceptOrganizationInviteMutation,
      AcceptOrganizationInviteMutationVariables
    >(ACCEPT_ORGANIZATION_INVITE);
  const [login, { loading: loggingIn, error: loginError }] = useMutation<
    LoginMutation,
    LoginMutationVariables
  >(LOGIN);

  const saveSession = async (loginData: LoginMutation["login"]) => {
    await AsyncStorage.multiSet([
      ["access_token", loginData.accessToken],
      ["refresh_token", loginData.refreshToken],
    ]);
    isLoggedInVar(true);
  };

  const accept = async (createAccount = false) => {
    if (!token) return;

    const { data: acceptData } = await acceptInvite({
      variables: {
        input: {
          token,
          username: createAccount ? username.trim() : undefined,
          password: createAccount ? password : undefined,
        },
      },
    });

    setAccepted(true);

    const createdEmail = acceptData?.acceptOrganizationInvite.email;
    if (createAccount && createdEmail) {
      const { data: loginData } = await login({
        variables: { input: { email: createdEmail, password } },
      });
      if (loginData) await saveSession(loginData.login);
    }
  };

  const onAccept = async () => {
    try {
      await accept(!isLoggedIn);
    } catch {
      // Apollo error is rendered below.
    }
  };

  const onLoginAndAccept = async () => {
    let sessionSaved = false;
    try {
      const { data: loginData } = await login({
        variables: { input: { email: email.trim(), password } },
      });
      if (!loginData) return;

      await saveSession(loginData.login);
      sessionSaved = true;
      await accept();
    } catch {
      if (sessionSaved) {
        await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
        isLoggedInVar(false);
      }
    }
  };

  const changeMode = (loginMode: boolean) => {
    reset();
    setPassword("");
    setShowLogin(loginMode);
  };
  const invalid =
    !token || !!inviteError || (!loadingInvite && !data?.organizationInvite);

  return (
    <View style={{ flex: 1 }}>
      <InternalTopBar showActions={false} />
      <ScreenLayout style={{}}>
        <View
          style={{
            maxWidth: 500,
            width: "100%",
            minWidth: 0,
            alignSelf: "center",
            backgroundColor: colors.background.neutral,
            borderRadius: borderRadius.medium,
            padding: 24,
            gap: 24,
          }}
        >
          <View style={{ gap: 6 }}>
            <Label size="medium" color="secondary">
              Internlagret
            </Label>
            <Display size="small" heading={1}>
              Acceptera inbjudan
            </Display>
          </View>

          {loadingInvite ? (
            <Body size="medium" color="secondary">
              Kontrollerar inbjudan…
            </Body>
          ) : invalid ? (
            <View style={{ gap: 8 }}>
              <Body size="large" color="error">
                Inbjudan är inte längre giltig
              </Body>
              <Body size="small" color="secondary">
                Be en administratör skicka en ny inbjudan.
              </Body>
            </View>
          ) : accepted ? (
            <View style={{ gap: 20 }}>
              <View style={{ gap: 6 }}>
                <Label size="large">Välkommen!</Label>
                <Body size="medium" color="secondary">
                  Du är nu medlem i {data?.organizationInvite?.organizationName}
                  .
                  {!isLoggedIn &&
                    " Logga in med ditt nya konto för att fortsätta."}
                </Body>
              </View>
              <Button
                label={isLoggedIn ? "Öppna Internlagret" : "Logga in"}
                onPress={() => router.replace("/internal")}
              />
            </View>
          ) : (
            <View style={{ gap: 24, minWidth: 0 }}>
              <View style={{ gap: 6 }}>
                <Body size="large">
                  {data?.organizationInvite?.organizationName} har bjudit in
                  dig.
                </Body>
                <Body size="small" color="secondary">
                  Giltig till{" "}
                  {data?.organizationInvite?.expiresAt &&
                    new Date(
                      data.organizationInvite.expiresAt,
                    ).toLocaleDateString("sv-SE")}
                </Body>
              </View>

              <Divider />

              {isLoggedIn ? (
                <View style={{ gap: 16 }}>
                  <Body size="medium" color="secondary">
                    Acceptera för att få åtkomst till organisationens
                    Internlager.
                  </Body>
                  {acceptError && (
                    <Body size="small" color="error">
                      Inbjudan tillhör en annan e-postadress. Kontrollera att du
                      är inloggad med rätt konto.
                    </Body>
                  )}
                  <Button
                    label="Acceptera"
                    onPress={onAccept}
                    loading={accepting}
                  />
                </View>
              ) : showLogin ? (
                <View style={{ gap: 16 }}>
                  <View style={{ gap: 4 }}>
                    <Label size="large">Logga in och acceptera</Label>
                    <Body size="small" color="secondary">
                      Använd e-postadressen som inbjudan skickades till.
                    </Body>
                  </View>
                  <View style={{ gap: 6 }}>
                    <Label size="medium">E-postadress</Label>
                    <TextInput
                      value={email}
                      onChange={setEmail}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={{ gap: 6 }}>
                    <Label size="medium">Lösenord</Label>
                    <TextInput
                      value={password}
                      onChange={setPassword}
                      hideText
                    />
                  </View>
                  {(loginError || acceptError) && (
                    <Body size="small" color="error">
                      {loginError
                        ? "Fel e-postadress eller lösenord."
                        : "Kontot matchar inte inbjudans e-postadress."}
                    </Body>
                  )}
                  <Button
                    label="Logga in och acceptera"
                    onPress={onLoginAndAccept}
                    loading={loggingIn || accepting}
                    disabled={!email.trim() || !password}
                  />
                  <Button
                    label="Skapa konto istället"
                    type="text"
                    onPress={() => changeMode(false)}
                  />
                </View>
              ) : (
                <View style={{ gap: 16 }}>
                  <View style={{ gap: 4 }}>
                    <Label size="large">Skapa ett personligt konto</Label>
                    <Body size="small" color="secondary">
                      Inbjudan verifierar din e-postadress automatiskt.
                    </Body>
                  </View>
                  <View style={{ gap: 6 }}>
                    <Label size="medium">Användarnamn</Label>
                    <TextInput
                      value={username}
                      onChange={setUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  <View style={{ gap: 6 }}>
                    <Label size="medium">Lösenord</Label>
                    <TextInput
                      value={password}
                      onChange={setPassword}
                      hideText
                    />
                  </View>
                  {acceptError && (
                    <Body size="small" color="error">
                      Kontot kunde inte skapas. Kontrollera uppgifterna och
                      försök igen.
                    </Body>
                  )}
                  <Button
                    label="Skapa konto och acceptera"
                    onPress={onAccept}
                    loading={accepting || loggingIn}
                    disabled={!username.trim() || !password}
                  />
                  <Button
                    label="Logga in istället"
                    type="text"
                    onPress={() => changeMode(true)}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </ScreenLayout>
    </View>
  );
}
