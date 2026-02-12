# Changelog

Todas as mudanças relevantes do SGN são documentadas neste arquivo.

## [2026-02-12] - Pós-migração SQLite (Sessões 8 e 9)

### Adicionado

- Persistência de análises IA no SQLite em `POST /api/ia/analisar-conformidade`
- Módulo de persistência em `src/lib/ia/persistencia-analise.ts`
- Mapeadores de análise em `src/lib/ia/analise-mappers.ts`
- Listagem real de análises em `GET /api/ia/analisar-conformidade` com:
  - paginação (`pagina`, `limite`)
  - filtro opcional por `empresaId`

### Alterado

- `src/app/api/ia/analisar-conformidade/route.ts` atualizado para:
  - persistir resultados após análise bem-sucedida
  - utilizar respostas padronizadas de sucesso/erro
  - remover lógica placeholder antiga

### Validado

- Testes manuais em ambiente local:
  - `POST /api/ia/analisar-conformidade` (com e sem `empresaId`)
  - `GET /api/ia/analisar-conformidade?pagina=1&limite=10`
  - `GET /api/ia/analisar-conformidade?empresaId=<id>`
- Retornos HTTP `200` para os cenários acima

## [2026-02-12] - Migração Supabase -> SQLite (Sessão 7)

### Alterado

- Migração de dados e APIs para SQLite + Drizzle
- Remoção de dependências e referências a Supabase
- Introdução de dados normativos locais (`src/lib/data/normas.ts`)

### Infra

- Scripts Drizzle adicionados: `db:generate`, `db:push`, `db:studio`, `db:seed`
- Volume de dados local configurado para Docker

## [2025-08-31] - Base do MVP

### Adicionado

- Next.js 15 + TypeScript strict
- APIs de normas, empresas e conformidade
- Upload e gestão documental
- Estrutura inicial de dashboard e busca
