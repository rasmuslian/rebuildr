import React, {
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch,
  useEffect,
} from "react";
import { PointInput, MapPinsQuery, MapPinsQueryVariables } from "@/gql/graphql";
import { useReducerState } from "@hooks/useReducerState";
import { useQuery } from "@apollo/client";
import { MAP_PINS_QUERY } from "@/queries";
import { LatLngExpression } from "leaflet";
import { useLocationContext } from "@context/location-context";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { defaultCenter } from "@constants/map";

type Bounds = {
  northEast: PointInput;
  southWest: PointInput;
};

type StateType = {
  showPrice: boolean;
  center: LatLngExpression;
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

export const MapProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useReducerState<StateType>(initialState);
  const { userCoords } = useLocationContext();
  const { filter } = useFilterProduct();

  useQuery<MapPinsQuery, MapPinsQueryVariables>(MAP_PINS_QUERY, {
    variables: state.bounds
      ? {
          input: {
            northEast: state.bounds.northEast,
            southWest: state.bounds.southWest,
            zoom: state.zoom,
            productsInput: {
              searchString: filter.searchString,
              orderBy: filter.sorting,
              categoryIds:
                filter.categoryIds ?? filter.rootCategoryIds ?? undefined,
              brandIds: filter.brandIds,
              conditions: filter.conditions,
              minPrice: filter.price[0],
              maxPrice: filter.price[1],
            },
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
      setState({ center: [userCoords.latitude, userCoords.longitude] });
  }, [userCoords]);

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
