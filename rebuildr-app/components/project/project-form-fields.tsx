import { Button } from "@components/buttons/button";
import { Toggle } from "@components/controls/toggle";
import { Form } from "@components/forms/form";
import { Body, Title } from "@components/typography/text";
import { Pressable, View } from "react-native";
import { Map } from "@components/maps/map";
import { useState } from "react";
import { useThemeColor } from "@hooks/useThemeColor";
import { Project } from "@/gql/graphql";
import { useLocationAddress } from "@hooks/useLocationAddress";

export type ProjectFormType = Pick<
  Project,
  | "title"
  | "description"
  | "contactName"
  | "contactEmail"
  | "contactPhone"
  | "location"
  | "address"
>;

type Props = {
  myPlace?: { location?: { lat: number; lng: number }; address?: string };
  project?: ProjectFormType;
  onSave: (project: ProjectFormType) => void;
  onDelete?: () => void;
  isLoading?: boolean;
};

export const ProjectFormFields = ({
  myPlace,
  project,
  onSave,
  onDelete,
  isLoading: _isLoading,
}: Props) => {
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [altContact, setAltContact] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  } | null>(
    project
      ? !!project.contactName &&
        !!project.contactEmail &&
        !!project.contactPhone
        ? {
            name: project.contactName ?? undefined,
            email: project.contactEmail ?? undefined,
            phone: project.contactPhone ?? undefined,
          }
        : null
      : null,
  );
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false);
  const colors = useThemeColor();

  const {
    address,
    updateAddress,
    location,
    loading,
    setMapLocation,
    autoCompletes,
    selectAutoComplete,
  } = useLocationAddress({
    address: project?.address ?? myPlace?.address,
    location: project?.location ?? myPlace?.location,
  });

  const onUpdateAddress = (s: string) => {
    setShowLocationsDropdown(true);
    updateAddress(s);
  };

  const onSelectAutoComplete = (address: string) => {
    setShowLocationsDropdown(false);
    selectAutoComplete(address);
  };

  const onSaveProject = () => {
    onSave({
      title,
      description,
      contactName: altContact?.name ?? null,
      contactEmail: altContact?.email ?? null,
      contactPhone: altContact?.phone ?? null,
      location: {
        lat: location[0],
        lng: location[1],
      },
      address,
    });
  };

  const isLoading = loading || _isLoading;
  const canSave = !!title && !!address && !isLoading;

  return (
    <View style={{ gap: 24 }}>
      <Form
        style={{ gap: 24 }}
        fields={[
          {
            type: "text",
            heading: "Projektnamn",
            value: title,
            onChange: (t) => setTitle(t),
          },
          {
            type: "text",
            multiline: true,
            style: { minHeight: 130 },
            heading: "Kort beskrivning av projektet",
            value: description,
            placeholder:
              "Beskrivning av projektet, tillgänglighet och annan bra information för en köpare",
            onChange: (t) => setDescription(t),
          },
        ]}
      />
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <View style={{ gap: 4, flex: 1 }}>
          <Title size="medium">Lägg till alternativ kontakt</Title>
          <Body size="medium">Om annan person än dig själv.</Body>
        </View>
        <Toggle
          value={!!altContact}
          onPress={() => setAltContact(altContact ? null : {})}
        />
      </View>

      {altContact && (
        <Form
          style={{ gap: 24 }}
          fields={[
            {
              type: "text",
              heading: "Namn",
              value: altContact.name ?? "",
              onChange: (t) => setAltContact({ ...altContact, name: t }),
            },
            {
              type: "text",
              heading: "Mail",
              value: altContact.email ?? "",
              onChange: (t) => setAltContact({ ...altContact, email: t }),
            },
            {
              type: "text",
              heading: "Telefon",
              value: altContact.phone ?? "",
              onChange: (t) => setAltContact({ ...altContact, phone: t }),
            },
          ]}
        />
      )}
      <Title size="medium">Lägg till adress</Title>
      <View style={{ gap: 16 }}>
        <Form
          fields={[
            {
              type: "text",
              heading: "Adress",
              description:
                "Köparen ser inte projektets exakta adress, bara ett ungefärligt område på kartan. Din adress visas först när ett köp har genomförts.",
              value: address,
              onChange: (t) => onUpdateAddress(t),
              disabled: loading,
            },
          ]}
        />
        {!!autoCompletes.length && showLocationsDropdown && (
          <View style={{ gap: 6 }}>
            {autoCompletes.map((data, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  onSelectAutoComplete(data);
                }}
                style={
                  i !== 0 && {
                    borderColor: colors.dividers.neutral,
                    borderTopWidth: 1,
                    paddingTop: 4,
                  }
                }
              >
                <Body size="medium" color="secondary" numberOfLines={1}>
                  {data}
                </Body>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      <View style={{ gap: 12 }}>
        <Map
          lat={location[0]}
          lng={location[1]}
          onMoveEnd={setMapLocation}
          interactive={!loading}
        />
        <Body size="small" color="secondary">
          Dra kartan för att flytta nålen till rätt plats. Du kan zooma in och
          ut genom att nypa med två fingrar.
        </Body>
      </View>
      <View style={{ gap: 8 }}>
        <Button
          label="Spara projekt"
          onPress={onSaveProject}
          disabled={!canSave}
          loading={_isLoading}
        />
        {onDelete && (
          <Button
            label="Radera projekt"
            onPress={onDelete}
            loading={_isLoading}
            type="outlined"
          />
        )}
      </View>
    </View>
  );
};
