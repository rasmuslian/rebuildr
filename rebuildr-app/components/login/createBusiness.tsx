import { CreateBusinessQueryQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import {
  SCREEN_BOTTOM_MARGIN,
  SCREEN_TOP_MARGIN,
} from "@components/screen-layout/screen-layout";
import { Display, Title } from "@components/typography/text";
import { useCreateOrganization } from "@hooks/use-create-organization";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";

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
  const colors = useThemeColor();
  const { height: screenHeight } = useWindowDimensions();
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
      <View
        style={[{
            flex: 1,
          },
          isDesktop && {
            minHeight: screenHeight - SCREEN_TOP_MARGIN - SCREEN_BOTTOM_MARGIN,
          },
        ]}
      >
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
              value: orgNumber,
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
