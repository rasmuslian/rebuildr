import * as z from 'zod';

const envSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  GOOGLE_GEOCODING_API_KEY: z.string().min(1),
  GOOGLE_PLACES_AUTOCOMPLETE_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  SPACES_KEY: z.string().min(1),
  SPACES_SECRET: z.string().min(1),
  MAILGUN_API_KEY: z.string().min(1),
  MAILGUN_DOMAIN: z.string().min(1).default('rebuildr.se'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  CA_CERT: z.string().optional(),
  BANKID_ENV: z.enum(['production', 'test']).optional(),
  BANKID_PFX_B64: z.string().optional(),
  BANKID_PASSPHRASE: z.string().optional(),
  SSN_HMAC_SECRET: z.string().optional(),
  ADMIN_ENV: z.string().optional(),
});
export type EnvironmentVariables = z.infer<typeof envSchema>;

export const validateConfig = (config: Record<string, unknown>) => {
  return envSchema.parse(config);
};
