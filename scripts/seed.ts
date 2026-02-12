/**
 * Script para popular o banco SQLite com dados iniciais
 * Uso: npx tsx scripts/seed.ts
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../src/lib/db/schema';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'sgn.db');

// Garantir diretório
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log('Populando banco SQLite em:', DB_PATH);

  // 1. Empresa
  const [empresa] = await db.insert(schema.empresas).values({
    nome: 'Construtora BR',
    cnpj: '98.765.432/0001-10',
    setor: 'Construção Civil',
    porte: 'grande',
    configuracoes: {
      segmento: 'Construção Civil',
      funcionarios: 150,
      cnae: '4110-7/00',
    },
    ativo: true,
  }).returning();

  console.log(`Empresa criada: ${empresa.nome} (${empresa.id})`);

  // 2. Documentos
  const docs = await db.insert(schema.documentosEmpresa).values([
    { empresaId: empresa.id, nomeArquivo: 'PGR_2025.pdf', tipoDocumento: 'manual', metadados: { tamanho: '3.2MB', paginas: 68 } },
    { empresaId: empresa.id, nomeArquivo: 'PCMSO_2025.pdf', tipoDocumento: 'procedimento', metadados: { tamanho: '2.1MB', paginas: 45 } },
    { empresaId: empresa.id, nomeArquivo: 'LTCAT_2025.pdf', tipoDocumento: 'politica', metadados: { tamanho: '4.5MB', paginas: 89 } },
  ]).returning();

  console.log(`${docs.length} documentos criados`);

  // 3. Jobs
  const jobs = await db.insert(schema.analiseJobs).values([
    { empresaId: empresa.id, documentoId: docs[0].id, normaIds: ['NR-18', 'NR-35', 'NR-12', 'NR-10'], status: 'completed', tipoAnalise: 'completa', priority: 5, progresso: 100, completedAt: new Date().toISOString() },
    { empresaId: empresa.id, documentoId: docs[1].id, normaIds: ['NR-7', 'NR-35', 'NR-15'], status: 'completed', tipoAnalise: 'completa', priority: 5, progresso: 100, completedAt: new Date().toISOString() },
  ]).returning();

  console.log(`${jobs.length} jobs criados`);

  // 4. Resultados
  const resultados = await db.insert(schema.analiseResultados).values([
    { empresaId: empresa.id, jobId: jobs[0].id, scoreGeral: 82, nivelRisco: 'baixo', statusGeral: 'conforme', metadata: { normas_analisadas: ['NR-18', 'NR-35', 'NR-12', 'NR-10'] } },
    { empresaId: empresa.id, jobId: jobs[1].id, scoreGeral: 91, nivelRisco: 'baixo', statusGeral: 'conforme', metadata: { normas_analisadas: ['NR-7', 'NR-35', 'NR-15'] } },
  ]).returning();

  console.log(`${resultados.length} resultados criados`);

  // 5. Gaps
  const gaps = await db.insert(schema.conformidadeGaps).values([
    { analiseResultadoId: resultados[0].id, normaId: 65, severidade: 'alta', resolvido: false, descricao: 'Instalações elétricas temporárias precisam de revisão técnica', prazoSugerido: '30_dias' },
    { analiseResultadoId: resultados[0].id, normaId: 61, severidade: 'baixa', resolvido: false, descricao: 'Atualizar certificação de EPIs que vencem em 60 dias', prazoSugerido: '90_dias' },
    { analiseResultadoId: resultados[1].id, normaId: 62, severidade: 'baixa', resolvido: true, descricao: 'Renovação de exames médicos em andamento', prazoSugerido: '30_dias' },
  ]).returning();

  console.log(`${gaps.length} gaps criados`);

  // 6. Alertas
  const alertas = await db.insert(schema.alertasConformidade).values([
    { empresaId: empresa.id, tipo: 'risco', severidade: 'alta', titulo: 'NR-35: Treinamento Vencido', descricao: 'Treinamento de trabalho em altura vencido.', acaoRequerida: 'Agendar reciclagem NR-35', prazo: new Date(Date.now() + 7 * 86400000).toISOString(), status: 'ativo' },
    { empresaId: empresa.id, tipo: 'prazo', severidade: 'critica', titulo: 'NR-17: Análise Ergonômica Pendente', descricao: 'Análise ergonômica deve ser realizada urgentemente.', acaoRequerida: 'Contratar especialista em ergonomia', prazo: new Date(Date.now() + 3 * 86400000).toISOString(), status: 'ativo' },
    { empresaId: empresa.id, tipo: 'conformidade', severidade: 'baixa', titulo: 'NR-10: Atualização de Documentação', descricao: 'Documentação de instalações elétricas desatualizada.', acaoRequerida: 'Atualizar documentação técnica', prazo: new Date(Date.now() + 14 * 86400000).toISOString(), status: 'ativo' },
  ]).returning();

  console.log(`${alertas.length} alertas criados`);

  console.log('\nSeed concluído com sucesso!');
  console.log(`Dashboard: http://localhost:3001/empresas/${empresa.id}/conformidade`);

  sqlite.close();
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
