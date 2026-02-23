# Tarefa: Implementar Worker Assíncrono para Análises de Conformidade

## Contexto

O SGN é um monolito Next.js 16 (App Router) que faz análise de conformidade SST contra Normas Regulamentadoras. Atualmente, o processamento de análise de conformidade (endpoint `POST /api/ia/analisar-conformidade`) é **síncrono** — a requisição HTTP fica bloqueada até a IA terminar de processar todos os chunks. Isso causa timeout em documentos grandes.

## Objetivo

Implementar um worker assíncrono que processe análises de conformidade em background, liberando a requisição HTTP imediatamente e permitindo que o frontend acompanhe o progresso via polling.

## Requisitos

1. O endpoint `POST /api/ia/analisar-conformidade` deve:
   - Criar um job no banco (`analise_jobs`) com status `pending`
   - Retornar imediatamente o `jobId` para o cliente
   - Iniciar o processamento em background (sem bloquear a resposta HTTP)

2. Criar um endpoint `GET /api/ia/jobs/[id]` que retorne:
   - Status do job (`pending`, `processing`, `completed`, `failed`)
   - Progresso percentual (0-100)
   - Etapa atual (`extracting`, `analyzing`, `consolidating`)
   - Resultado final quando `completed`

3. O processamento em background deve:
   - Atualizar o status do job no banco a cada etapa
   - Usar `Promise` + `waitUntil` do Next.js (se disponível) ou `setTimeout` para não bloquear
   - Persistir o resultado no banco ao finalizar
   - Tratar errors e marcar o job como `failed` com mensagem de erro

4. Manter backward compatibility — o fluxo existente de análise deve continuar funcionando.

## Stack

- Next.js 16 (App Router)
- TypeScript (strict)
- Drizzle ORM + SQLite (Turso)
- Schema em `src/lib/db/schema.ts`
- A feature deve ser criada em `src/features/async-worker/` ou usar a estrutura existente em `src/app/api/ia/`

## Arquivos relevantes

- `src/app/api/ia/analisar-conformidade/route.ts` — endpoint atual (síncrono)
- `src/lib/db/schema.ts` — schema do banco (tabela `analise_jobs`)
- `src/lib/ia/groq.ts` — chamada ao LLM
- `src/lib/ia/chunking.ts` — processamento incremental
- `src/lib/ia/consolidacao-incremental.ts` — consolidação de chunks
- `src/lib/ia/persistencia-analise.ts` — persistência no banco

## Critério de aceite

- `npm run build` sem erros
- `npm run lint` sem erros
- Endpoint retorna `jobId` em menos de 500ms
- Job é processado em background e resultado persiste no banco
- Endpoint de status retorna progresso atualizado
