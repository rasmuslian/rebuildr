import type { UploadFile } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { z } from "zod";

export const NewsletterCompetitionSchema = z.object({
  title: z.string().min(1, "Titel kan inte vara tom"),
  productTitle: z.string().min(1, "Produkttitel kan inte vara tom"),
  productValue: z.string().min(1, "Produktvärde kan inte vara tomt"),
  bodyText: z.string().min(1, "Brödtext kan inte vara tom"),
  nextDrawDate: z.custom<Dayjs>(
    (val) => dayjs.isDayjs(val) && val.isValid(),
    { message: "Välj ett dragningsdatum" },
  ),
  productImage: z.array(z.custom<UploadFile>()),
});

export type NewsletterCompetitionSchemaType = z.infer<
  typeof NewsletterCompetitionSchema
>;
