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
5. Definir engine de PDF conforme validação desejada:
   - `NEXT_PUBLIC_PDF_ENGINE=dom` (default)
   - `NEXT_PUBLIC_PDF_ENGINE=react-pdf` (server-side programático)

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
4. `test:ci`: passou (`54/54`).
5. `test:e2e`: passou (`33/33`).

Regra operacional:

- GO de release local exige todos os itens acima em verde.
- Em mudanca de schema (`src/lib/db/schema.ts`), executar tambem `npm run db:push` antes do GO.
- Fluxo legal: relatório sai como `pre_laudo_pendente` e exige revisão humana (`aprovar/rejeitar`) antes de ser tratado como laudo final.
- Para fluxo PDF programático, validar também `POST /api/reports/generate` (payload `ReportData` válido).

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

Smoke recomendado do agente especialista:

```bash
curl -sS -X POST http://localhost:3001/api/ia/agente/especialista \
  -H "Content-Type: application/json" \
  -d '{"texto":"Operacao portuaria no cais com movimentacao de cargas","tipoDocumento":"OUTRO"}' | jq .
```

## 9. Troubleshooting

### Falha de extração de texto

1. Validar formato (`PDF`, `DOCX`, `TXT`).
2. Verificar integridade/criptografia do arquivo.
3. Testar arquivo menor para isolar timeout.

### Falha de provedor IA

1. Validar `AI_PROVIDER`.
2. Validar credenciais (`GROQ_API_KEY`, `ZAI_API_KEY` ou `OPENAI_API_KEY`) e endpoint do Ollama.
3. Validar tuning de timeout/retry:
   - `GROQ_TIMEOUT_MS`, `GROQ_RETRY_ATTEMPTS`, `GROQ_RETRY_BASE_MS`, `GROQ_RETRY_MAX_MS`
   - `ZAI_TIMEOUT_MS`, `ZAI_RETRY_ATTEMPTS`, `ZAI_RETRY_BASE_MS`, `ZAI_RETRY_MAX_MS`, `ZAI_DISABLE_THINKING`
4. Validar `GET /api/health`.
5. Ler classe de erro no log estruturado (`error_class`):
   - `rate_limit`, `timeout`, `network`, `provider_5xx` => transiente (retry/fallback)
   - `auth`, `provider_4xx`, `schema_validation` => demanda ajuste de credencial/payload

### 400 em smoke tests/UI

1. `POST /api/ia/analisar-conformidade 400` e `GET /api/search?q= 400` podem ser esperados em testes de validacao de input.
2. Tratar como incidente apenas quando houver regressao funcional na jornada principal com payload valido.

### Exportacao PDF

1. Em `NEXT_PUBLIC_PDF_ENGINE=react-pdf`, o botão de relatório chama `/api/reports/generate`.
2. Se a API falhar, a UI executa fallback para impressão local (`window.print`).
3. Validar checklist manual em `docs/operations/checklist-validacao-impressao-relatorio-pdf.md`.

### Revisao humana do laudo

1. Confirmar que novo resultado nasce como `pre_laudo_pendente`.
2. Aprovar/Rejeitar via endpoint:
   - `POST /api/ia/analisar-conformidade/{id}/revisao/aprovar`
   - `POST /api/ia/analisar-conformidade/{id}/revisao/rejeitar`
3. Consultar trilha:
   - `GET /api/ia/analisar-conformidade/{id}/revisao`
4. Se houver erro de tabela ausente, executar `npm run db:push` e reiniciar o serviço.

### Falha de banco

1. Confirmar permissao de escrita em `./data`.
2. Validar `DATABASE_PATH`.
3. Restaurar ultimo backup funcional.

## 10. Governanca

1. Mudanca operacional exige update em `CHANGELOG.md` e `docs/memory.md`.
2. Mudanca de fluxo/API exige update em `docs/architecture/arquitetura-tecnica.md`.
3. Revisao 5S documental obrigatoria mensal.
