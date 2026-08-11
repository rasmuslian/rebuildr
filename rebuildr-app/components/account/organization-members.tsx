import {
  InviteOrganizationMemberMutation,
  InviteOrganizationMemberMutationVariables,
  OrganizationMemberRoleEnum,
  OrganizationMembersPageQuery,
  RemoveOrganizationMemberMutation,
  RemoveOrganizationMemberMutationVariables,
  ResendOrganizationInviteMutation,
  ResendOrganizationInviteMutationVariables,
  RevokeOrganizationInviteMutation,
  RevokeOrganizationInviteMutationVariables,
  UpdateOrganizationMemberRoleMutation,
  UpdateOrganizationMemberRoleMutationVariables,
} from "@/gql/graphql";
import {
  INVITE_ORGANIZATION_MEMBER,
  ORGANIZATION_MEMBERS_PAGE,
  REMOVE_ORGANIZATION_MEMBER,
  RESEND_ORGANIZATION_INVITE,
  REVOKE_ORGANIZATION_INVITE,
  UPDATE_ORGANIZATION_MEMBER_ROLE,
} from "@/queries/internal-ads";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { SelectInput } from "@components/forms/selectInput";
import { TextInput } from "@components/forms/textInput";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Label, Title } from "@components/typography/text";
import { useState } from "react";
import { Alert, View } from "react-native";

type Props = { onBack?: () => void };

const roleLabel = (role: OrganizationMemberRoleEnum) =>
  role === OrganizationMemberRoleEnum.Admin ? "Administratör" : "Medlem";

export const OrganizationMembers = ({ onBack }: Props) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrganizationMemberRoleEnum>(
    OrganizationMemberRoleEnum.Member,
  );
  const [feedback, setFeedback] = useState<string>();
  const { data, loading, refetch } = useQuery<OrganizationMembersPageQuery>(
    ORGANIZATION_MEMBERS_PAGE,
    { fetchPolicy: "cache-and-network" },
  );
  const [inviteMember, { loading: invitingMember }] = useMutation<
    InviteOrganizationMemberMutation,
    InviteOrganizationMemberMutationVariables
  >(INVITE_ORGANIZATION_MEMBER);
  const [updateRole] = useMutation<
    UpdateOrganizationMemberRoleMutation,
    UpdateOrganizationMemberRoleMutationVariables
  >(UPDATE_ORGANIZATION_MEMBER_ROLE);
  const [removeMember] = useMutation<
    RemoveOrganizationMemberMutation,
    RemoveOrganizationMemberMutationVariables
  >(REMOVE_ORGANIZATION_MEMBER);
  const [resendInvite] = useMutation<
    ResendOrganizationInviteMutation,
    ResendOrganizationInviteMutationVariables
  >(RESEND_ORGANIZATION_INVITE);
  const [revokeInvite] = useMutation<
    RevokeOrganizationInviteMutation,
    RevokeOrganizationInviteMutationVariables
  >(REVOKE_ORGANIZATION_INVITE);

  const context = data?.internalAdsOrganizationContext;
  const organizationName =
    context?.organization.name ??
    context?.organization.username ??
    "Organisation";
  const isAdmin =
    context?.isOrganizationAccount ||
    context?.role === OrganizationMemberRoleEnum.Admin;
  const refresh = async (message: string) => {
    await refetch();
    setFeedback(message);
  };
  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      setFeedback(undefined);
      await action();
      await refresh(message);
      return true;
    } catch {
      setFeedback("Något gick fel. Försök igen.");
      return false;
    }
  };

  const onInviteMember = async () => {
    const email = inviteEmail.trim();
    if (!email) return;

    const succeeded = await run(
      () =>
        inviteMember({
          variables: { input: { email, role: inviteRole } },
        }),
      "Inbjudan skickades.",
    );
    if (succeeded) setInviteEmail("");
  };

  if (loading && !data) return <LoadingSpinner />;
  if (!isAdmin) {
    return (
      <View style={{ gap: 16 }}>
        {onBack && <Button icon="arrowLeft" type="text" onPress={onBack} />}
        <Title size="large">Organisationsmedlemmar</Title>
        <Body size="medium" color="secondary">
          Den här sidan är bara tillgänglig för organisationsadmins.
        </Body>
      </View>
    );
  }

  return (
    <View style={{ width: "100%", gap: 32 }}>
      <View style={{ gap: 12 }}>
        {onBack && (
          <Button
            icon="arrowLeft"
            label="Tillbaka"
            type="text"
            onPress={onBack}
            style={{ alignSelf: "flex-start" }}
          />
        )}
        <View style={{ gap: 4 }}>
          <Title size="large">Hantera kollegor</Title>
          <Body size="medium" color="secondary">
            {organizationName}
          </Body>
        </View>
        {feedback && (
          <Body size="small" color="secondary">
            {feedback}
          </Body>
        )}
      </View>

      <View style={{ gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Label size="large">Bjud in en kollega</Label>
          <Body size="small" color="secondary">
            Kollegan får åtkomst med sitt eget Rebuildr-konto.
          </Body>
        </View>

        <View style={{ gap: 6 }}>
          <Label size="medium">E-postadress</Label>
          <TextInput
            value={inviteEmail}
            placeholder="kollega@foretag.se"
            onChange={setInviteEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        <View style={{ gap: 6, zIndex: 1, elevation: 1 }}>
          <Label size="medium">Roll</Label>
          <SelectInput
            value={inviteRole}
            options={[
              {
                value: OrganizationMemberRoleEnum.Member,
                label: "Medlem",
              },
              {
                value: OrganizationMemberRoleEnum.Admin,
                label: "Administratör",
              },
            ]}
            onSelect={setInviteRole}
          />
          <Body size="small" color="secondary">
            {inviteRole === OrganizationMemberRoleEnum.Admin
              ? "Kan även bjuda in och hantera kollegor."
              : "Kan hantera och reservera annonser."}
          </Body>
        </View>

        <Button
          label="Skicka inbjudan"
          loading={invitingMember}
          disabled={!inviteEmail.trim()}
          onPress={onInviteMember}
        />
      </View>

      <Divider />

      <View style={{ gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Label size="large">
            Medlemmar ({data?.organizationMembers.length ?? 0})
          </Label>
          <Body size="small" color="secondary">
            Ändra roll eller ta bort åtkomst.
          </Body>
        </View>

        {data?.organizationMembers.length ? (
          data.organizationMembers.map((member, index) => (
            <View key={member.id} style={{ gap: 14 }}>
              {index > 0 && <Divider />}
              <View style={{ gap: 12, minWidth: 0 }}>
                <View style={{ gap: 2, minWidth: 0 }}>
                  <Label size="large" numberOfLines={1} ellipsizeMode="tail">
                    {member.user.name ??
                      member.user.username ??
                      member.userEmail ??
                      "Medlem"}
                  </Label>
                  {member.userEmail && (
                    <Body
                      size="small"
                      color="secondary"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {member.userEmail}
                    </Body>
                  )}
                  <Body size="small">{roleLabel(member.role)}</Body>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <Button
                    style={{ flex: 1, minWidth: 0 }}
                    label={
                      member.role === OrganizationMemberRoleEnum.Admin
                        ? "Gör till medlem"
                        : "Gör till administratör"
                    }
                    type="tonal"
                    onPress={() =>
                      run(
                        () =>
                          updateRole({
                            variables: {
                              input: {
                                userId: member.user.id,
                                role:
                                  member.role ===
                                  OrganizationMemberRoleEnum.Admin
                                    ? OrganizationMemberRoleEnum.Member
                                    : OrganizationMemberRoleEnum.Admin,
                              },
                            },
                          }),
                        "Rollen uppdaterades.",
                      )
                    }
                  />
                  <Button
                    style={{ flex: 1, minWidth: 0 }}
                    label="Ta bort"
                    type="outlined"
                    onPress={() =>
                      Alert.alert(
                        "Ta bort medlem?",
                        "Medlemmen förlorar åtkomst till Internlagret.",
                        [
                          { text: "Avbryt", style: "cancel" },
                          {
                            text: "Ta bort",
                            style: "destructive",
                            onPress: () =>
                              run(
                                () =>
                                  removeMember({
                                    variables: {
                                      input: { userId: member.user.id },
                                    },
                                  }),
                                "Medlemmen togs bort.",
                              ),
                          },
                        ],
                      )
                    }
                  />
                </View>
              </View>
            </View>
          ))
        ) : (
          <Body size="small" color="secondary">
            Inga kollegor har lagts till ännu.
          </Body>
        )}
      </View>

      <Divider />

      <View style={{ gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Label size="large">
            Väntande ({data?.organizationInvites.length ?? 0})
          </Label>
          <Body size="small" color="secondary">
            Inbjudningar som ännu inte har accepterats.
          </Body>
        </View>

        {data?.organizationInvites.length ? (
          data.organizationInvites.map((invite, index) => (
            <View key={invite.id} style={{ gap: 14 }}>
              {index > 0 && <Divider />}
              <View style={{ gap: 12, minWidth: 0 }}>
                <View style={{ gap: 2, minWidth: 0 }}>
                  <Label size="large" numberOfLines={1} ellipsizeMode="tail">
                    {invite.email}
                  </Label>
                  <Body size="small">{roleLabel(invite.role)}</Body>
                  <Body size="small" color="secondary">
                    Giltig till{" "}
                    {new Date(invite.expiresAt).toLocaleDateString("sv-SE")}
                  </Body>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <Button
                    style={{ flex: 1, minWidth: 0 }}
                    label="Skicka igen"
                    type="tonal"
                    onPress={() =>
                      run(
                        () =>
                          resendInvite({
                            variables: { input: { inviteId: invite.id } },
                          }),
                        "En ny inbjudan skickades.",
                      )
                    }
                  />
                  <Button
                    style={{ flex: 1, minWidth: 0 }}
                    label="Återkalla"
                    type="outlined"
                    onPress={() =>
                      run(
                        () =>
                          revokeInvite({
                            variables: { input: { inviteId: invite.id } },
                          }),
                        "Inbjudan återkallades.",
                      )
                    }
                  />
                </View>
              </View>
            </View>
          ))
        ) : (
          <Body size="small" color="secondary">
            Inga väntande inbjudningar.
          </Body>
        )}
      </View>
    </View>
  );
};
