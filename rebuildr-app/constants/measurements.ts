type OptionsType = {
  [key: string]: { name: string; conversion: number };
};
const meterOptions: OptionsType = {
  mm: {
    name: "mm",
    conversion: 1,
  },
  cm: {
    name: "cm",
    conversion: 10,
  },
  dm: {
    name: "dm",
    conversion: 100,
  },
  m: {
    name: "m",
    conversion: 1000,
  },
};
const kgOptions: OptionsType = {
  kg: {
    name: "kg/m",
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
export type MeasurementsObjectType = { [key in MeasurementType]?: number };
