import { z } from "zod";

export const BrandSchema = z.object({
  name: z
    .string({ message: "Namnet måste anges" })
    .min(2, { message: "Namnet måste vara minst 2 tecken lång" }),
});

export type BrandSchemaType = z.infer<typeof BrandSchema>;
