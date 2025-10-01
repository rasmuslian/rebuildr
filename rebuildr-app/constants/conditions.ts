import { ProductConditionEnum } from "@/gql/graphql";

export const conditions: {
  [key in ProductConditionEnum]: { name: string; description: string };
} = {
  [ProductConditionEnum.New]: {
    name: "Originalskick",
    description:
      "Helt ny och oanvänd produkt i sin originalförpackning, med eventuell prislapp kvar",
  },
  [ProductConditionEnum.VeryGood]: {
    name: "Nyskick",
    description:
      "Oanvänd produkt utan originalförpackning eller prislapp, helt fri från slitage.",
  },
  [ProductConditionEnum.Good]: {
    name: "Gott skick",
    description:
      "Använd produkt med endast mindre slitage som inte påverkar funktion eller hållbarhet, eller ett äldre föremål med naturlig patina.",
  },
  [ProductConditionEnum.Okay]: {
    name: "Bruksskick",
    description:
      "Tydligt använd produkt med synligt slitage men fullt fungerande. Åldrande eller enklare restaurering kan vara en del av karaktären.",
  },
  [ProductConditionEnum.Bad]: {
    name: "Funktionellt skick",
    description:
      "Välanvänd produkt med kraftigt slitage men fortfarande brukbar. Kan behöva service eller renovering för optimal funktion.",
  },
};
