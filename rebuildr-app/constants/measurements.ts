import { MeasurementUnitEnum } from "@/gql/graphql";

export type OptionsType = {
  [key in MeasurementUnitEnum]?: { name: string; conversion: number };
};
const meterOptions: OptionsType = {
  MM: {
    name: "mm",
    conversion: 1,
  },
  CM: {
    name: "cm",
    conversion: 10,
  },
  DM: {
    name: "dm",
    conversion: 100,
  },
  M: {
    name: "m",
    conversion: 1000,
  },
};
const kgOptions: OptionsType = {
  KG: {
    name: "kg",
    conversion: 1,
  },
};
export const measurementKeys = [
  "thickness",
  "height",
  "width",
  "length",
  "diameter",
  "weight",
] as const;
export type MeasurementType = (typeof measurementKeys)[number];
export const measurements: {
  [key in (typeof measurementKeys)[number]]: {
    name: string;
    options: OptionsType;
  };
} = {
  thickness: {
    name: "Tjocklek",
    options: meterOptions,
  },
  height: {
    name: "Höjd",
    options: meterOptions,
  },
  width: {
    name: "Bredd",
    options: meterOptions,
  },
  length: {
    name: "Längd",
    options: meterOptions,
  },
  diameter: {
    name: "Diameter",
    options: meterOptions,
  },
  weight: {
    name: "Vikt",
    options: kgOptions,
  },
} as const;
export type MeasurementsObjectType = {
  [key in MeasurementType]?: { value: number; unit: MeasurementUnitEnum };
};
