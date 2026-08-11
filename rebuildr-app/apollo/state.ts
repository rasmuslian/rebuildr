import { makeVar } from "@apollo/client";

import { initialFilterProduct } from "@context/filter-product-context";

export const isLoggedInVar = makeVar(false);
export const showHamburgerMenuVar = makeVar(false);
export const productFilterVar = makeVar(initialFilterProduct);
export const internalProductFilterVar = makeVar(initialFilterProduct);
