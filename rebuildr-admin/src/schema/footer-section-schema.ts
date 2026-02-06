import { z } from "zod";
import { Article, FooterSectionEntryType } from "gql/graphql";

const EntrySchema = z
  .object({
    tempId: z.string().optional(),
    type: z.nativeEnum(FooterSectionEntryType),
    orderIndex: z
      .number({ invalid_type_error: "Sorteringsordning måste vara ett tal." })
      .int({ message: "Sorteringsordningen måste vara ett heltal." })
      .min(0, { message: "Sorteringsordningen måste vara minst 0." }),
    article: z.custom<Article>().optional(),
    label: z.string().optional(),
    url: z.string().url({ message: "URL måste vara giltig." }).optional(),
  })
  .superRefine((entry, ctx) => {
    if (entry.type === FooterSectionEntryType.Article && !entry.article) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Artikel måste anges.",
        path: ["article"],
      });
    }

    if (entry.type === FooterSectionEntryType.Link) {
      if (!entry.label?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Titel måste anges.",
          path: ["label"],
        });
      }

      if (!entry.url?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "URL måste anges.",
          path: ["url"],
        });
      }
    }
  });

export const FooterSectionSchema = z.object({
  title: z
    .string({ required_error: "Rubrik är obligatorisk." })
    .min(3, { message: "Rubriken måste innehålla minst 3 tecken." }),

  orderIndex: z
    .number({ invalid_type_error: "Sorteringsordning måste vara ett tal." })
    .int({ message: "Sorteringsordningen måste vara ett heltal." })
    .min(1, { message: "Sorteringsordningen måste vara minst 1." })
    .default(1),

  entries: z.array(EntrySchema).min(1, {
    message: "Minst en post måste väljas.",
  }),
});

export type FooterSectionSchemaType = z.infer<typeof FooterSectionSchema>;
