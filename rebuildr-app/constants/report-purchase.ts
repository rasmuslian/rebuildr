import { ReportPurchaseTypeEnum } from "@/gql/graphql";

export const reportType: {
  [key in ReportPurchaseTypeEnum]: { title: string; description: string };
} = {
  [ReportPurchaseTypeEnum.NotAsDescribed]: {
    title: "Varan stämmer inte med beskrivningen",
    description: "Den såg annorlunda ut än vad annonsen visade",
  },
  [ReportPurchaseTypeEnum.Damaged]: {
    title: "Skadad eller trasig vara",
    description: "Den var inte i det skick som utlovades",
  },
  [ReportPurchaseTypeEnum.WrongProduct]: {
    title: "Fel vara skickades",
    description: "Det du fick är inte det du köpte",
  },
  [ReportPurchaseTypeEnum.ProductMissing]: {
    title: "Varan saknas",
    description: "Paketet var tomt eller något fattades",
  },
  [ReportPurchaseTypeEnum.Other]: {
    title: "Annat problem",
    description: "Något annat gick fel med köpet",
  },
};
