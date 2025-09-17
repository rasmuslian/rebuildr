import { z } from "zod";

export const ArticleSchema = z.object({
  title: z
    .string({ message: "Ange rubrik!" })
    .min(3, { message: "Rubriken måste vara minst 3 tecken!" }),
  body: z.string({ message: "Ange artikel!" }).optional(),
});

export type ArticleSchemaType = z.infer<typeof ArticleSchema>;
