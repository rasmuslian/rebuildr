import { CreateBusinessQueryQuery } from "@/gql/graphql";
import { formatOrgNumber } from "@/utils/formattings";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Display } from "@components/typography/text";
import { useCreateOrganization } from "@hooks/use-create-organization";
import { useScreenType } from "@hooks/useScreenType";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const CREATE_BUSINESS_QUERY = gql`
  query CreateBusinessQuery {
    me {
      id
    }
  }
`;

type Props = {
  onDone: () => void;
  onExit: () => void;
};

export const CreateBusiness = ({ onDone, onExit }: Props) => {
  const {
    orgNumber,
    changeOrgNumber,
    name,
    changeName,
    fieldErrors,
    error: createOrganizationError,
    canCreate,
    create,
    loading: createOrganizationLoading,
    data: createOrganizationData,
  } = useCreateOrganization();
  const { isDesktop } = useScreenType();

  const { data } = useQuery<CreateBusinessQueryQuery>(CREATE_BUSINESS_QUERY);

  useEffect(() => {
    if (createOrganizationData) {
      onDone();
    }
  }, [createOrganizationData]);

  if (!data) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <Display size="small" style={{ marginBottom: 24 }}>
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
              value: formatOrgNumber(orgNumber),
              onChangeText: changeOrgNumber,
              error:
                !!createOrganizationError ||
                !!fieldErrors?.find(
                  (field) => field.name === "organizationNumber",
                ),
            },
            {
              type: "text",
              heading: "Företagsnamn",
              description:
                "Ange det företagsnamn du vill visa publikt på din profil.",
              helperText:
                "💡 Observera: Vi verifierar inte företagsnamnet, så se till att du skriver in det exakt som du vill att det ska synas för kunder.",
              value: name,
              onChangeText: changeName,
            },
          ]}
        />
        {isDesktop && (
          <>
            <View style={{ flex: 1 }} />
            <Button
              label="Fortsätt"
              onPress={create}
              style={{ marginTop: 24 }}
              disabled={!canCreate}
              loading={createOrganizationLoading}
            />
          </>
        )}
      </View>
      {!isDesktop && (
        <Button
          label="Fortsätt"
          onPress={create}
          style={{ marginTop: 24 }}
          disabled={!canCreate}
          loading={createOrganizationLoading}
        />
      )}
    </>
  );
};
