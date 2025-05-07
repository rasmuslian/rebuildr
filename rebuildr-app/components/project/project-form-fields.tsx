import { Button } from "@components/buttons/button";
import { Toggle } from "@components/controls/toggle";
import { Form } from "@components/forms/form";
import { Body, Title } from "@components/typography/text";
import { Pressable, View } from "react-native";
import { Map } from "@components/maps/map";
import { gql, useLazyQuery } from "@apollo/client";
import { useState } from "react";
import { useThemeColor } from "@hooks/useThemeColor";
import {
  AddressToLocationQueryQuery,
  AddressToLocationQueryQueryVariables,
  LocationSearchQueryQuery,
  LocationSearchQueryQueryVariables,
  LocationToAddressQuery,
  LocationToAddressQueryVariables,
  Project,
} from "@/gql/graphql";
import { defaultCenter } from "@constants/map";

const LOCATION_SEARCH_QUERY = gql`
  query LocationSearchQuery($input: LocationSearchInput!) {
    locationSearch(input: $input) {
      result
    }
  }
`;

const ADDRESS_TO_LOCATION_QUERY = gql`
  query AddressToLocationQuery($input: AddressToLocationInput!) {
    addressToLocation(input: $input) {
      lat
      lng
    }
  }
`;

const LOCATION_TO_ADDRESS_QUERY = gql`
  query LocationToAddress($input: GetAddressInput!) {
    locationToAddress(input: $input) {
      address
    }
  }
`;

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
  project?: ProjectFormType;
  onSave: (project: ProjectFormType) => void;
  isLoading?: boolean;
};

export const ProjectFormFields = ({
  project,
  onSave,
  isLoading: _isLoading,
}: Props) => {
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [address, setAddress] = useState(project?.address ?? "");
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
      : {},
  );
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false);
  const [location, setLocation] = useState<[number, number]>([
    project?.location.lat ?? defaultCenter[0],
    project?.location.lng ?? defaultCenter[1],
  ]);
  const colors = useThemeColor();

  const [locationSearch, { data: locationSearchData }] = useLazyQuery<
    LocationSearchQueryQuery,
    LocationSearchQueryQueryVariables
  >(LOCATION_SEARCH_QUERY);
  const [
    addressToLocation,
    { data: addressLocationData, loading: addressLocationLoading },
  ] = useLazyQuery<
    AddressToLocationQueryQuery,
    AddressToLocationQueryQueryVariables
  >(ADDRESS_TO_LOCATION_QUERY);
  const [locationToAddress, { loading: locationToAddressLoading }] =
    useLazyQuery<LocationToAddressQuery, LocationToAddressQueryVariables>(
      LOCATION_TO_ADDRESS_QUERY,
    );

  const onUpdateAddress = (s: string) => {
    setShowLocationsDropdown(true);
    setAddress(s);
    locationSearch({ variables: { input: { searchString: s } } });
  };

  const onSelectAddress = (address: string) => {
    setShowLocationsDropdown(false);
    setAddress(address);
    addressToLocation({
      variables: { input: { address } },
      onCompleted: (data) => {
        setLocation([data.addressToLocation.lat, data.addressToLocation.lng]);
      },
    });
  };

  const onSetMapLocation = (lat: number, lng: number) => {
    locationToAddress({
      variables: { input: { latitude: lat, longitude: lng } },
      onCompleted: (data) => {
        setAddress(data.locationToAddress.address);
        setLocation([lat, lng]);
      },
    });
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

  const isLoading =
    locationToAddressLoading || addressLocationLoading || _isLoading;
  const canSave =
    !!title && !!address && !locationToAddressLoading && !isLoading;
  const mapLocation: L.LatLngTuple = addressLocationData
    ? [
        addressLocationData.addressToLocation.lat,
        addressLocationData.addressToLocation.lng,
      ]
    : defaultCenter;

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
              disabled: addressLocationLoading,
            },
          ]}
        />
        {!!locationSearchData?.locationSearch.result.length &&
          showLocationsDropdown && (
            <View style={{ gap: 6 }}>
              {locationSearchData.locationSearch.result.map((data, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    onSelectAddress(data);
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
          lat={mapLocation[0]}
          lng={mapLocation[1]}
          onMoveEnd={onSetMapLocation}
          interactive={!locationToAddressLoading && !addressLocationLoading}
        />
        <Body size="small" color="secondary">
          Dra kartan för att flytta nålen till rätt plats. Du kan zooma in och
          ut genom att nypa med två fingrar.
        </Body>
      </View>
      <Button
        label="Spara projekt"
        onPress={onSaveProject}
        disabled={!canSave}
        loading={_isLoading}
      />
    </View>
  );
};
