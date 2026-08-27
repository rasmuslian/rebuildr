import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { TextInput } from "@components/forms/textInput";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Label, Title } from "@components/typography/text";
import { useState } from "react";
import { Alert, View } from "react-native";

const ORGANIZATION_MEMBERS = gql`
  query OrganizationMembers {
    organizationMembers { id name email }
  }
`;
const CREATE_MEMBER = gql`
  mutation CreateOrganizationMember($input: CreateOrganizationMemberInput!) {
    createOrganizationMember(input: $input) { id name email }
  }
`;
const UPDATE_MEMBER = gql`
  mutation UpdateOrganizationMember($input: UpdateOrganizationMemberInput!) {
    updateOrganizationMember(input: $input) { id name email }
  }
`;
const REMOVE_MEMBER = gql`
  mutation RemoveOrganizationMember($memberId: ID!) {
    removeOrganizationMember(memberId: $memberId)
  }
`;

type Props = { onBack?: () => void };
type Member = { id: string; name: string; email: string };

export const OrganizationMembers = ({ onBack }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState<Member>();
  const [feedback, setFeedback] = useState<string>();
  const { data, loading, refetch } = useQuery<{ organizationMembers: Member[] }>(
    ORGANIZATION_MEMBERS,
    { fetchPolicy: "cache-and-network" },
  );
  const [createMember, { loading: creating }] = useMutation(CREATE_MEMBER);
  const [updateMember, { loading: updating }] = useMutation(UPDATE_MEMBER);
  const [removeMember] = useMutation(REMOVE_MEMBER);

  const reset = () => {
    setName("");
    setEmail("");
    setEditing(undefined);
  };
  const save = async () => {
    if (!name.trim() || !email.trim()) return;
    try {
      if (editing) {
        await updateMember({ variables: { input: { id: editing.id, name: name.trim(), email: email.trim() } } });
      } else {
        await createMember({ variables: { input: { name: name.trim(), email: email.trim() } } });
      }
      await refetch();
      reset();
      setFeedback(editing ? "Personen uppdaterades." : "Personen lades till.");
    } catch {
      setFeedback("Kunde inte spara. Kontrollera namn och e-postadress.");
    }
  };
  const edit = (member: Member) => {
    setEditing(member);
    setName(member.name);
    setEmail(member.email);
  };
  const remove = (member: Member) => Alert.alert(
    "Ta bort person?",
    "Tidigare annonser och reservationer behåller sina sparade uppgifter.",
    [{ text: "Avbryt", style: "cancel" }, { text: "Ta bort", style: "destructive", onPress: async () => {
      try {
        await removeMember({ variables: { memberId: member.id } });
        await refetch();
      } catch { setFeedback("Kunde inte ta bort personen."); }
    }}],
  );

  if (loading && !data) return <LoadingSpinner />;
  return (
    <View style={{ width: "100%", gap: 24 }}>
      {onBack && <Button icon="arrowLeft" label="Tillbaka" type="text" onPress={onBack} style={{ alignSelf: "flex-start" }} />}
      <View style={{ gap: 4 }}>
        <Title size="large">Organisationsmedlemmar</Title>
        <Body size="medium" color="secondary">Lägg till de personer som ska kunna anges på annonser och reservationer.</Body>
      </View>
      {feedback && <Body size="small" color="secondary">{feedback}</Body>}
      <View style={{ gap: 12 }}>
        <Label size="large">{editing ? "Redigera person" : "Lägg till person"}</Label>
        <TextInput value={name} placeholder="Namn" onChange={setName} />
        <TextInput value={email} placeholder="epost@foretag.se" onChange={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button label={editing ? "Spara" : "Lägg till"} onPress={save} loading={creating || updating} disabled={!name.trim() || !email.trim()} style={{ flex: 1 }} />
          {editing && <Button label="Avbryt" type="outlined" onPress={reset} style={{ flex: 1 }} />}
        </View>
      </View>
      <Divider />
      <View style={{ gap: 12 }}>
        <Label size="large">Personer ({data?.organizationMembers.length ?? 0})</Label>
        {data?.organizationMembers.length ? data.organizationMembers.map((member, index) => (
          <View key={member.id} style={{ gap: 10 }}>
            {index > 0 && <Divider />}
            <View style={{ gap: 2 }}><Label size="large">{member.name}</Label><Body size="small" color="secondary">{member.email}</Body></View>
            <View style={{ flexDirection: "row", gap: 8 }}><Button label="Redigera" type="tonal" onPress={() => edit(member)} style={{ flex: 1 }} /><Button label="Ta bort" type="outlined" onPress={() => remove(member)} style={{ flex: 1 }} /></View>
          </View>
        )) : <Body size="small" color="secondary">Lägg till minst en person innan du skapar annonser eller reservationer.</Body>}
      </View>
    </View>
  );
};
