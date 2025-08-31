# Arquitetura

## Visão Geral
- Frontend: Next.js 15 (app dir), shadcn/ui, Tailwind.
- Backend: Supabase (PostgreSQL + Auth + Storage), API Routes.
- Automação: N8N (coleta).

## Banco de Dados
- Tabelas: `normas`, `versoes`, `mudancas`, `empresas`, `documentos_empresa`, `analises_conformidade`.
- RLS por tenant (detalhes e policies).

## APIs
- Existentes: `/api/normas`, `/api/search`, `/api/export`.
- Corporativo: `/api/empresas`, `/api/empresas/[id]/documentos`, conformidade (planejada).

## Ambientes e Variáveis
- `.env.local`: chaves Supabase, storage e configurações. (não commitar)
