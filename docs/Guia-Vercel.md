# SGN - Guia de Deploy na Vercel

> Documento operacional para publicação e manutenção do SGN em ambiente Vercel.

## Objetivo

Padronizar o deploy do SGN com configuração mínima segura, previsível e rastreável.

## Escopo

- Build e deploy do frontend/backend Next.js (App Router)
- Configuração de variáveis de ambiente
- Persistência de dados e limitações no modelo serverless
- Checklist de validação pós-deploy

## Pré-requisitos

1. Repositório GitHub conectado à Vercel.
2. Chave de API GROQ válida.
3. Estratégia de persistência definida.

## Ponto de Atenção Crítico (SQLite)

O SGN usa SQLite local (`./data/sgn.db`). Em ambiente serverless da Vercel, o filesystem é efêmero.

Para uso real em produção, escolha uma destas opções:

1. Migrar para banco gerenciado (Neon/Supabase/Postgres) mantendo Drizzle.
2. Manter Vercel apenas para preview/homologação, com persistência não crítica.
3. Executar SGN em Docker/self-hosted quando SQLite persistente for obrigatório.

## Configuração do Projeto na Vercel

1. Framework preset: `Next.js`
2. Root directory: raiz do repositório
3. Build command: `npm run build`
4. Install command: `npm ci`
5. Output: padrão do Next.js

## Variáveis de Ambiente

Configurar em `Project Settings > Environment Variables`:

```bash
GROQ_API_KEY=...
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
DATABASE_PATH=./data/sgn.db
GROQ_TIMEOUT_MS=45000
GROQ_RETRY_ATTEMPTS=3
GROQ_RETRY_BASE_MS=800
GROQ_RETRY_MAX_MS=8000
KB_STRICT_MODE=true
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

Observações:
- `GROQ_API_KEY` é obrigatória.
- `DATABASE_PATH` em Vercel não garante persistência entre execuções.
- Configurar `GROQ_API_KEY` nos três ambientes (`Production`, `Preview` e `Development`) para evitar falha de build em coleta de dados de rotas.

## Fluxo Recomendado de Deploy

1. `master` para produção.
2. Branches `feat/*`, `fix/*`, `docs/*` para preview deployments.
3. Merge apenas após validação de build, lint e fluxo crítico.

## Checklist Pré-Deploy

1. Executar:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   npm run test:e2e
   ```
2. Confirmar variáveis de ambiente em todos os ambientes (`Preview` e `Production`).
3. Atualizar documentação afetada (`README`, `CHANGELOG`, `docs/memory`).

## Checklist Pós-Deploy

1. Verificar disponibilidade de rotas:
   - `/`
   - `/normas`
   - `/normas/[id]`
   - `/nr6`
2. Testar APIs críticas:
   - `GET /api/health`
   - `POST /api/extrair-texto`
   - `POST /api/ia/analisar-conformidade`
3. Validar integração GROQ (resposta e latência aceitável) e confirmar `llm: ok` no health check.
4. Verificar logs de erro e taxa de falha.
5. Validar experiência mobile PWA:
   - ícone SGN aplicado na tela inicial
   - splash nativa sem fundo branco (tema escuro do manifest)
   - em caso de cache antigo, remover atalho e adicionar novamente

## Gate de Qualidade Recomendado

Antes de promover para produção:

1. `npm run lint`
2. `npm run build`
3. `npm run test:e2e`

Resultado esperado: execução sem erros e suíte E2E totalmente verde.

## Runbook de Backup e Restore (SQLite)

1. Criar backup:
   ```bash
   npm run db:backup
   ```
2. Restaurar backup:
   ```bash
   npm run db:restore -- ./backups/sgn-YYYYMMDD-HHMMSS.db.gz
   ```
3. Política recomendada:
   - Backup diário
   - Retenção mínima de 7 dias
   - Teste de restore ao menos 1x por semana

## Troubleshooting

### Build falha por dependência nativa

1. Validar versão do Node na Vercel.
2. Conferir compatibilidade de dependências com runtime serverless.

### Erros intermitentes de persistência

Causa provável: SQLite em filesystem efêmero.

Ação:
1. Migrar para banco gerenciado.
2. Ou mover deploy para Docker/self-hosted.

### Erro de autenticação GROQ

1. Revisar `GROQ_API_KEY`.
2. Confirmar ambiente correto (`Preview` vs `Production`).

### Home presa em "Carregando SGN..."

Causa provável:
1. Política CSP bloqueando scripts inline de hidratação do Next.js.

Ações:
1. Validar header `content-security-policy` em produção.
2. Garantir `script-src` compatível com hidratação do App Router.
3. Publicar novo deploy e confirmar via hard reload (`Ctrl+F5`).

### Ícone ou splash nativa não atualiza no smartphone

Causa provável:
1. Manifest/ícone em cache no navegador ou launcher do dispositivo.

Ações:
1. Remover atalho da tela inicial.
2. Limpar cache/dados do navegador.
3. Abrir novamente a URL de produção.
4. Adicionar o app à tela inicial outra vez.

### Comando correto de redeploy em produção

```bash
vercel redeploy <deployment-url> --target production
```

## Governança

- Dono técnico: manter este guia sincronizado com `docs/sql/arquitetura.md`.
- Toda mudança de infraestrutura deve gerar entrada em `CHANGELOG.md`.
