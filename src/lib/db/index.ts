import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '@/lib/env';

type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

// Singleton para evitar múltiplas conexões
let _db: DrizzleDB | null = null;
let _client: ReturnType<typeof createClient> | null = null;

function getDb(): DrizzleDB {
  if (_db) return _db;

  let url = env.TURSO_DATABASE_URL || env.DATABASE_PATH;
  if (!url.startsWith('libsql://') && !url.startsWith('https://') && !url.startsWith('file:')) {
    url = `file:${url}`;
  }

  _client = createClient({
    url,
    ...(env.TURSO_AUTH_TOKEN ? { authToken: env.TURSO_AUTH_TOKEN } : {}),
  });

  _db = drizzle(_client, { schema });
  return _db;
}

// Proxy que inicializa o DB apenas no primeiro acesso real
export const db: DrizzleDB = new Proxy({} as DrizzleDB, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

// Re-exportar schema para conveniência
export { schema };

// Helper para verificar se o banco está acessível
export async function isDatabaseReady(): Promise<boolean> {
  try {
    const client = _client ?? (() => { getDb(); return _client; })();
    if (!client) return false;
    await client.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('[DB] Erro ao verificar disponibilidade:', error);
    return false;
  }
}

