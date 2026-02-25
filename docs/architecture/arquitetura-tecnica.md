# SGN - Arquitetura Tecnica

> Atualizado em: 2026-02-25

## 1. Resumo

O SGN e um monolito Next.js (App Router) para analise de conformidade SST com IA.
O produto e operado em modo local single-user (sem deploy remoto).
Pipeline remoto ativo apenas para qualidade continua (`.github/workflows/ci.yml`).

## 2. Stack oficial

| Camada | Tecnologia |
|---|---|
| Web framework | Next.js 16 (App Router) |
| Linguagem | TypeScript strict |
| UI | React 19 + Tailwind + shadcn/ui |
| Estado URL | nuqs |
| Banco | Drizzle ORM + LibSQL (`@libsql/client`) |
| Persistencia | SQLite local (`file:./data/sgn.db`) com opcao LibSQL/Turso |
| IA | Groq, Z.AI (GLM-4.7), Ollama |
| Observabilidade | Sentry + Pino |
| Testes | Jest + Playwright |

## 3. Principios arquiteturais

1. Server Components por padrao para fetch e composicao de pagina.
2. Client Components apenas para interatividade.
3. Validacao de entrada via Zod nas rotas API.
4. Persistencia de auditoria em banco para jobs e resultados.
5. Operacao local previsivel com rastreabilidade de dados, logs e backups.

## 4. Contexto de sistema

### Frontend

- `src/app/page.tsx`: entrada principal do fluxo de analise.
- `src/features/analise/components/AnaliseCliente.tsx`: orquestra upload, selecao de NRs, polling de job e exibicao de resultado.
- `src/features/chat-documento/components/ChatInterface.tsx`: consultoria NEX com grounding no documento.

### Backend API

- `POST /api/extrair-texto`: extracao de texto de PDF/DOCX/TXT.
- `POST /api/ia/analisar-conformidade`: inicia job assincrono e retorna `202 Accepted`.
- `GET /api/ia/jobs/[id]`: polling de progresso/estado.
- `GET /api/health`: saude de API, DB e provedor IA.

### Dados

Tabelas principais:

1. `documentos`
2. `analise_jobs`
3. `analise_resultados`
4. `conformidade_gaps`

## 5. Fluxo principal (assincrono)

1. Usuario envia arquivo e seleciona NRs.
2. Sistema extrai texto e valida payload.
3. Rota de analise cria job (`pending`) e responde `202` com `jobId`.
4. Worker interno executa pipeline:
   - extraindo
   - analisando (completo ou incremental)
   - consolidando
   - concluido/erro
5. Frontend acompanha por polling e renderiza score, gaps e plano.
6. Resultado e metadados ficam persistidos para historico/exportacao.

## 6. Estrategia de IA

- Selecao de provider por `AI_PROVIDER` (`groq`, `zai`, `ollama`).
- Fallback hibrido em erros de limite no provider principal.
- Modo incremental para documentos grandes, com chunking e consolidacao final.
- RAG local com evidencias normativas para reduzir alucinacao.

## 7. Limites operacionais atuais

| Item | Limite |
|---|---|
| Upload de arquivo | 100MB |
| Texto extraido (validacao) | 2.000.000 caracteres |
| Texto para IA no modo completo | 500.000 caracteres |
| Timeout de extracao | 120s |
| Timeout maximo da rota de analise | 300s |

## 8. Seguranca e confiabilidade

1. Validacao de env em `src/lib/env.ts`.
2. Zod em entrada de API.
3. Retry/timeout/idempotencia nas rotas criticas de IA.
4. Logs estruturados com correlacao de request.
5. Error boundaries em App Router.
6. Sentry em server, edge e client.
7. Build padronizado em `npm run build` com `next build --webpack`.

## 9. Debito tecnico priorizado

1. Evoluir worker assincrono para fila dedicada fora do ciclo HTTP.
2. Expandir metricas de negocio e alertas operacionais.
3. Ampliar cobertura de testes unitarios em rotas de alto impacto.
4. Consolidar governanca de dados para multi-fontes documentais.

## 10. Documentos relacionados

- `docs/operations/operacao-local.md`
- `docs/operations/pop-analise-conformidade-sst.md`
- `docs/reference/prompt-extracao-estruturada-sgn.md`
- `docs/memory.md`
