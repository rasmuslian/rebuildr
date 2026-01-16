import { z } from "zod";
import { UploadFile } from "antd";
import { MeasurementTypeEnum } from "gql/graphql";

export const CategorySchema = z.object({
  inSeason: z.boolean(),
  inSelection: z.boolean(),
  name: z.string().min(1, "Kategorinamnet kan inte vara tomt."),
  description: z
    .string({ message: "Ange beskrivning!" })
    .min(2, { message: "Beskrivningen måste vara minst 2 tecken!" }),
  image: z.array(z.custom<UploadFile>()),
  measurements: z.array(z.nativeEnum(MeasurementTypeEnum)),
});

export type CategorySchemaType = z.infer<typeof CategorySchema>;
