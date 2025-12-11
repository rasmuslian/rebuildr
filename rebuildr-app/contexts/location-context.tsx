import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
} from "react";
import {
  PermissionStatus,
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  getForegroundPermissionsAsync,
  LocationObjectCoords,
} from "expo-location";
import { View } from "react-native";
import { useReducerState } from "@hooks/useReducerState";
import { Button } from "@components/buttons/button";
import { Body } from "@components/typography/text";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { isIOSDevice } from "@/utils/deviceInfo";

type StateType = {
  open: boolean;
  userCoords?: LocationObjectCoords;
};

const initialState: StateType = {
  open: false,
  userCoords: undefined,
};

type ContextType = {
  userCoords?: LocationObjectCoords;
};

const Context = createContext<ContextType | null>(null);

export const LocationProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useReducerState<StateType>(initialState);
  const isIos = isIOSDevice();

  const askForUserCoords = async () => {
    const { status } = await requestForegroundPermissionsAsync();
    if (status !== PermissionStatus.GRANTED) return;
    const { coords } = await getCurrentPositionAsync();
    setState({ userCoords: coords, open: false });
  };

  const getUserCoords = async () => {
    const { status } = await getForegroundPermissionsAsync();
    if (status !== PermissionStatus.GRANTED) {
      setState({ open: true });
    } else {
      const { coords } = await getCurrentPositionAsync();
      setState({ userCoords: coords });
    }
  };

  useEffect(() => {
    if (isIos) {
      getUserCoords();
    } else {
      askForUserCoords();
    }
  }, [isIos]);

  return (
    <Context.Provider value={{ userCoords: state.userCoords }}>
      {children}

      <BottomSheet name="plats" open={state.open} title="platsåtkomst">
        <View style={{ maxWidth: 400, gap: 16 }}>
          <Body size="medium">
            Vi behöver din plats för att visa relevanta objekt nära dig.
          </Body>

          <Button type="filled" label="Tillåt" onPress={askForUserCoords} />
        </View>
      </BottomSheet>
    </Context.Provider>
  );
};

export const useLocationContext = () => {
  const contextData = useContext(Context);

  if (!contextData) {
    throw new Error("Location context is used outside of its provider.");
  }
  return contextData;
};
