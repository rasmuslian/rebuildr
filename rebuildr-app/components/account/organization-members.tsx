import {
  InviteOrganizationMemberMutation,
  InviteOrganizationMemberMutationVariables,
  OrganizationMemberRoleEnum,
  OrganizationMembersPageQuery,
} from "@/gql/graphql";
import {
  INVITE_ORGANIZATION_MEMBER,
  ORGANIZATION_MEMBERS_PAGE,
} from "@/queries/internal-ads";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { TextInput } from "@components/forms/textInput";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Label, Title } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  onBack?: () => void;
};

export const OrganizationMembers = ({ onBack }: Props) => {
  const { isDesktop } = useScreenType();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrganizationMemberRoleEnum>(
    OrganizationMemberRoleEnum.Member,
  );
  const { data, loading, refetch } = useQuery<OrganizationMembersPageQuery>(
    ORGANIZATION_MEMBERS_PAGE,
    { fetchPolicy: "cache-and-network" },
  );
  const [inviteMember, { loading: invitingMember }] = useMutation<
    InviteOrganizationMemberMutation,
    InviteOrganizationMemberMutationVariables
  >(INVITE_ORGANIZATION_MEMBER);

  const context = data?.internalAdsOrganizationContext;
  const organizationName =
    context?.organization.name ??
    context?.organization.username ??
    "Organisation";
  const isAdmin = context?.role === OrganizationMemberRoleEnum.Admin;

  const onInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    await inviteMember({
      variables: { input: { email: inviteEmail.trim(), role: inviteRole } },
    });
    setInviteEmail("");
    await refetch();
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
    <View style={{ gap: 24 }}>
      {onBack && <Button icon="arrowLeft" type="text" onPress={onBack} />}
      <View style={{ gap: 6 }}>
        <Title size="large">Organisationsmedlemmar</Title>
        <Body size="medium" color="secondary">
          {organizationName}
        </Body>
      </View>

      <View style={{ gap: 12 }}>
        <Label size="large">Bjud in medlem</Label>
        <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 8 }}>
          <TextInput
            value={inviteEmail}
            placeholder="kollega@foretag.se"
            onChange={setInviteEmail}
            autoCapitalize="none"
            style={{ flex: 1 }}
          />
          <Button
            label={
              inviteRole === OrganizationMemberRoleEnum.Admin
                ? "Roll: admin"
                : "Roll: medlem"
            }
            type="tonal"
            onPress={() =>
              setInviteRole(
                inviteRole === OrganizationMemberRoleEnum.Admin
                  ? OrganizationMemberRoleEnum.Member
                  : OrganizationMemberRoleEnum.Admin,
              )
            }
          />
          <Button
            label="Bjud in"
            onPress={onInviteMember}
            loading={invitingMember}
          />
        </View>
      </View>

      <Divider />

      <View style={{ gap: 12 }}>
        <Label size="large">Medlemmar</Label>
        {data?.organizationMembers.map((member) => (
          <View
            key={member.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Body size="medium">
              {member.user.name ?? member.user.username ?? member.user.email}
            </Body>
            <Label size="medium">
              {member.role === OrganizationMemberRoleEnum.Admin
                ? "Admin"
                : "Medlem"}
            </Label>
          </View>
        ))}
      </View>

      {!!data?.organizationInvites.length && (
        <View style={{ gap: 12 }}>
          <Label size="large">Väntande inbjudningar</Label>
          {data.organizationInvites.map((invite) => (
            <Body key={invite.id} size="small" color="secondary">
              {invite.email} -{" "}
              {invite.role === OrganizationMemberRoleEnum.Admin
                ? "Admin"
                : "Medlem"}
            </Body>
          ))}
        </View>
      )}
    </View>
  );
};
