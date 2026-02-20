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
4. Install command: `npm install`
5. Output: padrão do Next.js

## Variáveis de Ambiente

Configurar em `Project Settings > Environment Variables`:

```bash
GROQ_API_KEY=...
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
DATABASE_PATH=./data/sgn.db
```

Observações:
- `GROQ_API_KEY` é obrigatória.
- `DATABASE_PATH` em Vercel não garante persistência entre execuções.

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
3. Validar integração GROQ (resposta e latência aceitável).
4. Verificar logs de erro e taxa de falha.

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

## Governança

- Dono técnico: manter este guia sincronizado com `docs/sql/arquitetura.md`.
- Toda mudança de infraestrutura deve gerar entrada em `CHANGELOG.md`.
