import { ProductConditionEnum } from "@/gql/graphql";

export const conditions: {
  [key in ProductConditionEnum]: { name: string; description: string };
} = {
  [ProductConditionEnum.New]: {
    name: "Ny i originalförpackning",
    description:
      "Helt ny och oanvänd produkt i sin originalförpackning, med eventuell prislapp kvar",
  },
  [ProductConditionEnum.VeryGood]: {
    name: "Nyskick utan förpackning",
    description:
      "Oanvänd produkt utan originalförpackning eller prislapp, helt fri från bruksslitage",
  },
  [ProductConditionEnum.Good]: {
    name: "Gott & bevarat skick",
    description:
      "Använd produkt med endast mindre slitage som inte påverkar funktion eller hållbarhet, eller ett äldre föremål med naturlig patina",
  },
  [ProductConditionEnum.Okay]: {
    name: "Bruksskick",
    description:
      "Tydligt använd produkt med synligt slitage men fullt fungerande, där åldrande eller restaurering kan vara en del av dess karaktär",
  },
  [ProductConditionEnum.Bad]: {
    name: "Slitet men funktionellt",
    description:
      "Välanvänd produkt med kraftigt slitage men fortsatt brukbar, eventuellt med behov av renovering/service för optimal funktion",
  },
};
