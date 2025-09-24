import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string({ message: "Ange en giltig e-postadress!" })
    .email("Ange en giltig e-postadress!"),
  password: z
    .string({ message: "Ange ett lösenord." })
    .min(1, "Ange ett lösenord."),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
