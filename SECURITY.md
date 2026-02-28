# SGN - Security

> Atualizado em: 2026-02-28

## 1. Escopo

Postura de seguranca do SGN no estado atual do repositorio, com foco em operacao local.

## 2. Modelo de Ameaca Atual

1. Aplicacao local, single-user, sem autenticacao.
2. Superficies de entrada: upload de arquivo, payloads de API, variaveis de ambiente.
3. Dependencia externa de IA quando `AI_PROVIDER=groq` ou `AI_PROVIDER=zai`.

## 3. Controles Implementados

1. Validacao de entrada via Zod em rotas criticas.
2. Headers de seguranca definidos em `next.config.js`.
3. Logging estruturado com Pino.
4. Captura de erros com Sentry.
5. Persistencia local com SQLite/LibSQL.
6. Health check em `GET /api/health`.
7. Rate limiting in-memory ativo em rotas de alto custo (`/api/ia/analisar-conformidade`, `/api/extrair-texto`, `/api/chat-documento`, `/api/ia/jobs/[id]`).

## 4. Riscos Conhecidos

1. Ausencia de autenticacao/autorizacao.
2. Rate limiting atual e in-memory (single-node), sem backend distribuido para cenarios multi-instancia.
3. CORS e redirects ainda carregam configuracoes legadas de cenarios remotos.
4. Idempotencia persistida em banco (`idempotency_cache`), com fallback em memoria apenas quando o schema local ainda nao estiver sincronizado.
5. Drift entre intencao arquitetural e implementacao em partes do fluxo assíncrono.

## 5. Requisitos para Exposicao Publica

1. Implementar autenticacao e autorizacao.
2. Migrar rate limiting para backend distribuido/persistente em caso de exposicao multi-instancia.
3. Revisar CSP para remover dependencia de `unsafe-inline` quando viavel.
4. Definir retencao, criptografia e ciclo de vida de uploads.
5. Implementar trilha de auditoria de acoes criticas.
6. Garantir sincronizacao de schema (`npm run db:push`) apos mudancas estruturais de persistencia.

## 6. Gestao de Secrets

1. Segredos apenas em `.env.local` ou secret manager.
2. Proibido versionar chaves.
3. Rotacionar credenciais em caso de vazamento.

Variaveis principais:

```bash
AI_PROVIDER=groq|zai|ollama
GROQ_API_KEY=
ZAI_API_KEY=
OLLAMA_BASE_URL=
DATABASE_PATH=./data/sgn.db
PORT=3001
LOG_LEVEL=error|warn|info|debug
```

## 7. Checklist Operacional de Seguranca

1. Verificar vazamento de segredo:
   ```bash
   git grep -i "api_key\|password\|secret\|token"
   ```
2. Verificar tipagem:
   ```bash
   npx tsc --noEmit
   ```
3. Verificar lint:
   ```bash
   npm run lint
   ```
4. Verificar build:
   ```bash
   npm run build
   ```
5. Verificar E2E:
   ```bash
   npm run test:e2e
   ```

## 8. Divulgacao de Vulnerabilidade

1. Nao abrir vulnerabilidade critica em issue publica.
2. Registrar impacto, vetor, severidade e evidencias.
3. Corrigir em branch dedicada e registrar patch no changelog.
