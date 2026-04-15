import React, {
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch,
  useEffect,
} from "react";
import {
  PointInput,
  ProductsInput,
  MapPinGroupsQuery,
  MapPinGroupsQueryVariables,
  ProjectsInput,
} from "@/gql/graphql";
import { useReducerState } from "@hooks/useReducerState";
import { useQuery } from "@apollo/client";
import { MAP_PIN_GROUPS } from "@/queries";
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
  mapPinGroups: MapPinGroupsQuery["mapPinGroups"]["mapPinGroups"];
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
  mapPinGroups: [],
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
  projectsInput?: ProjectsInput;
} & PropsWithChildren;

export const MapProvider = ({
  children,
  initialCenter,
  productsInput,
  projectsInput,
}: Props) => {
  const [state, setState] = useReducerState<StateType>(initialState);
  const { userCoords } = useLocationContext();

  useQuery<MapPinGroupsQuery, MapPinGroupsQueryVariables>(MAP_PIN_GROUPS, {
    variables: state.bounds
      ? {
          input: {
            northEast: state.bounds.northEast,
            southWest: state.bounds.southWest,
            zoom: state.zoom,
            productsInput,
            projectsInput,
          },
        }
      : undefined,
    skip: !state.bounds,
    onCompleted: (data) => {
      setState({ mapPinGroups: data.mapPinGroups.mapPinGroups });
    },
  });

  useEffect(() => {
    if (userCoords) {
      setState({
        userLocation: [userCoords.latitude, userCoords.longitude],
        center:
          state.center === defaultCenter
            ? [userCoords.latitude - 0.008, userCoords.longitude]
            : state.center,
      });
    }
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
