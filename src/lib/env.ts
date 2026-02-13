import { z } from 'zod';

// Schema de validação para variáveis de ambiente
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_PATH: z.string().default('./data/sgn.db'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY é obrigatória'),
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
      GROQ_API_KEY: process.env.GROQ_API_KEY,
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
