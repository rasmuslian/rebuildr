import {
  AccountSettingsUserQuery,
  OrganizationSettingUpdateMutation,
  OrganizationSettingUpdateMutationVariables,
} from "@/gql/graphql";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Body, Headline } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { Entry } from "./entry";
import { gql, useMutation } from "@apollo/client";

const ORGANIZATION_SETTING_UPDATE = gql`
  mutation OrganizationSettingUpdate($input: UpdateOrganizationUserInput!) {
    updateOrganizationUser(input: $input) {
      id
      username
      organizationNumber
    }
  }
`;

type Props = {
  user: AccountSettingsUserQuery["me"];
};
export const OrganizationSetting = ({ user }: Props) => {
  const [name, setName] = useState(user.username ?? "");
  const [edit, setEdit] = useState(!user.organizationNumber || !user.username);
  const [updateOrganization, { loading }] = useMutation<
    OrganizationSettingUpdateMutation,
    OrganizationSettingUpdateMutationVariables
  >(ORGANIZATION_SETTING_UPDATE);

  const onUpdate = () => {
    if (loading) return;

    updateOrganization({
      variables: {
        input: {
          id: user.id,
          organizationName: name,
        },
      },
    });
  };

  const canCreate = name.length > 0;

  return (
    <View style={{ gap: 16 }}>
      {!edit ? (
        <Entry
          title="Företagskonto"
          onPress={() => {
            setEdit(true);
          }}
          isSet={!!user.organizationNumber && !!user.username}
        >
          <Body size="medium" color="secondary">
            Org.nummer: {user.organizationNumber}
          </Body>
          <Body size="medium" color="secondary">
            Företagsnamn: {name}
          </Body>
        </Entry>
      ) : (
        <View style={{ gap: 16 }}>
          <Headline size="small">Företagskonto</Headline>
          <View style={{ gap: 24 }}>
            <Form
              style={{ gap: 24 }}
              fields={[
                {
                  heading: "Organisationsnummer",
                  description:
                    "Ange ditt företags organisationsnummer (10 siffror).",
                  type: "text",
                  inputType: "numeric",
                  value: user.organizationNumber ?? "",
                  disabled: true,
                },
                {
                  heading: "Företagsnamn",
                  description:
                    "Ange det företagsnamn du vill visa publikt på din profil.",
                  type: "text",
                  value: name,
                  onChange: setName,
                  helperText:
                    "💡 Observera: Vi verifierar inte företagsnamnet, så se till att du skriver in det exakt som du vill att det ska synas för kunder.",
                },
              ]}
            />
          </View>
          <Button label="Spara" onPress={onUpdate} disabled={!canCreate} />
        </View>
      )}
    </View>
  );
};
