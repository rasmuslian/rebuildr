import { ProductConditionEnum } from "@/gql/graphql";

// eslint-disable-next-line no-unused-vars
export const ProductConditionToText: { [key in ProductConditionEnum]: string } =
  {
    BAD: "Dåligt skick",
    GOOD: "Gott skick",
    NEW: "Nytt skick",
    OKAY: "Okej skick",
    VERY_GOOD: "Mycket gott skick",
  };
