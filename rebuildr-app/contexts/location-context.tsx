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
  LocationObjectCoords,
} from "expo-location";

import { useReducerState } from "@hooks/useReducerState";

type StateType = {
  userCoords?: LocationObjectCoords;
};

const initialState: StateType = {
  userCoords: undefined,
};

type ContextType = {
  userCoords?: LocationObjectCoords;
};

const Context = createContext<ContextType | null>(null);

export const LocationProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useReducerState<StateType>(initialState);

  useEffect(() => {
    (async () => {
      const { status } = await requestForegroundPermissionsAsync();
      if (status !== PermissionStatus.GRANTED) return;
      const { coords } = await getCurrentPositionAsync();
      setState({ userCoords: coords });
    })();
  }, []);

  return (
    <Context.Provider
      value={{
        userCoords: state.userCoords,
      }}
    >
      {children}
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
