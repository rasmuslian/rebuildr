import { z } from "zod";

export const UserSchema = z.object({
  isAdmin: z.boolean(),
  address: z.string().optional(),
});

export type UserSchemaType = z.infer<typeof UserSchema>;
