import { z } from "zod";
import validator from "validator";

export const ProjectSchema = z
  .object({
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

  address: z
    .string({
      required_error: "Du måste ange adress.",
      invalid_type_error: "Adress måste vara en text.",
    })
    .min(1, { message: "Du måste ange adress." }),

  showDetailsOnMap: z.boolean(),

  shortText: z
    .string({
      invalid_type_error: "Kort text måste vara en text.",
    })
    .max(120, { message: "Kort text får vara max 120 tecken." })
    .optional(),

  userId: z.string({ message: "Du måste ange ägare." }),

  contact: z.object({
    name: z.union([
      z.literal("").optional(),
      z.string().min(2, { message: "Namnet måste vara minst 2 tecken!" }),
    ]),

    email: z.union([
      z.literal("").optional(),
      z.string().email({ message: "Ange en giltig e-postadress." }),
    ]),

    phone: z.union([
      z.literal("").optional(),
      z.string().refine((val) => validator.isMobilePhone(val, "sv-SE"), {
        message: "Ange ett giltigt svenskt telefonnummer.",
      }),
    ]),
  }),
  })
  .superRefine((data, ctx) => {
    if (data.showDetailsOnMap && !data.shortText?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kort text krävs när projektinformation visas på kartan.",
        path: ["shortText"],
      });
    }
  });

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
