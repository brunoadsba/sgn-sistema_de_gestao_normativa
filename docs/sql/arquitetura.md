# SGN - Arquitetura Técnica Atual

## Resumo arquitetural

O SGN opera em arquitetura monolítica com Next.js App Router, banco local SQLite e Drizzle ORM. As NRs são mantidas localmente em TypeScript e a análise de conformidade é executada via GROQ.

## Stack

- Next.js 15.5.2 (App Router)
- TypeScript 5.9.2 (strict)
- SQLite (`better-sqlite3`) + Drizzle ORM
- GROQ SDK (Llama 3.1 8B)
- Redis (`ioredis`) para cache/rate limit (uso parcial)
- Zod para validação de entrada
- Pino para logging estruturado

## Estrutura de dados

### Fontes de dados

1. NRs locais em `src/lib/data/normas.ts`
2. Banco relacional SQLite em `./data/sgn.db`

### Tabelas principais (Drizzle)

- `empresas`
- `documentos_empresa`
- `analise_jobs`
- `analise_resultados`
- `conformidade_gaps`
- `alertas_conformidade`

## Fluxo de análise IA

1. Usuário envia documento e seleciona NRs no frontend
2. `POST /api/extrair-texto` extrai conteúdo quando necessário
3. `POST /api/ia/analisar-conformidade` executa análise no GROQ
4. Quando `empresaId` existe, resultado é persistido no SQLite:
   - cria registro em `documentos_empresa`
   - cria `analise_jobs` com status `completed`
   - cria `analise_resultados`
   - cria itens em `conformidade_gaps`
5. `GET /api/ia/analisar-conformidade` lista histórico com paginação e filtro opcional por `empresaId`

## APIs relevantes

### Núcleo

- `GET /api/health`
- `GET /api/normas`
- `GET /api/empresas`
- `POST /api/empresas`
- `GET/POST/PUT/DELETE /api/alertas`

### Conformidade

- `POST /api/ia/analisar-conformidade`
- `GET /api/ia/analisar-conformidade`
- `POST /api/conformidade/analisar`
- `GET /api/conformidade/jobs/[id]`
- `GET /api/conformidade/dashboard/[empresaId]`

## Persistência e armazenamento

- Banco: `./data/sgn.db`
- Uploads: `./data/uploads/`
- Migrations: `drizzle/`
- Configuração Drizzle: `drizzle.config.ts`

## Estado atual de produção técnica

Implementado:

- Migração completa de Supabase para SQLite
- Persistência do resultado de análise IA
- Listagem histórica de análises com paginação/filtro
- Validação de payload com Zod
- Build e TypeScript strict sem erros

Pendente:

- Aplicação efetiva de rate limiting nas rotas públicas
- Autenticação nas APIs
- Worker assíncrono real para jobs de conformidade
- Testes automatizados de APIs críticas
