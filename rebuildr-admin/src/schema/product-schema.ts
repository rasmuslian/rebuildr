import { z } from "zod";
import { UploadFile } from "antd";
import {
  MeasurementUnitEnum,
  ProductConditionEnum,
  QuantityUnitEnum,
} from "gql/graphql";

export const ProductSchema = z.object({
  title: z
    .string({ message: "Du måste ange rubrik." })
    .min(2, { message: "Rubriken måste vara minst 2 tecken!" }),

  description: z
    .string({ message: "Du måste ange beskrivning." })
    .min(3, { message: "Beskrivningen måste vara minst 3 tecken!" }),

  price: z.coerce
    .number({ message: "Du måste ange pris." })
    .positive({ message: "Priset måste vara större än 0." }),

  images: z
    .array(z.custom<UploadFile>())
    .min(1, { message: "Du måste välja minst en bild." }),

  categoryId: z.string({ message: "Du måste ange kategori." }),

  brandId: z.string({ message: "Du måste ange märke." }),

  condition: z.nativeEnum(ProductConditionEnum, {
    message: "Du måste ange skick.",
  }),

  primaryMeasurement: z.object({
    quantity: z.coerce
      .number({ message: "Du måste ange antal." })
      .positive({ message: "Antal måste vara större än 0." }),

    unit: z.nativeEnum(QuantityUnitEnum, { message: "Du måste ange enhet." }),
  }),

  secondaryMeasurement: z
    .object({
      enabled: z.boolean(),
      quantity: z
        .number({ message: "Antal måste vara ett nummer." })
        .positive({ message: "Antal måste vara större än 0." })
        .optional(),

      unit: z.nativeEnum(QuantityUnitEnum).optional(),
    })
    .superRefine(({ enabled, quantity, unit }, ctx) => {
      if (enabled && quantity === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quantity"],
          message: "Du måste ange antal.",
        });
      }

      if (enabled && unit === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["unit"],
          message: "Du måste ange enhet.",
        });
      }
    }),

  measurement: z.object({
    enabled: z.boolean(),

    thickness: z
      .number()
      .positive({ message: "Tjocklek måste vara större än 0." })
      .optional()
      .nullable(),
    thicknessUnit: z.nativeEnum(MeasurementUnitEnum).optional(),

    height: z
      .number()
      .positive({ message: "Höjd måste vara större än 0." })
      .optional()
      .nullable(),
    heightUnit: z.nativeEnum(MeasurementUnitEnum).optional(),

    width: z
      .number()
      .positive({ message: "Bredd måste vara större än 0." })
      .optional()
      .nullable(),
    widthUnit: z.nativeEnum(MeasurementUnitEnum).optional(),

    length: z
      .number()
      .positive({ message: "Längd måste vara större än 0." })
      .optional()
      .nullable(),
    lengthUnit: z.nativeEnum(MeasurementUnitEnum).optional(),

    diameter: z
      .number()
      .positive({ message: "Diameter måste vara större än 0." })
      .optional()
      .nullable(),
    diameterUnit: z.nativeEnum(MeasurementUnitEnum).optional(),

    weight: z
      .number()
      .positive({ message: "Vikt måste vara större än 0." })
      .optional()
      .nullable(),
    weightUnit: z.nativeEnum(MeasurementUnitEnum).optional(),
  }),

  address: z
    .string({ message: "Du måste ange adress." })
    .min(1, { message: "Du måste ange adress." }),
});

export type ProductSchemaType = z.infer<typeof ProductSchema>;
