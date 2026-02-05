import type { UploadFile } from "antd";
import { z } from "zod";
import validator from "validator";

export const PartnerSchema = z.object({
  name: z.string({ message: "Ange namn" }).min(1, "Namnet kan inte vara tomt"),

  description: z
    .string({ message: "Ange beskrivning" })
    .min(2, { message: "Beskrivningen måste vara minst 2 tecken" }),

  websiteUrl: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .optional()
    .refine((val) => !val || validator.isURL(val), {
      message: "Ange en giltig webbadress.",
    }),

  logo: z.array(z.custom<UploadFile>()).min(1, { message: "Bild krävs" }),
});

export type PartnerSchemaType = z.infer<typeof PartnerSchema>;
