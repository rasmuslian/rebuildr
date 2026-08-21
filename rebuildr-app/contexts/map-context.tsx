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
  InternalAdMapPinGroupsQuery,
  InternalAdMapPinGroupsQueryVariables,
} from "@/gql/graphql";
import { useReducerState } from "@hooks/useReducerState";
import { useQuery } from "@apollo/client";
import { MAP_PIN_GROUPS } from "@/queries";
import { INTERNAL_AD_MAP_PIN_GROUPS } from "@/queries/internal-ads";
import { LatLngExpression } from "leaflet";
import { useLocationContext } from "@context/location-context";
import { defaultCenter } from "@constants/map";

export type Bounds = {
  northEast: PointInput;
  southWest: PointInput;
};

type StateType = {
  showPrice: boolean;
  center: LatLngExpression;
  userLocation: LatLngExpression;
  zoom: number;
  // Live viewport, updated on every pan/zoom — drives the map pins.
  bounds?: Bounds;
  // Applied viewport the results list is restricted to. Distinct from `bounds`
  // so the list only follows the map on an explicit action (button/toggle).
  searchArea?: Bounds;
  searchOnMove: boolean;
  // Filters pushed in by the surrounding search UI so pins match the list.
  productsInput?: ProductsInput;
  projectsInput?: ProjectsInput;
  // Shared hover/selection so list cards and map pins can highlight each other.
  hoveredProductId?: string;
  selectedProductId?: string;
  // Incremented to ask the map to zoom out (e.g. from an empty-results state).
  zoomOutSignal: number;
  // Set to ask the map to frame a region (e.g. the user + their nearest hit).
  fitBounds?: Bounds;
  mapPinGroups: MapPinGroupsQuery["mapPinGroups"]["mapPinGroups"];
  activePin?: {
    location: LatLngExpression;
    popup: React.ReactNode;
  };
  searchScope: "public" | "internal";
};

const initialState: StateType = {
  showPrice: false,
  center: defaultCenter,
  userLocation: defaultCenter,
  zoom: 5,
  bounds: undefined,
  searchArea: undefined,
  searchOnMove: false,
  productsInput: undefined,
  projectsInput: undefined,
  hoveredProductId: undefined,
  selectedProductId: undefined,
  zoomOutSignal: 0,
  fitBounds: undefined,
  mapPinGroups: [],
  activePin: undefined,
  searchScope: "public",
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
  searchScope?: "public" | "internal";
} & PropsWithChildren;

export const MapProvider = ({
  children,
  initialCenter,
  productsInput,
  projectsInput,
  searchScope = "public",
}: Props) => {
  const [state, setState] = useReducerState<StateType>({
    ...initialState,
    searchScope,
  });
  const { userCoords } = useLocationContext();

  // Prefer filters set through context (e.g. by the search UI that hoists this
  // provider) and fall back to the props for standalone map usages.
  const effectiveProductsInput = state.productsInput ?? productsInput;
  const effectiveProjectsInput = state.projectsInput ?? projectsInput;

  useQuery<MapPinGroupsQuery, MapPinGroupsQueryVariables>(MAP_PIN_GROUPS, {
    variables: state.bounds
      ? {
          input: {
            northEast: state.bounds.northEast,
            southWest: state.bounds.southWest,
            zoom: state.zoom,
            productsInput: effectiveProductsInput,
            projectsInput: effectiveProjectsInput,
          },
        }
      : undefined,
    skip: !state.bounds || searchScope === "internal",
    onCompleted: (data) => {
      setState({ mapPinGroups: data.mapPinGroups.mapPinGroups });
    },
  });

  useQuery<InternalAdMapPinGroupsQuery, InternalAdMapPinGroupsQueryVariables>(
    INTERNAL_AD_MAP_PIN_GROUPS,
    {
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
      skip: !state.bounds || searchScope !== "internal",
      onCompleted: (data) => {
        setState({ mapPinGroups: data.internalAdMapPinGroups.mapPinGroups });
      },
    },
  );

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
