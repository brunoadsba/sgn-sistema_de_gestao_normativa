# SGN - Sistema de Gestão Normativa

Plataforma privada de análise de conformidade SST com IA, focada nas NRs brasileiras.

## Visão geral

- Framework: Next.js 15 (App Router) + TypeScript strict
- Banco: SQLite local com Drizzle ORM
- IA: GROQ (Llama 3.1 8B)
- UI: React + Tailwind + shadcn/ui
- Cache: Redis (ioredis), uso parcial
- Deploy: Docker self-hosted

## Status atual

- Migração Supabase -> SQLite concluída
- Fluxo principal de análise IA operacional
- Persistência da análise IA no banco implementada
- Endpoint de listagem de análises implementado com paginação e filtro por empresa
- Testes manuais de endpoints principais executados com sucesso em ambiente local

## Estrutura principal

```text
src/
├── app/
│   ├── api/
│   │   ├── ia/analisar-conformidade/
│   │   ├── empresas/
│   │   ├── alertas/
│   │   ├── conformidade/
│   │   ├── normas/
│   │   └── ...
│   ├── empresas/
│   ├── normas/
│   └── page.tsx
├── lib/
│   ├── db/              # Cliente SQLite + schema Drizzle
│   ├── ia/              # Integração IA + persistência da análise
│   ├── data/            # NRs locais
│   ├── cache/
│   ├── logger/
│   └── env.ts
├── schemas/             # Zod schemas
└── types/               # Tipos TypeScript
```

## Como rodar localmente

1. Instale dependências:
   ```bash
   npm install
   ```
2. Configure variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
3. Defina pelo menos:
   ```bash
   GROQ_API_KEY=...
   ```
4. Popule o banco (opcional, recomendado):
   ```bash
   npm run db:seed
   ```
5. Inicie o app:
   ```bash
   npm run dev
   ```
6. Acesse:
   - `http://localhost:3001`

## Variáveis de ambiente

Obrigatória:

```bash
GROQ_API_KEY=
```

Opcionais:

```bash
DATABASE_PATH=./data/sgn.db
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Comandos essenciais

```bash
# App
npm run dev
npm run build
npm run start

# Qualidade
npm test
npm run lint

# Banco (Drizzle)
npm run db:generate
npm run db:push
npm run db:studio
npm run db:seed

# Docker
npm run docker:start
npm run docker:stop
npm run docker:logs
```

## Endpoints úteis para validação rápida

```bash
# Health
curl -s "http://localhost:3001/api/health" | jq .

# Empresas
curl -s "http://localhost:3001/api/empresas?limit=5" | jq .

# Análise IA (sem empresaId)
curl -s -X POST "http://localhost:3001/api/ia/analisar-conformidade" \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "Documento SST de teste",
    "tipoDocumento": "PGR",
    "normasAplicaveis": ["NR-6"]
  }' | jq .

# Listagem de análises
curl -s "http://localhost:3001/api/ia/analisar-conformidade?pagina=1&limite=10" | jq .
```

## Documentação complementar

- `docs/memory.md`: estado consolidado do projeto e próximos passos
- `docs/sql/arquitetura.md`: arquitetura técnica atual
- `SECURITY.md`: controles de segurança implementados e pendências
- `CONTRIBUTING.md`: fluxo de contribuição e padrão de commit
- `CHANGELOG.md`: histórico de mudanças
