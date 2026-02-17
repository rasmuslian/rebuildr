import { z } from "zod";
import { UploadFile } from "antd";

export const DocumentLibrarySchema = z.object({
  documents: z.array(z.custom<UploadFile>()).min(1, {
    message: "Minst en dokument måste väljas.",
  }),
});

export type DocumentLibrarySchemaType = z.infer<typeof DocumentLibrarySchema>;
