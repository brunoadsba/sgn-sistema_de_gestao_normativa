import { z } from 'zod';

// Schema de validação para variáveis de ambiente
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_PATH: z.string().default('./data/sgn.db'),
  TURSO_DATABASE_URL: z.string().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY é obrigatória'),
  GROQ_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),
  GROQ_RETRY_ATTEMPTS: z.coerce.number().int().min(1).max(8).default(3),
  GROQ_RETRY_BASE_MS: z.coerce.number().int().min(100).max(10000).default(700),
  GROQ_RETRY_MAX_MS: z.coerce.number().int().min(500).max(30000).default(5000),
  AI_PROVIDER: z.enum(['groq', 'ollama']).default('groq'),
  OLLAMA_BASE_URL: z.string().url().default('http://10.255.255.254:11434'),
  OLLAMA_MODEL: z.string().default('llama3.2'),
  KB_STRICT_MODE: z.enum(['true', 'false']).default('false'),
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  PORT: z.string().regex(/^\d+$/).default('3001'),
  NEXT_TELEMETRY_DISABLED: z.string().default('1'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_PATH: process.env.DATABASE_PATH,
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      GROQ_TIMEOUT_MS: process.env.GROQ_TIMEOUT_MS,
      GROQ_RETRY_ATTEMPTS: process.env.GROQ_RETRY_ATTEMPTS,
      GROQ_RETRY_BASE_MS: process.env.GROQ_RETRY_BASE_MS,
      GROQ_RETRY_MAX_MS: process.env.GROQ_RETRY_MAX_MS,
      AI_PROVIDER: process.env.AI_PROVIDER,
      OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
      OLLAMA_MODEL: process.env.OLLAMA_MODEL,
      KB_STRICT_MODE: process.env.KB_STRICT_MODE,
      SENTRY_DSN: process.env.SENTRY_DSN,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      PORT: process.env.PORT,
      NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED,
      LOG_LEVEL: process.env.LOG_LEVEL,
    });

    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
      throw new Error(`Variáveis de ambiente inválidas:\n${missingVars}`);
    }
    throw error;
  }
}

export const env = (() => {
  try {
    return validateEnv();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Erro na validação de variáveis de ambiente:', error);
      console.warn('Continuando em modo desenvolvimento...');
    }
    throw error;
  }
})();

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
