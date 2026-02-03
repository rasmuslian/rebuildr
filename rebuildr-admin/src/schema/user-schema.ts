import { z } from "zod";
import validator from "validator";

export const UserSchema = z.object({
  isAdmin: z.boolean(),
  isFeatured: z.boolean(),

  address: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .optional(),

  city: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .optional(),

  postCode: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .optional()
    .refine((val) => !val || validator.isPostalCode(val, "SE"), {
      message: "Ogiltigt svenskt postnummer.",
    }),

  name: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val.trim()))
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: "Namnet måste vara minst 2 tecken!",
    }),

  phoneNumber: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .optional()
    .refine((val) => !val || validator.isMobilePhone(val, "sv-SE"), {
      message: "Ange ett giltigt svenskt telefonnummer.",
    }),

  websiteUrl: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .optional()
    .refine((val) => !val || validator.isURL(val), {
      message: "Ange en giltig webbadress.",
    }),
});

export type UserSchemaType = z.infer<typeof UserSchema>;
