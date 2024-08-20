import { ProductConditionEnum } from "src/gql/graphql";

export const conditionTranslationMap: {
  // eslint-disable-next-line no-unused-vars
  [key in ProductConditionEnum]: string;
} = {
  [ProductConditionEnum.New]: "Nytt sick - Helt ny",
  [ProductConditionEnum.VeryGood]: "Mycket bra skick - Som ny",
  [ProductConditionEnum.Good]: "Bra skick - Sparsamt använd",
  [ProductConditionEnum.Okay]: "Okej skick - Synligt använd",
  [ProductConditionEnum.Bad]: "Funkar inte - kan fixas",
};
