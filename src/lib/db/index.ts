import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '@/lib/env';

// Singleton para evitar múltiplas conexões
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _client: ReturnType<typeof createClient> | null = null;

function createDb() {
  if (_db) return _db;

  // Se for arquivo local e não tiver o protocolo file:, adiciona
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

export const db = createDb();

// Re-exportar schema para conveniência
export { schema };

// Helper para verificar se o banco está acessível
export async function isDatabaseReady(): Promise<boolean> {
  try {
    if (!_client) return false;
    await _client.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('[DB] Erro ao verificar disponibilidade:', error);
    return false;
  }
}
