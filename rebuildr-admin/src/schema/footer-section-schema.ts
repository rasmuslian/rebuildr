import { z } from "zod";
import { Article } from "gql/graphql";

export const FooterSectionSchema = z.object({
  title: z
    .string({ required_error: "Rubrik är obligatorisk." })
    .min(3, { message: "Rubriken måste innehålla minst 3 tecken." }),

  orderIndex: z
    .number({ invalid_type_error: "Sorteringsordning måste vara ett tal." })
    .int({ message: "Sorteringsordningen måste vara ett heltal." })
    .min(1, { message: "Sorteringsordningen måste vara minst 1." })
    .default(1),

  articles: z.array(z.custom<Article>()).min(1, {
    message: "Minst en article måste väljas.",
  }),
});

export type FooterSectionSchemaType = z.infer<typeof FooterSectionSchema>;
