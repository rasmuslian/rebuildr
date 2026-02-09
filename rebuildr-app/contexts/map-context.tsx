import React, {
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch,
  useEffect,
} from "react";
import {
  PointInput,
  MapPinsQuery,
  MapPinsQueryVariables,
  ProductsInput,
} from "@/gql/graphql";
import { useReducerState } from "@hooks/useReducerState";
import { useQuery } from "@apollo/client";
import { MAP_PINS_QUERY } from "@/queries";
import { LatLngExpression } from "leaflet";
import { useLocationContext } from "@context/location-context";
import { defaultCenter } from "@constants/map";

type Bounds = {
  northEast: PointInput;
  southWest: PointInput;
};

type StateType = {
  showPrice: boolean;
  center: LatLngExpression;
  userLocation: LatLngExpression;
  zoom: number;
  bounds?: Bounds;
  pins: MapPinsQuery["productMapPinsInBoundingBox"]["pins"];
  activePin?: {
    location: LatLngExpression;
    popup: React.ReactNode;
  };
};

const initialState: StateType = {
  showPrice: false,
  center: defaultCenter,
  userLocation: defaultCenter,
  zoom: 5,
  bounds: undefined,
  pins: [],
  activePin: undefined,
};

type ContextType = {
  state: StateType;
  setState: Dispatch<Partial<StateType>>;
};

const Context = createContext<ContextType | null>(null);

type Props = {
  initialCenter?: LatLngExpression;
  productsInput?: ProductsInput;
} & PropsWithChildren;

export const MapProvider = ({
  children,
  initialCenter,
  productsInput,
}: Props) => {
  const [state, setState] = useReducerState<StateType>(initialState);
  const { userCoords } = useLocationContext();

  useQuery<MapPinsQuery, MapPinsQueryVariables>(MAP_PINS_QUERY, {
    variables: state.bounds
      ? {
          input: {
            northEast: state.bounds.northEast,
            southWest: state.bounds.southWest,
            zoom: state.zoom,
            productsInput,
          },
        }
      : undefined,
    skip: !state.bounds,
    onCompleted: (data) => {
      setState({ pins: data.productMapPinsInBoundingBox.pins });
    },
  });

  useEffect(() => {
    if (userCoords)
      setState({
        userLocation: [userCoords.latitude, userCoords.longitude],
        center:
          state.center === defaultCenter
            ? [userCoords.latitude, userCoords.longitude]
            : state.center,
      });
  }, [userCoords]);

  useEffect(() => {
    if (!initialCenter) return;
    if (state.center === defaultCenter) {
      setState({ center: initialCenter });
    }
  }, [initialCenter]);

  return (
    <Context.Provider
      value={{
        state,
        setState,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useMapContext = () => {
  const contextData = useContext(Context);

  if (!contextData) {
    throw new Error("Map context is used outside of its provider.");
  }
  return contextData;
};
