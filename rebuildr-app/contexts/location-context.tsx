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
  getBackgroundPermissionsAsync,
  LocationObjectCoords,
} from "expo-location";
import { Modal, View } from "react-native";
import { useReducerState } from "@hooks/useReducerState";
import { Button } from "@components/buttons/button";
import { Body, Title } from "@components/typography/text";

type StateType = {
  modalVisible: boolean;
  userCoords?: LocationObjectCoords;
};

const initialState: StateType = {
  modalVisible: false,
  userCoords: undefined,
};

type ContextType = {
  userCoords?: LocationObjectCoords;
};

const Context = createContext<ContextType | null>(null);

export const LocationProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useReducerState<StateType>(initialState);

  const askForUserCoords = async () => {
    const { status } = await requestForegroundPermissionsAsync();
    if (status !== PermissionStatus.GRANTED) return;
    const { coords } = await getCurrentPositionAsync();
    setState({ userCoords: coords, modalVisible: false });
  };

  const getUserCoords = async () => {
    const { status } = await getBackgroundPermissionsAsync();
    if (status !== PermissionStatus.GRANTED) {
      setState({ modalVisible: true });
    } else {
      const { coords } = await getCurrentPositionAsync();
      setState({ userCoords: coords });
    }
  };

  useEffect(() => {
    getUserCoords();
  }, []);

  return (
    <Context.Provider value={{ userCoords: state.userCoords }}>
      {children}

      <Modal visible={state.modalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 12,
              maxWidth: 350,
              gap: 16,
            }}
          >
            <Title size="medium">Tillåt platsåtkomst</Title>

            <Body size="medium">
              Vi behöver din plats för att visa relevanta objekt nära dig.
            </Body>

            <Button type="filled" label="Tillåt" onPress={askForUserCoords} />
          </View>
        </View>
      </Modal>
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
