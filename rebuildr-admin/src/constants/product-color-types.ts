import { ColorTypeEnum } from "gql/graphql";

export const colorTypes = {
  [ColorTypeEnum.Ncs]: {
    text: "NCS",
  },
  [ColorTypeEnum.FreeText]: {
    text: "Färg",
  },
};
