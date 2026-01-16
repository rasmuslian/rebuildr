import { MeasurementTypeEnum, MeasurementUnitEnum } from "gql/graphql";

type UnitOption = { name: string; conversion: number };
type UnitOptions = Partial<Record<MeasurementUnitEnum, UnitOption>>;

const meterOptions: UnitOptions = {
  MM: { name: "mm", conversion: 1 },
  CM: { name: "cm", conversion: 10 },
  DM: { name: "dm", conversion: 100 },
  M: { name: "m", conversion: 1000 },
};

const kgOptions: UnitOptions = {
  KG: { name: "kg", conversion: 1 },
};

export const productFieldMeasurementKeys = [
  "thickness",
  "height",
  "width",
  "length",
  "diameter",
  "weight",
] as const;

export type MeasurementType = (typeof productFieldMeasurementKeys)[number];

export const measurements = Object.freeze({
  THICKNESS: {
    name: "Tjocklek",
    options: meterOptions,
    productField: "thickness",
  },
  HEIGHT: { name: "Höjd", options: meterOptions, productField: "height" },
  WIDTH: { name: "Bredd", options: meterOptions, productField: "width" },
  LENGTH: { name: "Längd", options: meterOptions, productField: "length" },
  DIAMETER: {
    name: "Diameter",
    options: meterOptions,
    productField: "diameter",
  },
  WEIGHT: { name: "Vikt", options: kgOptions, productField: "weight" },
} satisfies Record<
  MeasurementTypeEnum,
  { name: string; options: UnitOptions; productField: MeasurementType }
>);

export type MeasurementsObjectType = Partial<
  Record<MeasurementType, { value: number; unit: MeasurementUnitEnum }>
>;
