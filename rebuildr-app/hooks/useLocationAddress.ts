import { gql, useLazyQuery } from "@apollo/client";
import { useState } from "react";
import {
  AddressToLocationQueryQuery,
  AddressToLocationQueryQueryVariables,
  LocationSearchQueryQuery,
  LocationSearchQueryQueryVariables,
  LocationToAddressQuery,
  LocationToAddressQueryVariables,
} from "@/gql/graphql";
import { defaultCenter } from "@constants/map";
import * as Location from "expo-location";

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

export const useLocationAddress = (input?: {
  address?: string;
  location?: { lat: number; lng: number };
}) => {
  const [address, setAddress] = useState(input?.address ?? "");
  const [location, setLocation] = useState<[number, number]>([
    input?.location?.lat ?? defaultCenter[0],
    input?.location?.lng ?? defaultCenter[1],
  ]);

  const [locationSearch, { data: locationSearchData }] = useLazyQuery<
    LocationSearchQueryQuery,
    LocationSearchQueryQueryVariables
  >(LOCATION_SEARCH_QUERY);
  const [addressToLocation, { loading: addressLocationLoading }] = useLazyQuery<
    AddressToLocationQueryQuery,
    AddressToLocationQueryQueryVariables
  >(ADDRESS_TO_LOCATION_QUERY, {
    onCompleted: (data) => {
      setLocation([data.addressToLocation.lat, data.addressToLocation.lng]);
    },
  });
  const [locationToAddress, { loading: locationToAddressLoading }] =
    useLazyQuery<LocationToAddressQuery, LocationToAddressQueryVariables>(
      LOCATION_TO_ADDRESS_QUERY,
    );

  const onUpdateAddress = (s: string) => {
    setAddress(s);
    locationSearch({ variables: { input: { searchString: s } } });
  };

  const onSelectAddress = (address: string) => {
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

  const onGetMyLocation = async () => {
    if (locationToAddressLoading) {
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission denied");
    }

    const position = await Location.getCurrentPositionAsync();

    locationToAddress({
      variables: {
        input: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      },
      onCompleted: (data) => {
        setAddress(data.locationToAddress.address);
        setLocation([position.coords.latitude, position.coords.longitude]);
      },
      onError: () => {
        setAddress(address);
      },
      fetchPolicy: "network-only",
    });
  };

  const isLoading = locationToAddressLoading || addressLocationLoading;

  return {
    address,
    location,
    loading: isLoading,
    updateAddress: onUpdateAddress,
    autoCompletes: locationSearchData?.locationSearch.result ?? [],
    selectAutoComplete: onSelectAddress,
    setMapLocation: onSetMapLocation,
    setMyLocation: onGetMyLocation,
  };
};
