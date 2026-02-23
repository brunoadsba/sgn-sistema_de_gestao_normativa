# Tarefa: Ampliar Cobertura de Testes Unitários

## Contexto

O SGN é um monolito Next.js 16 (App Router) com Jest para testes unitários. A cobertura atual é inicial — existem testes para:
- `src/__tests__/api-health.test.ts` — health check
- `src/__tests__/session-splash-gate.test.tsx` — gate de abertura
- `src/lib/data/__tests__/normas.test.ts` — helpers de normas
- `src/lib/ia/__tests__/processamento-incremental.test.ts` — chunking/overlap

Faltam testes para as rotas de API críticas e módulos core.

## Objetivo

Criar testes unitários para os módulos e rotas não cobertos, atingindo cobertura mínima de 60% em statements nas pastas `src/lib/` e `src/app/api/`.

## Requisitos

1. **Rota `/api/extrair-texto`**: testar extração de texto para PDF, DOCX e TXT. Mockar `pdf-parse` e `mammoth`. Testar validação de tipo de arquivo e limite de tamanho.

2. **Rota `/api/ia/analisar-conformidade`**: testar validação do payload (Zod), tratamento de erros do LLM, persistência do resultado no banco. Mockar `groq-sdk`.

3. **Rota `/api/normas`**: testar listagem, busca por query e estatísticas. Os dados são locais (não há necessidade de mock de banco).

4. **Módulo `src/lib/ia/groq.ts`**: testar construção do prompt, parsing da resposta JSON, tratamento de resposta malformada.

5. **Módulo `src/lib/ia/persistencia-analise.ts`**: testar persistência e listagem com mock de banco Drizzle.

6. **Módulo `src/lib/fetch-with-retry.ts`**: testar retry, timeout e backoff.

## Convenções

- Testes em `src/__tests__/` ou `src/[modulo]/__tests__/`
- Usar `jest.mock()` para dependências externas
- Usar `node-mocks-http` para simular Request/Response nas API routes
- Framework: Jest + Testing Library (já instalados)
- Idioma dos testes: português brasileiro

## Critério de aceite

- `npm test` passa sem falhas
- `npm test -- --coverage` mostra >= 60% de statements em `src/lib/` e `src/app/api/`
- `npm run build` sem erros
- Nenhum teste depende de serviço externo (todas as chamadas HTTP mockadas)
