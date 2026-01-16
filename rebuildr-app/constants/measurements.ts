import { MeasurementTypeEnum, MeasurementUnitEnum } from "@/gql/graphql";

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

export const measurements: {
  [key in MeasurementTypeEnum]: {
    name: string;
    prefix: string;
    options: OptionsType;
  };
} = {
  THICKNESS: {
    name: "Tjocklek",
    prefix: "T",
    options: meterOptions,
  },
  HEIGHT: {
    name: "Höjd",
    prefix: "H",
    options: meterOptions,
  },
  WIDTH: {
    name: "Bredd",
    prefix: "B",
    options: meterOptions,
  },
  LENGTH: {
    name: "Längd",
    prefix: "L",
    options: meterOptions,
  },
  DIAMETER: {
    name: "Diameter",
    prefix: "D",
    options: meterOptions,
  },
  WEIGHT: {
    name: "Vikt",
    prefix: "V",
    options: kgOptions,
  },
} as const;
export type MeasurementsObjectType = {
  [key in MeasurementTypeEnum]?: { value: number; unit: MeasurementUnitEnum };
};
