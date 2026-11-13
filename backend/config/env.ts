import { z } from 'zod'

// Vercel/.env files often contain variables with an empty value. Treat those as
// "not set" so defaults apply instead of failing validation at startup.
const blank = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const text = z.preprocess(blank, z.string().trim().optional().default(''))
const textWithDefault = (fallback: string) =>
  z.preprocess(blank, z.string().trim().optional().default(fallback))
const positiveInt = z.preprocess(blank, z.coerce.number().int().positive().optional())

const envSchema = z.object({
  SUPABASE_URL: text,
  SUPABASE_SERVICE_ROLE_KEY: text,
  SUPABASE_ANON_KEY: text,
  VITE_SUPABASE_ANON_KEY: text,
  ADMIN_EMAILS: text,
  ADMIN_CONFIGURATION_SECRET: text,
  PROVIDER_NEXRAY_BASE_URL: textWithDefault('https://api.nexray.eu.cc'),
  PROVIDER_NEXRAY_SECRET: text,
  JAGOMOTION_API_KEY: text,
  UPSTASH_REDIS_REST_URL: text,
  UPSTASH_REDIS_REST_TOKEN: text,
  DOWNLOAD_MAX_BYTES: positiveInt,
  RATE_LIMIT_GLOBAL_MAX: positiveInt,
  RATE_LIMIT_WINDOW_SECONDS: positiveInt,
  CRON_SECRET: text,
  CATALOG_STRICT: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.enum(['true', 'false']).optional().default('false').catch('false'),
  ),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development').catch('development'),
})

export interface AppConfig {
  supabaseUrl: string
  supabaseServiceRoleKey: string
  supabaseAnonKey: string
  adminEmails: string[]
  adminConfigurationSecret: string
  providerNexrayBaseUrl: string
  providerNexraySecret: string
  jagomotionApiKey: string
  upstashRestUrl: string
  upstashRestToken: string
  downloadMaxBytes: number
  rateLimitGlobalMax: number
  rateLimitWindowSeconds: number
  cronSecret: string
  catalogStrict: boolean
  isTest: boolean
  apiVersion: 'v1'
}

function loadConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`)
  }
  const env = parsed.data
  return {
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseAnonKey: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY,
    adminEmails: env.ADMIN_EMAILS.split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
    adminConfigurationSecret: env.ADMIN_CONFIGURATION_SECRET,
    providerNexrayBaseUrl: env.PROVIDER_NEXRAY_BASE_URL.replace(/\/+$/, ''),
    providerNexraySecret: env.PROVIDER_NEXRAY_SECRET,
    jagomotionApiKey: env.JAGOMOTION_API_KEY,
    upstashRestUrl: env.UPSTASH_REDIS_REST_URL.replace(/\/+$/, ''),
    upstashRestToken: env.UPSTASH_REDIS_REST_TOKEN,
    downloadMaxBytes: env.DOWNLOAD_MAX_BYTES ?? 26_214_400,
    rateLimitGlobalMax: env.RATE_LIMIT_GLOBAL_MAX ?? 120,
    rateLimitWindowSeconds: env.RATE_LIMIT_WINDOW_SECONDS ?? 60,
    cronSecret: env.CRON_SECRET,
    catalogStrict: env.CATALOG_STRICT === 'true',
    isTest: env.NODE_ENV === 'test',
    apiVersion: 'v1',
  }
}

let cachedConfig: AppConfig | null = null

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfig()
  }
  return cachedConfig
}

export function resetConfigForTests(): void {
  cachedConfig = null
}

export function isSupabaseConfigured(config: AppConfig): boolean {
  return config.supabaseUrl.length > 0 && config.supabaseServiceRoleKey.length > 0
}
