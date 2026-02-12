import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Path do banco: ./data/sgn.db (volume Docker)
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'sgn.db');

// Garantir que o diretório existe
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Singleton para evitar múltiplas conexões
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createDb() {
  if (_db) return _db;

  const sqlite = new Database(DB_PATH);

  // WAL mode para melhor performance de leitura
  sqlite.pragma('journal_mode = WAL');
  // Sync normal para melhor performance (dados não são mission-critical em dev)
  sqlite.pragma('synchronous = normal');
  // Foreign keys habilitadas
  sqlite.pragma('foreign_keys = ON');

  _db = drizzle(sqlite, { schema });
  return _db;
}

export const db = createDb();

// Re-exportar schema para conveniência
export { schema };

// Helper para verificar se o banco está acessível
export function isDatabaseReady(): boolean {
  try {
    const sqlite = new Database(DB_PATH, { readonly: true });
    sqlite.pragma('integrity_check');
    sqlite.close();
    return true;
  } catch {
    return false;
  }
}
