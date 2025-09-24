import { z } from "zod";

export const CTASchema = z.object({
  title: z
    .string({ message: "Ange rubrik!" })
    .min(3, { message: "Rubriken måste vara minst 3 tecken!" }),
  description: z
    .string({ message: "Ange beskrivning!" })
    .min(10, { message: "Beskrivningen måste vara minst 10 tecken!" }),
  button: z.object({
    label: z
      .string({ message: "Ange knapptext!" })
      .min(1, { message: "Knapptext får inte vara tom!" }),
    link: z
      .string({ message: "Ange länk!" })
      .url({ message: "Länken måste vara en giltig URL!" }),
  }),
});

export type CTASchemaType = z.infer<typeof CTASchema>;
