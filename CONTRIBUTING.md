# Contributing

Este documento define o fluxo oficial de contribuição para o SGN.

## Estratégia de Branch

1. Nunca desenvolver direto em `master`.
2. Criar branch por escopo:
   - `feat/<tema>`
   - `fix/<tema>`
   - `docs/<tema>`
   - `chore/<tema>`
3. Cada branch deve tratar um único objetivo de negócio/técnico.

## Padrão de Commit

Formato obrigatório:

```text
tipo(feature): descrição concisa
```

Exemplos:
- `feat(normas): adicionar busca por query string com nuqs`
- `fix(api): corrigir parse de pdf na rota extrair-texto`
- `docs(arquitetura): atualizar estado pós-refatoração server/client`

## Pull Request

### Requisitos mínimos

1. Tipo e objetivo claros no título.
2. Descrição do impacto funcional/técnico.
3. Evidência de validação local.
4. Atualização de documentação afetada.

### Checklist antes de abrir PR

1. Executar qualidade estática:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
2. Executar build:
   ```bash
   npm run build
   ```
3. Executar testes disponíveis:
   ```bash
   npm run test:e2e
   ```
   - Resultado esperado: suíte verde, sem cenários flaky.
4. Revisar documentação:
   - `README.md`
   - `docs/README.md`
   - `docs/memory.md`
   - `docs/architecture/arquitetura-tecnica.md`
   - `docs/operations/operacao-local.md` (quando houver impacto operacional)
   - `docs/governance/documentacao.md` (quando houver criação/revisão documental)
   - `CHANGELOG.md`
   - `SECURITY.md` (quando houver impacto)
5. Verificar segredos:
   ```bash
   git grep -i "api_key\|password\|secret"
   ```
6. Quando houver impacto operacional local:
   - Validar startup com `npm run dev` e `npm run docker:start`
   - Confirmar health check em `GET /api/health`
   - Validar backup e restore (`npm run db:backup` e `npm run db:restore`)

## Convenções de Engenharia

1. TypeScript em strict mode.
2. Validação de entrada com Zod.
3. Estrutura de resposta de API consistente (`success`, `data`, `error`).
4. Logs exclusivamente via `@/lib/logger`.
5. Princípios obrigatórios: DRY, KISS, YAGNI.
6. Tamanho recomendado de arquivo: até 200 linhas (quebrar quando necessário).
7. Server Components por padrão; usar `"use client"` apenas para interatividade.
8. Dark mode obrigatório em componentes visuais (`dark:`).

## Padrão Arquitetural Atual

1. Server Components fazem fetch de dados.
2. Client Components recebem props e controlam estado/interação.
3. Estado compartilhável na URL via `nuqs`.

## Critérios de Aceite para Merge

1. Não quebrar fluxo principal (`/`, `/normas`, `/normas/[id]`, `/nr6`).
2. Não introduzir regressão em extração de arquivos (`PDF`, `DOCX`, `TXT`).
3. Não introduzir warnings/erros TypeScript.
4. Não introduzir regressão em estabilidade E2E.
5. Atualizar `CHANGELOG.md` para mudanças relevantes.
