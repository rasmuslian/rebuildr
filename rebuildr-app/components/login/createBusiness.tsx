import {
  CreateBusinessMutation,
  CreateBusinessMutationVariables,
  CreateBusinessQueryQuery,
} from "@/gql/graphql";
import { errorFields } from "@/utils/apolloErrors";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Display, Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

const CREATE_BUSINESS_QUERY = gql`
  query CreateBusinessQuery {
    me {
      id
    }
  }
`;
const CREATE_BUSINESS = gql`
  mutation CreateBusiness($input: CreateOrganizationUserInput!) {
    createOrganizationUser(input: $input) {
      id
      username
      organizationNumber
    }
  }
`;

type Props = {
  onDone: () => void;
  onExit: () => void;
};

export const CreateBusiness = ({ onDone, onExit }: Props) => {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const colors = useThemeColor();

  const { data, loading } = useQuery<CreateBusinessQueryQuery>(
    CREATE_BUSINESS_QUERY,
  );
  const [createBusiness, { error }] = useMutation<
    CreateBusinessMutation,
    CreateBusinessMutationVariables
  >(CREATE_BUSINESS);

  const onCreateBusinesss = () => {
    if (!data || loading) {
      return;
    }
    createBusiness({
      variables: {
        input: {
          organizationNumber: number,
          organizationName: name,
          creatorId: data.me.id,
        },
      },
      onCompleted: () => {
        onDone();
      },
      onError: () => {},
    });
  };

  const onChangeNumber = (v: string) => {
    //only digits and max 10 of them
    const r = new RegExp(/^[0-9]{0,10}$/);
    if (!r.test(v)) {
      return;
    }
    setNumber(v);
  };

  const canContinue = number.length === 10 && name.length > 0;
  const errors = error ? errorFields(error) : undefined;

  if (!data) {
    return <ActivityIndicator />;
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
          Om ditt företag
        </Display>
        <Form
          style={{ gap: 24 }}
          fields={[
            {
              type: "text",
              heading: "Organisationsnummer",
              description:
                "Ange ditt företags organisationsnummer (10 siffror).",
              value: number,
              onChangeText: (v) => onChangeNumber(v),
              error:
                !!error ||
                !!errors?.find((field) => field.name === "organizationNumber"),
            },
            {
              type: "text",
              heading: "Företagsnamn",
              description:
                "Ange det företagsnamn du vill visa publikt på din profil.",
              helperText:
                "💡 Observera: Vi verifierar inte företagsnamnet, så se till att du skriver in det exakt som du vill att det ska synas för kunder.",
              value: name,
              onChangeText: (v) => setName(v),
            },
          ]}
        />
      </View>
      <Button
        label="Fortsätt"
        onPress={() => onCreateBusinesss()}
        style={{ marginTop: 24 }}
        disabled={!canContinue}
      />
    </>
  );
};
