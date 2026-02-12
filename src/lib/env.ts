import { z } from 'zod';

// Schema de validação para variáveis de ambiente
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database (SQLite)
  DATABASE_PATH: z.string().default('./data/sgn.db'),
  
  // GROQ AI
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY é obrigatória'),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().regex(/^\d+$/).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().regex(/^\d+$/).default('0'),
  
  // Application
  PORT: z.string().regex(/^\d+$/).default('3001'),
  NEXT_TELEMETRY_DISABLED: z.string().default('1'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Tipo inferido do schema
export type Env = z.infer<typeof envSchema>;

// Validação e exportação das variáveis de ambiente
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
      REDIS_HOST: process.env.REDIS_HOST,
      REDIS_PORT: process.env.REDIS_PORT,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_DB: process.env.REDIS_DB,
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

// Exportar variáveis validadas (apenas leitura)
export const env = (() => {
  try {
    return validateEnv();
  } catch (error) {
    // Em desenvolvimento, mostrar erro mas não bloquear
    if (process.env.NODE_ENV === 'development') {
      console.warn('Erro na validação de variáveis de ambiente:', error);
      console.warn('Continuando em modo desenvolvimento...');
    }
    // Em produção, lançar erro
    throw error;
  }
})();

// Helper para verificar se está em produção
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
