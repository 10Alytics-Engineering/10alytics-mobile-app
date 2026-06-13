import z from 'zod';

import packageJSON from './package.json';

// Single unified environment schema
const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']),
  EXPO_PUBLIC_NAME: z.string(),
  EXPO_PUBLIC_SCHEME: z.string(),
  EXPO_PUBLIC_BUNDLE_ID: z.string(),
  EXPO_PUBLIC_PACKAGE: z.string(),
  EXPO_PUBLIC_VERSION: z.string(),

  // 10alytics API + media
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_YOUTUBE_EMBED_ORIGIN: z.string().url(),
  EXPO_PUBLIC_VIMEO_EMBED_ORIGIN: z.string().url(),

  // Realtime (Laravel Reverb / Pusher protocol)
  EXPO_PUBLIC_REVERB_APP_KEY: z.string(),
  EXPO_PUBLIC_REVERB_HOST: z.string(),
  EXPO_PUBLIC_REVERB_WS_PORT: z.number(),
  EXPO_PUBLIC_REVERB_WSS_PORT: z.number(),
  EXPO_PUBLIC_REVERB_CLUSTER: z.string(),
  EXPO_PUBLIC_REVERB_FORCE_TLS: z.boolean(),

  EXPO_PUBLIC_ASSOCIATED_DOMAIN: z.string().url().optional(),
});

// Config records per environment
const EXPO_PUBLIC_APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV
  ?? 'development') as z.infer<typeof envSchema>['EXPO_PUBLIC_APP_ENV'];

// 10alytics ships a single native identity across environments so the existing
// Firebase (google-services.json), EAS project and Apple Sign In provisioning
// keep matching. A badge differentiates non-production builds instead.
const BUNDLE_ID = 'com.tenalytics.mobile';
const PACKAGE = 'com.tenalytics.mobile';
const SCHEME = 'tenalyticsapp';
const NAME = '10Alytics';

// Check if strict validation is required (before prebuild)
const STRICT_ENV_VALIDATION = process.env.STRICT_ENV_VALIDATION === '1';

// Build env object
const _env: z.infer<typeof envSchema> = {
  EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_NAME: NAME,
  EXPO_PUBLIC_SCHEME: SCHEME,
  EXPO_PUBLIC_BUNDLE_ID: BUNDLE_ID,
  EXPO_PUBLIC_PACKAGE: PACKAGE,
  EXPO_PUBLIC_VERSION: packageJSON.version,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? '',
  EXPO_PUBLIC_YOUTUBE_EMBED_ORIGIN: process.env.EXPO_PUBLIC_YOUTUBE_EMBED_ORIGIN ?? '',
  EXPO_PUBLIC_VIMEO_EMBED_ORIGIN: process.env.EXPO_PUBLIC_VIMEO_EMBED_ORIGIN ?? '',
  EXPO_PUBLIC_REVERB_APP_KEY: process.env.EXPO_PUBLIC_REVERB_APP_KEY ?? '',
  EXPO_PUBLIC_REVERB_HOST: process.env.EXPO_PUBLIC_REVERB_HOST ?? '',
  EXPO_PUBLIC_REVERB_WS_PORT: Number(process.env.EXPO_PUBLIC_REVERB_WS_PORT ?? 8080),
  EXPO_PUBLIC_REVERB_WSS_PORT: Number(process.env.EXPO_PUBLIC_REVERB_WSS_PORT ?? 443),
  EXPO_PUBLIC_REVERB_CLUSTER: process.env.EXPO_PUBLIC_REVERB_CLUSTER ?? 'mt1',
  EXPO_PUBLIC_REVERB_FORCE_TLS: (process.env.EXPO_PUBLIC_REVERB_FORCE_TLS ?? 'true') === 'true',
  EXPO_PUBLIC_ASSOCIATED_DOMAIN: process.env.EXPO_PUBLIC_ASSOCIATED_DOMAIN,
};

function getValidatedEnv(env: z.infer<typeof envSchema>) {
  const parsed = envSchema.safeParse(env);

  if (parsed.success === false) {
    const errorMessage
      = `❌ Invalid environment variables:${
        JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
      }\n❌ Missing variables in .env file for APP_ENV=${EXPO_PUBLIC_APP_ENV}`
      + `\n💡 Tip: If you recently updated the .env file, try restarting with -c flag to clear the cache.`;

    if (STRICT_ENV_VALIDATION) {
      console.error(errorMessage);
      throw new Error('Invalid environment variables');
    }
  }
  else {
    console.log('✅ Environment variables validated successfully');
  }

  return parsed.success ? parsed.data : env;
}

const Env = STRICT_ENV_VALIDATION ? getValidatedEnv(_env) : _env;

export default Env;
