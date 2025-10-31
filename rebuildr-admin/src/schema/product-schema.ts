import { z } from "zod";
import { UploadFile } from "antd";
import {
  MeasurementUnitEnum,
  ProductConditionEnum,
  QuantityUnitEnum,
} from "gql/graphql";

export const ProductSchema = z.object({
  images: z
    .array(z.custom<UploadFile>())
    .min(1, { message: "Du måste välja minst en bild." }),

  documents: z.array(z.custom<UploadFile>()),

  title: z
    .string({ message: "Du måste ange rubrik." })
    .min(2, { message: "Rubriken måste vara minst 2 tecken!" }),

  description: z
    .string({ message: "Du måste ange beskrivning." })
    .min(3, { message: "Beskrivningen måste vara minst 3 tecken!" }),

  pricing: z
    .object({
      price: z.number().optional(),
      isGiveaway: z.boolean(),
    })
    .superRefine(({ price, isGiveaway }, ctx) => {
      if (isGiveaway) return;
      if (price === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Priset måste vara större än 0.",
        });
      }
    }),

  categoryId: z.string({ message: "Du måste ange kategori." }),

  brandId: z.string({ message: "Du måste ange märke." }),

  condition: z.nativeEnum(ProductConditionEnum, {
    message: "Du måste ange skick.",
  }),

  primaryMeasurement: z.object({
    quantity: z
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

  sellerId: z.string().optional(),

  project: z
    .object({
      hasProject: z.boolean(),
      projectId: z.string().optional(),
      address: z.string().optional(),
    })
    .superRefine(({ hasProject, projectId, address }, ctx) => {
      if (hasProject && !projectId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["projectId"],
          message: "Du måste ange projekt.",
        });
      }

      if (!hasProject && !address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["address"],
          message: "Du måste ange address.",
        });
      }
    }),

  transportation: z
    .object({
      selected: z.boolean().optional(),
      pickup: z.object({
        enabled: z.boolean(),
      }),
      delivery: z.object({
        enabled: z.boolean(),
        price: z
          .number()
          .nonnegative({ message: "Priset kan inte vara negativt." })
          .optional()
          .nullable(),
        radius: z
          .number()
          .nonnegative({ message: "Avståndet kan inte vara negativt." })
          .optional()
          .nullable(),
      }),
      shipping: z.object({
        enabled: z.boolean(),
        shippingPriceId: z.string().optional(),
      }),
    })
    .superRefine(({ pickup, delivery, shipping }, ctx) => {
      if (delivery.enabled) {
        if (delivery.price == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["delivery.price"],
            message: "Du måste ange transportpris.",
          });
        }

        if (delivery.radius == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["delivery.radius"],
            message: "Du måste ange avstånd.",
          });
        }
      }

      if (shipping.enabled && !shipping.shippingPriceId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shipping.shippingPriceId"],
          message: "Du måste ange vikt på paketet.",
        });
      }

      if (!pickup.enabled && !delivery.enabled && !shipping.enabled) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["selected"],
          message: "Du måste välja minst en leverans metod.",
        });
      }
    }),
});

export type ProductSchemaType = z.infer<typeof ProductSchema>;
