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

1. **Análise de conformidade com IA Híbrida**
   - Suporte a **Groq (Cloud)** e **Ollama (Local)**
   - Upload de `PDF`, `DOCX` e `TXT` (até 100MB)
   - Extração de texto server-side (`pdf-parse` + `mammoth`)
   - Modelos recomendados: `Llama 3.3 70B` (Groq) e `Llama 3.2` (Ollama)
   - Estratégia de processamento: `completo` ou `incremental` (chunking + consolidação)
2. **Catálogo de normas e RAG Otimizado**
   - 38 NRs com busca dinâmica e 100% de Recall em casos críticos (CIPA, EPI, PGR, Portos)
   - Estado de busca na URL com `nuqs` (`?search=`)
   - Página detalhada com links oficiais e anexos mapeados
   - Normalização inteligente de códigos (ex: "5" -> "NR-5")
3. **Assistente de Consultoria Neural (NEX)**
   - Um Chat Copilot atrelado 100% ao contexto do documento analisado.
   - Interface premium integrada nativamente ao Workspace.
   - Grounding restrito: evita alucinação do modelo consultando apenas o escopo extraído.
4. **Layout Workspace NotebookLM (v2.0)**
   - Redesign completo em 3 colunas simultâneas: **Fontes | NEX Chat | Estúdio**.
   - Coluna de Chat centralizada para consulta em tempo real sem interrupção do fluxo.
   - UI responsiva com suporte a monitores Ultra-Wide.
5. **Análise específica NR-6**
   - Fluxo dedicado para EPIs
- 🚀 **Versão 2.0.0**: Redesign Workspace, NEX Native Chat, 3-Col Layout.
5. **Persistência e histórico**
   - **Turso DB (libsql)** e Drizzle: Persistência resiliente de jobs e resultados
   - Histórico com rastreabilidade total (ID de Job, Nome do Arquivo) e exportação
6. **Confiabilidade e observabilidade**
   - Retry com timeout para chamadas críticas
   - Idempotência em análise de IA
   - Sentry integrado (server, edge e client)
   - Health check com status de banco, API e LLM
7. **Experiência mobile/web de abertura**
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
| Banco | **Turso DB (libsql)** + Drizzle ORM |
| IA | GROQ (`llama-3.3-70b-versatile`) + Ollama (`llama-3.2`) |
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
   AI_PROVIDER=groq # ou 'ollama'
   GROQ_API_KEY=sua_chave_aqui
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
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
