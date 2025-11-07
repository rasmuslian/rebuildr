import { MeasurementUnitEnum } from "gql/graphql";

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

export const measurementKeys = [
  "thickness",
  "height",
  "width",
  "length",
  "diameter",
  "weight",
] as const;

export type MeasurementType = (typeof measurementKeys)[number];

export const measurements = Object.freeze({
  thickness: { name: "Tjocklek", options: meterOptions },
  height: { name: "Höjd", options: meterOptions },
  width: { name: "Bredd", options: meterOptions },
  length: { name: "Längd", options: meterOptions },
  diameter: { name: "Diameter", options: meterOptions },
  weight: { name: "Vikt", options: kgOptions },
} satisfies Record<MeasurementType, { name: string; options: UnitOptions }>);

export type MeasurementsObjectType = Partial<
  Record<MeasurementType, { value: number; unit: MeasurementUnitEnum }>
>;
