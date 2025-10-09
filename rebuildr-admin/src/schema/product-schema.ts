import { z } from "zod";
import { UploadFile } from "antd";
import { ProductConditionEnum } from "gql/graphql";

export const ProductSchema = z.object({
  title: z
    .string({ message: "Ange rubrik!" })
    .min(2, { message: "Rubriken måste vara minst 2 tecken!" }),

  description: z
    .string({ message: "Ange beskrivning!" })
    .min(3, { message: "Beskrivningen måste vara minst 3 tecken!" }),

  price: z.coerce
    .number({ message: "Priset måste anges." })
    .positive({ message: "Priset måste vara större än 0." }),

  images: z.array(z.custom<UploadFile>()).min(1, {
    message: "Minst en bild måste väljas.",
  }),

  categoryId: z.string({ message: "Kategori måste anges." }),
  brandId: z.string({ message: "Märke måste anges." }),
  condition: z.nativeEnum(ProductConditionEnum),
});

export type ProductSchemaType = z.infer<typeof ProductSchema>;
