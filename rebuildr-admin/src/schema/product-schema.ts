import { z } from "zod";
import { UploadFile } from "antd";
import {
  MeasurementUnitEnum,
  ProductConditionEnum,
  QuantityUnitEnum,
} from "gql/graphql";

export const ProductSchema = z.object({
  title: z
    .string({
      required_error: "Du måste ange rubrik.",
      invalid_type_error: "Rubrik måste vara en text.",
    })
    .min(2, { message: "Rubriken måste vara minst 2 tecken!" }),

  description: z
    .string({
      required_error: "Du måste ange beskrivning.",
      invalid_type_error: "Beskrivning måste vara en text.",
    })
    .min(3, { message: "Beskrivningen måste vara minst 3 tecken!" }),

  price: z.coerce
    .number({
      required_error: "Du måste ange pris.",
      invalid_type_error: "Pris måste vara ett nummer.",
    })
    .positive({ message: "Priset måste vara större än 0." }),

  images: z
    .array(z.custom<UploadFile>())
    .min(1, { message: "Du måste välja minst en bild." }),

  categoryId: z.string({
    required_error: "Du måste ange kategori.",
    invalid_type_error: "Kategori måste vara en text.",
  }),

  brandId: z.string({
    required_error: "Du måste ange märke.",
    invalid_type_error: "Märke måste vara en text.",
  }),

  condition: z.nativeEnum(ProductConditionEnum, {
    required_error: "Du måste ange skick.",
    invalid_type_error: "Skick är ogiltigt.",
  }),

  primaryMeasurement: z.object({
    quantity: z.coerce
      .number({
        required_error: "Du måste ange primär mängd.",
        invalid_type_error: "Primär mängd måste vara ett nummer.",
      })
      .positive({ message: "Primär mängd måste vara större än 0." }),

    unit: z.nativeEnum(QuantityUnitEnum, {
      required_error: "Du måste ange primär enhet.",
      invalid_type_error: "Primär enhet är ogiltig.",
    }),
  }),

  secondaryMeasurement: z
    .object({
      enabled: z.boolean({
        required_error: "Du måste ange om sekundär mätning är aktiverad.",
        invalid_type_error: "Sekundär mätning måste vara sant eller falskt.",
      }),
      quantity: z
        .number({
          invalid_type_error: "Sekundär mängd måste vara ett nummer.",
        })
        .positive({ message: "Sekundär mängd måste vara större än 0." })
        .optional(),
      unit: z
        .nativeEnum(QuantityUnitEnum, {
          invalid_type_error: "Sekundär enhet är ogiltig.",
        })
        .optional(),
    })
    .superRefine(({ enabled, quantity, unit }, ctx) => {
      if (enabled && quantity === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quantity"],
          message: "Du måste ange sekundär mängd.",
        });
      }

      if (enabled && unit === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["unit"],
          message: "Du måste ange sekundär enhet.",
        });
      }
    }),

  measurement: z.object({
    enabled: z.boolean({
      required_error: "Du måste ange om mått är aktiverat.",
      invalid_type_error: "Mått måste vara sant eller falskt.",
    }),

    thickness: z
      .number({ invalid_type_error: "Tjocklek måste vara ett nummer." })
      .positive({ message: "Tjocklek måste vara större än 0." })
      .optional(),
    thicknessUnit: z
      .nativeEnum(MeasurementUnitEnum, {
        invalid_type_error: "Tjockleksenhet är ogiltig.",
      })
      .optional(),

    height: z
      .number({ invalid_type_error: "Höjd måste vara ett nummer." })
      .positive({ message: "Höjd måste vara större än 0." })
      .optional(),
    heightUnit: z
      .nativeEnum(MeasurementUnitEnum, {
        invalid_type_error: "Höjdenhet är ogiltig.",
      })
      .optional(),

    width: z
      .number({ invalid_type_error: "Bredd måste vara ett nummer." })
      .positive({ message: "Bredd måste vara större än 0." })
      .optional(),
    widthUnit: z
      .nativeEnum(MeasurementUnitEnum, {
        invalid_type_error: "Breddenhet är ogiltig.",
      })
      .optional(),

    length: z
      .number({ invalid_type_error: "Längd måste vara ett nummer." })
      .positive({ message: "Längd måste vara större än 0." })
      .optional(),
    lengthUnit: z
      .nativeEnum(MeasurementUnitEnum, {
        invalid_type_error: "Längdenhet är ogiltig.",
      })
      .optional(),

    diameter: z
      .number({ invalid_type_error: "Diameter måste vara ett nummer." })
      .positive({ message: "Diameter måste vara större än 0." })
      .optional(),
    diameterUnit: z
      .nativeEnum(MeasurementUnitEnum, {
        invalid_type_error: "Diameterenhet är ogiltig.",
      })
      .optional(),

    weight: z
      .number({ invalid_type_error: "Vikt måste vara ett nummer." })
      .positive({ message: "Vikt måste vara större än 0." })
      .optional(),
    weightUnit: z
      .nativeEnum(MeasurementUnitEnum, {
        invalid_type_error: "Viktenhet är ogiltig.",
      })
      .optional(),
  }),

  address: z
    .string({
      required_error: "Du måste ange adress.",
      invalid_type_error: "Adress måste vara en text.",
    })
    .min(1, { message: "Du måste ange adress." }),
});

export type ProductSchemaType = z.infer<typeof ProductSchema>;
