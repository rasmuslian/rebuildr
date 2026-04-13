import type { UploadFile } from "antd";
import { z } from "zod";

export const BannerSchema = z
  .object({
    label: z.string().min(1, "Label kan inte vara tomt"),
    title: z.string().min(1, "Titel kan inte vara tom"),
    presetBackground: z.enum(["REBUILDR", "WOOD", "METALLIC"]).optional(),
    backgroundImage: z.array(z.custom<UploadFile>()),
    destinationType: z.enum(["none", "url", "action"]),
    url: z.string().optional(),
    action: z.enum(["SELL"]).optional(),
    active: z.boolean(),
  })
  .refine(
    (data) =>
      data.destinationType !== "url" || (!!data.url && data.url.length > 0),
    { message: "Ange en giltig URL", path: ["url"] },
  )
  .refine(
    (data) => data.destinationType !== "action" || !!data.action,
    { message: "Välj en action", path: ["action"] },
  );

export type BannerSchemaType = z.infer<typeof BannerSchema>;
