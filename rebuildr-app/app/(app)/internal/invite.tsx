import {
  AcceptOrganizationInviteMutation,
  AcceptOrganizationInviteMutationVariables,
} from "@/gql/graphql";
import { ACCEPT_ORGANIZATION_INVITE } from "@/queries/internal-ads";
import { useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import TopBar from "@components/navigation/top-bar/top-bar";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Label } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function InternalAdsInvitePage() {
  const colors = useThemeColor();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [acceptInvite, { loading, error }] = useMutation<
    AcceptOrganizationInviteMutation,
    AcceptOrganizationInviteMutationVariables
  >(ACCEPT_ORGANIZATION_INVITE);

  const onAccept = async () => {
    if (!token) return;
    await acceptInvite({
      variables: {
        input: {
          token,
          username: username || undefined,
          password: password || undefined,
        },
      },
    });
    setAccepted(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: primitives.accent100 }}>
      <TopBar theme="light" showSearchBar={false} />
      <ScreenLayout style={{ backgroundColor: primitives.accent100 }}>
        <View
          style={{
            maxWidth: 560,
            width: "100%",
            alignSelf: "center",
            backgroundColor: colors.background.neutral,
            borderRadius: borderRadius.medium,
            padding: 20,
            gap: 16,
          }}
        >
          <Display size="small" heading={1}>
            Acceptera inbjudan
          </Display>
          {accepted ? (
            <View style={{ gap: 12 }}>
              <Body size="large" color="secondary">
                Inbjudan är accepterad. Logga in med kontot som hör till din
                e-postadress för att öppna Internlagret.
              </Body>
              <Button
                label="Öppna Internlagret"
                onPress={() => router.replace("/internal")}
              />
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <Body size="large" color="secondary">
                Om du redan har ett konto kan du acceptera direkt. Är du ny här,
                ange ett användarnamn och lösenord först.
              </Body>
              <View style={{ gap: 6 }}>
                <Label size="medium">Användarnamn</Label>
                <TextInput value={username} onChange={setUsername} />
              </View>
              <View style={{ gap: 6 }}>
                <Label size="medium">Lösenord</Label>
                <TextInput value={password} onChange={setPassword} hideText />
              </View>
              {error && (
                <Body size="small" color="error">
                  Kunde inte acceptera inbjudan. Kontrollera länken och fyll i
                  användarnamn/lösenord om du saknar konto.
                </Body>
              )}
              <Button
                label="Acceptera inbjudan"
                onPress={onAccept}
                loading={loading}
                disabled={!token}
              />
            </View>
          )}
        </View>
      </ScreenLayout>
    </View>
  );
}
