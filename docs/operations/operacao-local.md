# SGN - Runbook de Operacao Local

> Atualizado em: 2026-02-24

## 1. Objetivo

Padronizar execucao, validacao e recuperacao operacional do SGN em ambiente local single-user.

## 2. Escopo

1. Execucao via Node.js local.
2. Execucao via Docker local.
3. Backup, restore e troubleshooting operacional.

## 3. Pre-requisitos

1. Node.js 18+.
2. `npm install` concluido.
3. `.env.local` configurado a partir de `.env.example`.
4. Chaves de IA validas para o provider em uso.

## 4. Inicializacao (modo dev)

```bash
npm run dev
```

Aplicacao disponivel em `http://localhost:3001`.

## 5. Inicializacao (modo container local)

```bash
npm run docker:start
```

Comandos uteis:

```bash
npm run docker:status
npm run docker:logs
npm run docker:stop
```

## 6. Gate de validacao local

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run test:e2e
```

## 7. Backup e restore

```bash
npm run db:backup
npm run db:restore -- ./backups/sgn-YYYYMMDD-HHMMSS.db.gz
```

Politica recomendada:

1. Backup diario.
2. Retencao minima de 7 dias.
3. Teste de restore semanal.

## 8. Troubleshooting rapido

### Falha de extracao

1. Validar formato (`PDF`, `DOCX`, `TXT`) e integridade do arquivo.
2. Confirmar limite de upload e tamanho de texto extraido.

### Falha de LLM

1. Validar `AI_PROVIDER`.
2. Conferir credenciais (`GROQ_API_KEY` ou `ZAI_API_KEY`) e/ou endpoint local (`OLLAMA_BASE_URL`).
3. Verificar `GET /api/health`.

### Falha de banco

1. Confirmar permissao de escrita em `./data`.
2. Validar caminho `DATABASE_PATH`.
3. Restaurar ultimo backup se necessario.

## 9. Governanca

1. Este runbook deve ficar sincronizado com `docs/architecture/arquitetura-tecnica.md`.
2. Mudancas operacionais relevantes devem atualizar `CHANGELOG.md` e `docs/memory.md`.
