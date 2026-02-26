# SGN - Runbook de Operacao Local

> Atualizado em: 2026-02-26

## 1. Objetivo

Padronizar execucao, validacao e recuperacao operacional do SGN no ambiente local.

## 2. Escopo

1. Execucao por Node.js.
2. Execucao por Docker.
3. Backup e restore de banco.
4. Troubleshooting de API, IA e banco.

## 3. Pre-requisitos

1. Node.js 20+.
2. Dependencias instaladas (`npm install`).
3. `.env.local` configurado a partir de `.env.example`.
4. Chave de provedor IA valida para o ambiente de teste.

## 4. Inicializacao (dev)

```bash
npm run dev
```

Aplicacao: `http://localhost:3001`.

## 5. Inicializacao (docker)

```bash
npm run docker:start
npm run docker:status
npm run docker:logs
```

Parada:

```bash
npm run docker:stop
```

## 6. Gate Tecnico Local

Comandos canonicos:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run test:ci
npm run test:e2e
```

Estado medido em `2026-02-26`:

1. `tsc`: passou.
2. `lint`: passou.
3. `build`: passou (`next build --webpack`) com fonte local/self-host.
4. `test:ci`: passou.
5. `test:e2e`: passou (`33/33`).

Regra operacional:

- GO de release local exige todos os itens acima em verde.
- Em mudanca de schema (`src/lib/db/schema.ts`), executar tambem `npm run db:push` antes do GO.

## 7. Backup e Restore

Backup:

```bash
npm run db:backup
```

Restore:

```bash
npm run db:restore -- ./backups/sgn-YYYYMMDD-HHMMSS.db.gz
```

Politica recomendada:

1. Backup diario.
2. Retencao minima de 7 dias.
3. Teste de restore semanal.

## 8. Verificacoes Rapidas de Saude

```bash
curl -s http://localhost:3001/api/health | jq .
```

Conferir:

1. `services.database`
2. `services.api`
3. `services.llm`

## 9. Troubleshooting

### Falha de extração de texto

1. Validar formato (`PDF`, `DOCX`, `TXT`).
2. Verificar integridade/criptografia do arquivo.
3. Testar arquivo menor para isolar timeout.

### Falha de provedor IA

1. Validar `AI_PROVIDER`.
2. Validar credenciais (`GROQ_API_KEY`, `ZAI_API_KEY`) e endpoint do Ollama.
3. Validar `GET /api/health`.

### Falha de banco

1. Confirmar permissao de escrita em `./data`.
2. Validar `DATABASE_PATH`.
3. Restaurar ultimo backup funcional.

## 10. Governanca

1. Mudanca operacional exige update em `CHANGELOG.md` e `docs/memory.md`.
2. Mudanca de fluxo/API exige update em `docs/architecture/arquitetura-tecnica.md`.
3. Revisao 5S documental obrigatoria mensal.
