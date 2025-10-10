import { z } from "zod";
import { UploadFile } from "antd";
import { ProductConditionEnum, QuantityUnitEnum } from "gql/graphql";

export const ProductSchema = z.object({
  title: z
    .string({ message: "Ange rubrik!" })
    .min(2, { message: "Rubriken måste vara minst 2 tecken!" }),

  description: z
    .string({ message: "Ange beskrivning!" })
    .min(3, { message: "Beskrivningen måste vara minst 3 tecken!" }),

  price: z.coerce
    .number({ message: "Priset måste anges." })
    .positive({ message: "Priset måste vara större än 0." }),

  images: z.array(z.custom<UploadFile>()).min(1, {
    message: "Minst en bild måste väljas.",
  }),

  categoryId: z.string({ message: "Kategori måste anges." }),
  brandId: z.string({ message: "Märke måste anges." }),
  condition: z.nativeEnum(ProductConditionEnum),

  primaryMeasurement: z.object({
    quantity: z.coerce
      .number({ message: "Primär mängd måste anges." })
      .positive({ message: "Primär mängd måste vara större än 0." }),

    unit: z.nativeEnum(QuantityUnitEnum, {
      required_error: "Primär enhet måste anges.",
    }),
  }),

  secondaryMeasurement: z
    .object({
      enabled: z.boolean(),
      quantity: z
        .number()
        .positive({ message: "Sekundär mängd måste vara större än 0." })
        .optional(),
      unit: z.nativeEnum(QuantityUnitEnum).optional(),
    })
    .superRefine(({ enabled, quantity, unit }, ctx) => {
      if (enabled && !quantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quantity"],
          message: "Sekundär mängd måste anges.",
        });
      }

      if (enabled && !unit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["unit"],
          message: "Sekundär enhet måste anges.",
        });
      }
    }),
});

export type ProductSchemaType = z.infer<typeof ProductSchema>;
