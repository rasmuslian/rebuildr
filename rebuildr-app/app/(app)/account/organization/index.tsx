import React, { useState } from "react";
import { View } from "react-native";
import { gql, useMutation, useQuery } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import TopBar from "@components/navigation/top-bar/top-bar";
import { useScreenType } from "@hooks/useScreenType";
import { Title, Body, Label } from "@components/typography/text";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
import { Divider } from "@components/dividers/divider";
import {
  MyOrganizationQuery,
  InviteOrganizationMemberMutation,
  InviteOrganizationMemberMutationVariables,
} from "@/gql/graphql";

const MY_ORGANIZATION = gql`
  query MyOrganization {
    myOrganization {
      organization {
        id
        name
        organizationNumber
      }
      members {
        id
        role
        user {
          id
          username
        }
      }
      pendingInvites {
        id
        email
        role
        status
      }
    }
  }
`;

const INVITE_ORGANIZATION_MEMBER = gql`
  mutation InviteOrganizationMember($input: InviteOrganizationMemberInput!) {
    inviteOrganizationMember(input: $input) {
      id
      email
      status
    }
  }
`;

export default function OrganizationScreen() {
  const { isDesktop } = useScreenType();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<MyOrganizationQuery>(
    MY_ORGANIZATION,
    { fetchPolicy: "cache-and-network" },
  );

  const [invite, { loading: inviting }] = useMutation<
    InviteOrganizationMemberMutation,
    InviteOrganizationMemberMutationVariables
  >(INVITE_ORGANIZATION_MEMBER);

  const org = data?.myOrganization.organization;
  const members = data?.myOrganization.members ?? [];
  const pendingInvites = data?.myOrganization.pendingInvites ?? [];

  const onInvite = async () => {
    if (!email.trim()) return;
    try {
      const res = await invite({ variables: { input: { email: email.trim() } } });
      const status = res.data?.inviteOrganizationMember.status;
      setMessage(
        status === "ACCEPTED"
          ? `${email} lades till i företaget.`
          : `Inbjudan skickad till ${email}.`,
      );
      setEmail("");
      await refetch();
    } catch (e) {
      setMessage("Kunde inte bjuda in. Försök igen.");
    }
  };

  return (
    <ScreenLayout
      headerComponent={
        isDesktop ? <TopBar theme="light" /> : <Header title="Mitt företag" />
      }
      loading={loading}
    >
      <View style={{ gap: 24, maxWidth: 640, width: "100%" }}>
        <View style={{ gap: 4 }}>
          <Label size="medium">Organisation</Label>
          <Title size="medium">{org?.name ?? "Min organisation"}</Title>
          {org?.organizationNumber ? (
            <Body size="small">Org.nr: {org.organizationNumber}</Body>
          ) : null}
        </View>

        <Divider />

        <View style={{ gap: 12 }}>
          <Label size="medium">Medlemmar ({members.length})</Label>
          {members.map((m) => (
            <View
              key={m.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Body>{m.user?.username ?? "Användare"}</Body>
              <Body size="small">{m.role}</Body>
            </View>
          ))}
        </View>

        <Divider />

        <View style={{ gap: 12 }}>
          <Label size="medium">Bjud in kollega</Label>
          <Body size="small">
            Kollegor du bjuder in ser och kan hantera samma internlager.
          </Body>
          <TextInput
            placeholder="kollega@foretag.se"
            value={email}
            onChange={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button label="Bjud in" onPress={onInvite} loading={inviting} />
          {message ? <Body size="small">{message}</Body> : null}
        </View>

        {pendingInvites.length > 0 && (
          <>
            <Divider />
            <View style={{ gap: 12 }}>
              <Label size="medium">
                Väntande inbjudningar ({pendingInvites.length})
              </Label>
              {pendingInvites.map((i) => (
                <View
                  key={i.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Body>{i.email}</Body>
                  <Body size="small">Väntar</Body>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScreenLayout>
  );
}
