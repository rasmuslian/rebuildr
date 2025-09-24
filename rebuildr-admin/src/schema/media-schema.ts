import { z } from "zod";
import { UploadFile } from "antd";

export const MediaSchema = z.object({
  images: z.array(z.custom<UploadFile>()).min(1, {
    message: "Minst en bild måste väljas.",
  }),
});

export type MediaSchemaType = z.infer<typeof MediaSchema>;
