import { z } from "zod";

export const PageContentSchema = z.object({
  heorHtml: z.string({ message: "Ange text för startsektion!" }),
});

export type PageContentSchemaType = z.infer<typeof PageContentSchema>;
