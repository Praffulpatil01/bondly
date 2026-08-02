import { z } from 'zod';

/**
 * Environment variable schema with Zod validation.
 * Ensures all required env vars are present and correctly typed at startup.
 */
const envSchema = z.object({
  // Firebase Configuration
  VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase messaging sender ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // App Configuration
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_APP_URL: z.string().url().optional(),
  VITE_USE_FIREBASE_EMULATORS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables.
 * Throws at startup if any required variable is missing or invalid.
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. Check the console for details.');
  }

  return parsed.data;
}

export const env = validateEnv();
