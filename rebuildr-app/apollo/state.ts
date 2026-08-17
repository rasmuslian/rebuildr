import { makeVar } from "@apollo/client";

import { PointInput } from "@/gql/graphql";
import { initialFilterProduct } from "@context/filter-product-context";

export type MapSearchArea = {
  northEast: PointInput;
  southWest: PointInput;
};

export const isLoggedInVar = makeVar(false);
export const showHamburgerMenuVar = makeVar(false);
export const productFilterVar = makeVar(initialFilterProduct);

// Carries a map viewport from the full-screen map back to the results list,
// which lives on another route and therefore has its own map provider.
export const pendingMapSearchAreaVar = makeVar<MapSearchArea | undefined>(
  undefined,
);
