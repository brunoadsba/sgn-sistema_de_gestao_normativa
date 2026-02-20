# SGN - Sistema de Gestão Normativa

Plataforma local de análise de conformidade em SST (Saúde e Segurança no Trabalho) com IA.

O SGN processa documentos corporativos (PGR, PCMSO, LTCAT e similares), cruza com Normas Regulamentadoras (NRs) e gera diagnóstico executivo com score, gaps, severidade e plano de ação.

## Status do Projeto

- `Status`: ativo, em produção local
- `Arquitetura`: monolito Next.js (App Router)
- `Modelo operacional`: single-user local
- `Branch principal`: `master`
- `Qualidade atual`: `lint` e `build` verdes no estado atual

## Capacidades

1. **Análise de conformidade com IA**
   - Upload de `PDF`, `DOCX` e `TXT` (até 100MB)
   - Extração de texto server-side (`pdf-parse` + `mammoth`)
   - Análise via GROQ (`Llama 4 Scout 17B`)
   - Estratégia de processamento opcional: `completo` ou `incremental` (chunking + consolidação)
2. **Catálogo de normas**
   - 38 NRs com busca dinâmica
   - Estado de busca na URL com `nuqs` (`?search=`)
   - Página detalhada com links oficiais e anexos
3. **Análise específica NR-6**
   - Fluxo dedicado para EPIs
4. **Persistência e histórico**
   - SQLite + Drizzle (`documentos`, `analise_jobs`, `analise_resultados`, `conformidade_gaps`)
   - Histórico com filtros, ordenação, busca, paginação e exportação CSV (horário de Brasília)
5. **Confiabilidade e observabilidade**
   - Retry com timeout para chamadas críticas
   - Idempotência em análise de IA
   - Sentry integrado (server, edge e client)
   - Health check com status de banco, API e LLM
6. **Experiência mobile/web de abertura**
   - Ícone PWA da marca SGN (`/icon` e `/apple-icon`)
   - Splash nativa com tema escuro (manifest)
   - Tela de abertura premium (card glass + iluminação + textura) com CTA **Acessar Plataforma**
   - Gate de entrada exibido uma única vez por dispositivo (`localStorage`)
   - Após a liberação inicial, navegação interna usa loading leve (skeleton), sem splash full-screen repetitiva

## Stack Técnica

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript (strict) |
| UI | React 19 + Tailwind CSS + shadcn/ui |
| Estado em URL | nuqs |
| Banco | SQLite (`better-sqlite3`) + Drizzle ORM |
| IA | GROQ SDK (`meta-llama/llama-4-scout-17b-16e-instruct`) |
| Extração de texto | `pdf-parse` v2 + `mammoth` |
| Testes E2E | Playwright |
| Logging | Pino |

## Quick Start

### Pré-requisitos

- Node.js 18+
- Chave GROQ (`GROQ_API_KEY`)

### Execução local

1. Instale dependências:
   ```bash
   npm install
   ```
2. Crie variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
3. Configure `.env.local`:
   ```bash
   GROQ_API_KEY=sua_chave_aqui
   ```
4. Rode o projeto:
   ```bash
   npm run dev
   ```
5. Acesse:
   - `http://localhost:3001`

### Execução com Docker

```bash
npm run docker:start
```

## Fluxo Funcional Principal

1. Acessar `/`
2. Enviar documento SST
3. Selecionar NRs aplicáveis
4. Executar **Analisar Conformidade com IA**
5. Avaliar resultado:
   - score
   - gaps por severidade
   - pontos de atenção
   - próximos passos

## Operação e Limites

| Item | Valor |
|------|-------|
| Upload máximo | 100MB |
| Limite do texto extraído (validação) | 2.000.000 caracteres |
| Texto enviado à IA (modo completo) | 500.000 caracteres |
| Processamento incremental | chunks com overlap e consolidação final |
| Porta padrão | 3001 |

## Comandos Essenciais

```bash
# desenvolvimento
npm run dev
npm run build
npm run lint

# testes
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report

# banco (drizzle)
npm run db:generate
npm run db:push
npm run db:studio

# docker
npm run docker:start
npm run docker:stop
```

## Problemas Comuns

| Situação | Ação recomendada |
|----------|------------------|
| Erro de extração de texto | Validar arquivo (sem senha/corrupção) e formato suportado |
| Chave GROQ inválida | Revisar `GROQ_API_KEY` em `.env.local` |
| Documento muito grande | Reduzir arquivo para até 100MB ou dividir o conteúdo |
| Falha em análise por indisponibilidade externa | Tentar novamente e validar status em `/api/health` (campo `llm`) |
| Home travada em "Carregando SGN..." | Revisar CSP (`script-src`) em `next.config.js` para não bloquear hidratação do Next.js |
| Atalho mobile não atualiza ícone/splash | Remover atalho antigo, limpar cache do navegador e adicionar novamente à tela inicial |

## Documentação

- `docs/memory.md` - contexto operacional completo e histórico de sessões
- `docs/sql/arquitetura.md` - arquitetura técnica consolidada
- `docs/Guia-Vercel.md` - guia operacional de deploy e checklist
- `docs/POP-Uso-do-SGN-Analise-de-Conformidade-SST.md` - POP e gate GO/NO-GO para operacao
- `CHANGELOG.md` - histórico de mudanças
- `SECURITY.md` - modelo de segurança e hardening
- `CONTRIBUTING.md` - fluxo de contribuição
