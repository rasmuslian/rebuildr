import {
  CreateProjectInlineMutation,
  CreateProjectInlineMutationVariables,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Form } from "@components/forms/form";
import { Body } from "@components/typography/text";
import { useLocationAddress } from "@hooks/useLocationAddress";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { Pressable, View } from "react-native";

const CREATE_PROJECT_INLINE = gql`
  mutation CreateProjectInline($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      title
    }
  }
`;

type Props = {
  onCreate: (id: string) => void;
  /** Prefill from the ad being created, when its address is already known. */
  prefillAddress?: string;
  prefillLocation?: { lat: number; lng: number };
};

/**
 * Slim in-wizard project creation: name + description + address only.
 * Cover sheet, contact details and pin fine-tuning are edited later under
 * "Dina projekt" — the wizard stays minimal.
 */
export const CreateProjectInline = ({
  onCreate,
  prefillAddress,
  prefillLocation,
}: Props) => {
  const colors = useThemeColor();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [addressDirty, setAddressDirty] = useState(false);
  //the coordinates match the shown address (prefill, or a picked suggestion)
  const [locationResolved, setLocationResolved] = useState(!!prefillLocation);
  const [error, setError] = useState<string | undefined>();

  const {
    address,
    location,
    loading: addressLoading,
    updateAddress,
    autoCompletes,
    selectAutoComplete,
  } = useLocationAddress({
    address: prefillAddress,
    location: prefillLocation,
  });

  const [createProject, { loading }] = useMutation<
    CreateProjectInlineMutation,
    CreateProjectInlineMutationVariables
  >(CREATE_PROJECT_INLINE);

  const onSave = () => {
    if (!title.trim() || !address) {
      return;
    }
    setError(undefined);
    createProject({
      variables: {
        input: {
          title: title.trim(),
          description: description.trim() || undefined,
          location: { lat: location[0], lng: location[1] },
        },
      },
      onCompleted: (data) => {
        onCreate(data.createProject.id);
      },
      onError: () => {
        setError("Kunde inte skapa projektet — försök igen.");
      },
    });
  };

  return (
    <View style={{ gap: 16 }}>
      <Form
        style={{ gap: 16 }}
        fields={[
          {
            type: "text",
            heading: "Projektnamn",
            placeholder: "T.ex. Sommarstugan eller Köksrenoveringen",
            value: title,
            onChange: setTitle,
            disabled: loading,
          },
          {
            type: "text",
            heading: "Beskrivning av projektet",
            description:
              "Valfritt — berätta för köpare vad projektet handlar om.",
            multiline: true,
            style: { height: 96 },
            value: description,
            onChangeText: (t: string) => setDescription(t.slice(0, 5000)),
            disabled: loading,
          },
          {
            type: "text",
            heading: "Adress",
            description:
              "Köpare ser bara ett ungefärligt område — aldrig exakt adress.",
            value: address,
            onChange: (a: string) => {
              setAddressDirty(true);
              setLocationResolved(false);
              updateAddress(a);
            },
            disabled: loading,
          },
        ]}
      />
      {addressDirty && autoCompletes.length > 0 && (
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.dividers.neutral,
            borderRadius: 8,
          }}
        >
          {autoCompletes.slice(0, 4).map((suggestion, i) => (
            <Pressable
              key={i}
              onPress={() => {
                selectAutoComplete(suggestion);
                setAddressDirty(false);
                setLocationResolved(true);
              }}
              style={{ padding: 12 }}
            >
              <Body size="medium">{suggestion}</Body>
            </Pressable>
          ))}
        </View>
      )}
      {!!error && (
        <Body size="small" color="error">
          {error}
        </Body>
      )}
      <Button
        label="Skapa projekt"
        onPress={onSave}
        loading={loading || addressLoading}
        disabled={!title.trim() || !address || !locationResolved}
      />
    </View>
  );
};
