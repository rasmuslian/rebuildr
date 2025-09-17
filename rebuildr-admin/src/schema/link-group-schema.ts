import { z } from "zod";

export const LinkItemSchema = z.object({
  title: z
    .string({ message: "Ange titel!" })
    .min(1, { message: "Titeln får inte vara tom!" }),
  description: z.string({ message: "Ange beskrivning!" }).optional(),
  link: z
    .string({ message: "Ange länk!" })
    .url({ message: "Länken måste vara en giltig URL!" }),
});

export const LinkGroupSchema = z.object({
  links: z.array(LinkItemSchema).min(1, { message: "Minst en länk krävs!" }),
});

export type LinkItemSchemaType = z.infer<typeof LinkItemSchema>;
export type LinkGroupSchemaType = z.infer<typeof LinkGroupSchema>;
