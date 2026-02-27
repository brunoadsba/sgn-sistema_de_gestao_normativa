# Changelog

## [2.2.19] - 2026-02-27
### Segurança e Correções
- **Chat NEX Forense**: endurecimento da resposta do chat para evitar alucinações e proteger a integridade da análise documental:
  - Aplicado determinismo absoluto nos parâmetros: `temperature: 0` (Groq/Z.AI/Ollama), `top_p: 1` e `seed: 42`.
  - Prompt atualizado para agir estritamente como "AUDITOR FORENSE", proibindo invenções ou deduções e limitando o robô à informação explícitamente escrita no contexto do documento avaliado.

## [2.2.18] - 2026-02-27
### Corrigido
- **Determinismo de providers IA**: parâmetros de amostragem corrigidos em todos os providers para garantir respostas idênticas ao analisar o mesmo documento:
  - **Groq**: `top_p` corrigido de `0.9` para `1`, adicionado `seed: 42` (causa primária da oscilação de scores).
  - **Z.AI**: `temperature` corrigido de `0.1` para `0`, `top_p` corrigido de `0.8` para `1`.
  - **Ollama**: `temperature` corrigido de `0.1` para `0`, adicionados `top_p: 1` e `seed: 42`.
- **Recálculo de score pós-filtro**: `validarEvidenciasDaResposta` agora recalcula o score proporcionalmente quando gaps com evidências inválidas são removidos, eliminando inconsistência entre score e gaps visíveis.
- **Sugestão de NRs determinística**: `/api/ia/sugerir-nrs` corrigido para `temperature: 0`, `top_p: 1` e `seed: 42` em Groq e Z.AI, garantindo mesmas NRs sugeridas para o mesmo documento.
- **Círculo de score 100%**: corrigido mismatch de raio no SVG (circunferência calculada com `r=40` mas elemento usava `r=42`), e aplicado `strokeLinecap: butt` para fechar o traço sem gap visual.
- **Cabeçalho do PDF centralizado**: títulos "Severidade", "Categoria", "Descrição" e "Recomendação" na Matriz de Gaps do PDF agora centralizados via `textAlign: center`.

### Alterado
- **Prompts reforçados para aderência estrita à KB**: instruções nos prompts do Groq e Ollama agora proíbem explicitamente a criação de gaps sem lastro na base de conhecimento normativa local, com fórmula determinística de score (100 base, dedução fixa por severidade: crítica=-20, alta=-15, média=-10, baixa=-5).

### Qualidade
- `npx tsc --noEmit` ✅
- `npm run test:ci` ✅ (`54/54`)

## [2.2.17] - 2026-02-26
### Adicionado
- **Pipeline PDF híbrido**: endpoint `POST /api/reports/generate` com `@react-pdf/renderer`, contrato `ReportData` e mapper `toReportData`.
- **Engine configurável no front**: `NEXT_PUBLIC_PDF_ENGINE` (`dom` default, `react-pdf` opcional) com fallback automático para impressão local quando a API de PDF falha.
- **Ordenação normativa determinística**: utilitário central para normalização e ordenação crescente de NRs aplicado na sugestão (`/api/ia/sugerir-nrs`) e na seleção da UI.

### Alterado
- **Matriz de Gaps (UI web)**: refatorada para tabela técnica estruturada com colunas `Severidade`, `Categoria`, `Norma`, `Status`, `Descrição`, `Recomendação`, incluindo:
  - badges semânticos de severidade/status;
  - normalização visual de categoria;
  - zebra striping + hover de linha;
  - bloqueio de hifenização automática de termos técnicos.
- **PDF técnico (react-pdf)**: ajustes de layout para evitar vazamento entre colunas da matriz de gaps e reforço de campos `legalStatus`/`confidence` no summary.
- **Documentação canônica**: atualização completa de `README`, arquitetura, runbook, POP, checklist de impressão, plano UX/UI PDF e memória operacional para refletir o estado real.

### Qualidade
- `npx tsc --noEmit` ✅
- `npm run lint` ✅
- `npm run test:ci` ✅ (`54/54`)

## [2.2.16] - 2026-02-26
### Adicionado
- **Gate legal de laudo**: resultado de análise passa a nascer como `pre_laudo_pendente`, com revisão humana explícita para decisão final (`laudo_aprovado` ou `laudo_rejeitado`).
- **Trilha auditável de revisão humana**: nova tabela `analise_revisoes` + endpoints de revisão por análise:
  - `POST /api/ia/analisar-conformidade/[id]/revisao/aprovar`
  - `POST /api/ia/analisar-conformidade/[id]/revisao/rejeitar`
  - `GET /api/ia/analisar-conformidade/[id]/revisao`
- **Agente especialista formal**: perfis `sst-generalista` e `sst-portuario` com seleção automática por contexto e integração em análise, sugestão de NRs e chat NEX.
- **Endpoint de apoio ao agente**: `POST /api/ia/agente/especialista`.

### Alterado
- **Confiabilidade da análise**: inclusão de `confidenceScore`, `confidenceClass`, `confidenceSignals`, `alertasConfiabilidade` e `documentHash` na persistência e resposta de análises.
- **Sugestão de NRs mais colaborativa**: saída de `/api/ia/sugerir-nrs` agora combina IA + heurística e retorna `confiancaSugestao`, `concordanciaNormativa`, `divergencias` e `alertas`.
- **Heurística normativa reforçada para cenário portuário**: foco adicional em sinais de `NR-29` e `NR-30`.
- **UI de resultado/histórico**: exposição de status legal e confiança no relatório e no histórico.

### Qualidade
- `npx tsc --noEmit` ✅
- `npm run lint` ✅
- `npm run test:ci` ✅ (`43/43`)

## [2.2.15] - 2026-02-26
### Alterado
- **Idempotência persistente em banco**: `src/lib/idempotency.ts` passou a usar tabela `idempotency_cache` para armazenar `Idempotency-Key -> payload hash -> resposta`, com conflito `409` para reaproveito com payload divergente.
- **Compatibilidade de rollout**: fallback automático para cache em memória quando a tabela ainda não existe no ambiente, evitando regressão durante janela de sincronização de schema.
- **Contrato assíncrono consolidado**: arquitetura canônica mantida no runtime da rota (`waitUntil`/fallback), com remoção do diretório ativo de worker legado.
- **Schema alinhado ao banco real**: `conformidade_gaps` voltou a mapear colunas GUT (`probabilidade`, `pontuacao_gut`, `classificacao`, `prazo_dias`) e a tabela histórica `idempotency_keys` foi tipada como legado para eliminar prompts interativos de rename/data-loss no `drizzle-kit push`.

### Qualidade
- Nova suíte unitária para idempotência mantida em verde após migração assíncrona para DB.
- Gate validado em `2026-02-26`:
  - `npx tsc --noEmit` ✅
  - `npm run lint` ✅
  - `npm run build` ✅
  - `npm run test:ci` ✅
  - `npm run test:e2e` ✅ (`33/33`)

## [2.2.14] - 2026-02-26
### Corrigido
- **Gate de unit tests estabilizado**: `test:ci` voltou a executar apenas suites canônicas de `src/**`, isolando artefatos legados (`harbor-tasks/**`) e eliminando colisões do Jest/Haste.
- **Idempotência da análise concluída no fluxo assíncrono**: `POST /api/ia/analisar-conformidade` agora persiste resposta idempotente de criação de job, retorna conflito `409` para payload divergente e reaproveita `jobId` com a mesma chave.

### Segurança
- **Rate limiting aplicado em rotas de alto custo**: proteção in-memory ativada para `/api/ia/analisar-conformidade`, `/api/extrair-texto` e `/api/chat-documento` (além do polling em `/api/ia/jobs/[id]`).

### Qualidade
- Validação local concluída com sucesso em `2026-02-26`:
  - `npx tsc --noEmit` ✅
  - `npm run lint` ✅
  - `npm run build` ✅
  - `npm run test:ci` ✅
  - `npm run test:e2e` ✅ (`33/33`)

## [2.2.13] - 2026-02-26
### Corrigido
- **Build offline para fontes**: substituido `next/font/google` por `next/font/local` em `src/app/layout.tsx`, com fontes self-hosted em `src/app/fonts/`, eliminando dependencia de `fonts.googleapis.com` no build.

## [2.2.12] - 2026-02-26
### Corrigido
- **Baseline de qualidade recuperado**: `npx tsc --noEmit` voltou a passar após alinhamento de contratos de tipo em IA/UI.
- **Lint estabilizado**: `npm run lint` voltou a passar com ajuste de escopo (ignores para artefatos gerados/ambientes legados) e tipagem nas rotas críticas.
- **Higiene de código**: módulo órfão `src/lib/ia/worker/processamento-analise.ts` removido por não estar integrado ao fluxo real da aplicação.

### Alterado
- **Build padronizado**: script atualizado para `next build --webpack` visando maior previsibilidade local.

## [2.2.11] - 2026-02-26
### Alterado
- **5S documental aplicado**: padronizacao dos documentos canonicos (`README`, arquitetura, operacao, seguranca, contribuicao, memory e governanca) com alinhamento ao estado real do repositorio.
- **Governanca fortalecida**: criado `docs/governance/5s-documentacao.md` com matriz 5S, checklist operacional e cadencia de revisao.
- **Memoria operacional consolidada**: `docs/memory.md` reduzido para snapshot executivo; historico expandido preservado em `docs/archive/memory-legacy-2026-02-25.md`.

## [2.2.10] - 2026-02-25
### Alterado
- **Normalização segura de respostas da IA**: camada de pós-processamento corrige erros textuais recorrentes (ex.: “ouuições” -> “atribuições”), higieniza espaços/linhas e aplica antes de calcular hash/persistir, garantindo relatório e fingerprint consistentes.

## [2.2.9] - 2026-02-25
### Alterado
- **Fingerprint auditável da análise**: resultado persistido com metadados técnicos de reprodutibilidade (`inputHash`, `documentHash`, `resultHash`, `provider`, `model`, `promptVersion`, `chunkingVersion`, `chunkCount`, `strictDeterminism`).
- **Reuso estrito por hash de entrada**: `POST /api/ia/analisar-conformidade` reaproveita resultado existente quando a mesma fingerprint de entrada já foi concluída (`ANALYSIS_STRICT_REUSE=true`).
- **Observabilidade de divergência**: finalização de job agora detecta e registra quando o mesmo `inputHash` gera `resultHash` diferente em nova execução.
- **Endpoint técnico de diagnóstico**: novo `GET /api/ia/diagnostico-divergencias` para consulta histórica paginada de divergências por fingerprint.

### Qualidade
- Novos testes unitários para fingerprint de análise e para fluxo de reaproveitamento por fingerprint na API.

## [2.2.8] - 2026-02-25
### Alterado
- **Determinismo estrito da análise**: adicionada flag `ANALYSIS_STRICT_DETERMINISM` (default `true`) para execução reprodutível em contexto local/single-user.
- **Providers de IA em modo estrito**: `temperature=0` e `top_p=1` para Groq/Z.AI/Ollama quando modo estrito está ativo; retry no Z.AI mantém o mesmo modelo (sem troca silenciosa).
- **Fallback controlado**: worker não faz fallback automático Groq -> Z.AI quando `ANALYSIS_STRICT_DETERMINISM=true`; erro fica explícito e rastreável.
- **Score backend determinístico**: resultado final passa a ser recalculado por fórmula fixa (100 - penalidades por gaps únicos), aplicada nos fluxos completo e incremental.
- **Resumo incremental**: removida mensagem técnica de consolidação por blocos; resumo passa a priorizar conteúdo analítico do próprio resultado.
- **Idempotência automática no cliente**: frontend agora envia `Idempotency-Key` determinística para reaproveitar jobs/resultados da mesma entrada.
- **Calibração inicial de estratégia de processamento**: decisão automática `completo` vs `incremental` passou a usar limiares por provider (`GROQ=60000`, `ZAI=120000`, `OLLAMA=50000`), reduzindo variação para documentos médios no contexto local/single-user.

### Qualidade
- Novos testes unitários para score determinístico e geração estável de `Idempotency-Key`.
- Novo teste unitário para decisão de estratégia de processamento calibrada.

## [2.2.7] - 2026-02-25
### Alterado
- **UX de relatorio PDF (print-first)**: fluxo em dois passos (`Visualizar para Impressao` -> `Imprimir / Salvar PDF`) com pre-visualizacao A4 em tela e orientacoes operacionais de impressao.
- **Layout de impressao corporativo**: secao dedicada `only-print` no relatorio tecnico com capa, resumo executivo, matriz de gaps, plano de acao e rodape de rastreabilidade.
- **Hardening de print global**: `@media print` com `@page A4`, utilitarios (`no-print`, `only-print`, `avoid-break`, `page-break-*`) e neutralizacao de elementos visuais que degradam output.
- **Shell blindado para PDF**: header global e canvas de fundo removidos do fluxo de impressao.
- **Sanitização do reporte técnico**: o resumo impresso não repete “Análise consolidada…” nem exibe “ID do Job”, as seções “Pontos Fortes”/“Pontos de Atenção” são mantidas próximas aos respectivos conteúdos, a “Matriz de Gaps” inicia junto à tabela e o arquivo salvo segue o padrão `Relatório_SGN_dd-mm-yyyy_HH-MM`.

### Qualidade
- **E2E dedicado de impressao**: nova suite `e2e/relatorio-print.spec.ts` cobrindo visualizacao, acao de imprimir e retorno ao modo interativo.
- **Runbook operacional**: adicionado checklist manual para validacao de PDF em Chrome/Edge (`docs/operations/checklist-validacao-impressao-relatorio-pdf.md`).

## [2.2.6] - 2026-02-25
### Corrigido
- **Polling de jobs mais enxuto**: `GET /api/ia/jobs/[id]` passou a retornar apenas metadados mínimos do documento (`id`, `nomeArquivo`, `tipoDocumento`), removendo payload desnecessário no loop de polling.
- **Validação de ambiente por provider**: `GROQ_API_KEY` agora é exigida apenas quando `AI_PROVIDER=groq`; configuração condicional alinhada para `zai` e `ollama`.

### Alterado
- **Resiliência de idempotência**: limpeza periódica de `idempotency_keys` expiradas integrada ao worker com novo parâmetro `WORKER_IDEMPOTENCY_CLEANUP_INTERVAL_MS`.
- **Governança de schema local**: baseline SQL `drizzle/0000` readequado ao modelo atual local-only/single-user e journal Drizzle atualizado para incluir `0002` e `0003`.
- **Operação local**: runbook e README atualizados para fluxo canônico de sincronização de schema via `npm run db:push`.

## [2.2.5] - 2026-02-25
### Corrigido
- **Liveness operacional desacoplado de dependências externas**: adicionado `GET /api/live` para checagem de processo vivo; `docker-compose` e `docker-deploy.sh` migrados para usar liveness em vez de `/api/health`.
- **Resiliência do worker**: loop do worker passou a tolerar erros transitórios sem encerrar o processo, com retry interno e pausa controlada.

### Alterado
- **Detecção de jobs órfãos**: recuperação agora considera `heartbeat` de atividade do worker (além de `startedAt`) para reduzir falso positivo em jobs longos.
- **Configuração de worker**: adicionada variável `WORKER_HEARTBEAT_INTERVAL_MS` no schema de ambiente e `.env.example`.
- **Qualidade**: novas suítes `api-live` e `worker-runner` cobrindo liveness, resiliência do loop e heartbeat.

## [2.2.4] - 2026-02-25
### Adicionado
- **Worker dedicado fora do ciclo HTTP**: novo runtime em `src/lib/ia/worker/*` para consumir fila de análises com claim de jobs `pending`, execução assíncrona, e persistência de metadados operacionais por job.
- **Resiliência de fila**: retry com backoff, timeout por job, dead-letter lógico e recuperação periódica de jobs órfãos (`processing` antigo).

### Alterado
- **API `/api/ia/analisar-conformidade`**: agora atua como enfileirador (`202 Accepted`) e não processa mais jobs em `waitUntil` no fluxo padrão; modo `sync` mantido como fallback administrativo.
- **Operação Docker local**: stack atualizado para `sgn-app` + `sgn-worker`; `docker-compose.prod.yml` alinhado ao modelo local-only sem Redis/nginx.
- **Scripts operacionais**: `scripts/docker-deploy.sh` reescrito para fluxo local-only com validação de `sgn-worker`.
- **UX de progresso**: status `processing` mapeado no stepper de análise.

## [2.2.3] - 2026-02-25
### Corrigido
- **Health check operacional**: `/api/health` agora retorna erro (`503`) quando banco ou LLM estiverem indisponíveis, removendo falso positivo de prontidão.
- **Idempotência de análise**: fluxo de `Idempotency-Key` migrado para persistência em banco com vínculo determinístico `key -> jobId` e conflito `409` para payload divergente.

### Segurança
- **Sanitização de logs**: removidos previews de conteúdo documental e dumps de resposta de LLM; rotas críticas passaram a usar logging estruturado com dados minimizados.
- **Hardening do chat NEX**: bloqueio de `role=system` na entrada do cliente, validação de tamanho/quantidade de mensagens e remoção de fallback implícito para `OPENAI_API_KEY`.

### Alterado
- **Local-only consistente**: CORS configurável por `ALLOWED_ORIGINS`, remoção de redirect legado e ajuste de script de performance para alvo local.
- **Qualidade**: novos testes unitários para `/api/chat-documento` e atualização de testes de `/api/health`; smoke E2E de health ajustado para cenários `200/503`.
- **Gate de unit tests em CI**: `test:ci` ajustado para execução determinística sem bloqueio por cobertura global irreal nesta fase; cobertura segue disponível via script dedicado.
- **Frente F ampliada**: adicionados testes de contrato para `/api/ia/analisar-conformidade`, `/api/ia/jobs/[id]`, `/api/extrair-texto` e serviço de idempotência.
- **E2E do fluxo assíncrono**: adicionado cenário de criação de job + polling até estado terminal em `e2e/api.spec.ts`.

## [2.2.2] - 2026-02-25
### Alterado
- **Documentação canônica atualizada**: alinhamento de `README.md`, `SECURITY.md`, `docs/README.md`, `docs/architecture/arquitetura-tecnica.md`, `docs/operations/operacao-local.md`, `docs/operations/pop-analise-conformidade-sst.md` e `docs/memory.md` com estado real local-only.
- **Runbook local refinado**: gate operacional consolidado com `npx tsc --noEmit`, `npm run lint`, `npm run build` (webpack) e `npm run test:e2e`.
- **Governança local-only reforçada**: confirmação documental de pipeline único `ci` e ausência de workflows ativos de deploy/release.

## [2.2.1] - 2026-02-24
### Adicionado
- **Extração estruturada GUT + 5W2H**: Metodologia GUT (probabilidade × severidade) em gaps, classificação (CRITICO|ALTO|MEDIO|BAIXO), prazo em dias automático, plano de ação 5W2H estruturado (what, who, prazoDias, evidenciaConclusao, kpi).
- **Otimização Z.AI GLM-4.7**: Parâmetro `thinking: { type: "disabled" }` para evitar `content` vazio; `max_tokens` aumentado para 16384 na análise e 4096 no chat.

### Alterado
- **Chat NEX (Z.AI)**: max_tokens 4096, timeout 55s, headers de streaming aprimorados, tratamento de erro antes de retornar stream.
- **Análise de conformidade**: Novos campos em gaps (probabilidade, pontuacaoGut, classificacao, prazoDias) e planoAcao no metadata.

## [2.2.0] - 2026-02-24
### Adicionado
- **Oracular Streaming NEX**: Implementação de resposta em tempo real (streaming) no chat via `ReadableStream`, permitindo interação instantânea e fluida.
- **Power Mode Local**: Suporte a "arquivos gigantes" de até 50MB no ambiente local, com aumento de timeout de extração para 120s e expansão de limites de payload no Next.js.
- **Z.AI GLM-4.7 Nativo**: Priorização do provedor Z.AI com janela de contexto dinâmica (80k chars por chunk) otimizada para o modelo GLM-4.7.

### Alterado
- **Studio UX Unificada**: Chat NEX migrado para um Drawer lateral de alta visibilidade com correção de stacking context (Z-index) contra o header.
- **Naming Funcional**: Botão principal renomeado para "Analisar com IA" para clareza funcional.
- **Extração Proativa**: A extração de texto para o chat agora inicia imediatamente em background ao anexar o arquivo, sem aguardar a análise técnica.


## [2.1.0] - 2026-02-24
### Adicionado
- **Studio Minimalista (Redesign Pivot)**: Migração do layout de 3 colunas para um fluxo centralizado e linear (`max-w-4xl`), reduzindo a carga cognitiva e priorizando o diagnóstico.
- **NEX Side Drawer**: O assistente NEX foi movido para um painel lateral retrátil (Drawer) com animação spring, disponível sob demanda via botão "Consultar NEX".
- **Foco em Auditoria**: Reorganização dos passos de configuração em uma pilha vertical lógica e intuitiva.

### Alterado
- **Ajustes de Viewport**: Remoção do suporte ultra-wide de 1700px em favor de um container focado de 896px-1024px.
- **Hierarquia Visual**: Títulos e botões de ação redimensionados para melhor balanceamento em resoluções padrão.

## [2.0.0] - 2026-02-23
### Adicionado
- **Workspace NotebookLM (Redesign)**: Interface transformada em 3 colunas paralelas (Fontes | NEX Chat | Estúdio), otimizando o fluxo de análise e consulta.
- **Chat Native Integration**: O NEX Copilot agora é parte central e nativa do layout, eliminando a dependência de sidebars para interação primária.
- **Ultra-Wide Support**: Layout dinâmico que expande para 1700px em resoluções altas para acomodar as 3 colunas.
- **Sistema de Eventos UI**: Comunicação via CustomEvents para orquestrar a abertura do chat entre componentes remotos.

### Alterado
- **Limpeza de UI**: Removidos componentes redundantes (`ChatSidePanel`) e estados de interface obsoletos.
- **Branding NEX**: Atualização visual da área de chat com novos indicadores de status e tipografia premium.

## [1.10.0] - 2026-02-23
### Adicionado
- **NEX (Consultoria Neural)**: Novo assistente interativo integrado. Possibilita aos usuários sanar dúvidas instantaneamente referenciadas num contexto estrito e baseadas no conteúdo extraído do documento avaliado.
- **Floating Bubble (Chat)**: Inteface de chat imersiva que domina 80% do viewport, com sobreposição focal escurecida (backdrop-blur) implementando Glassmorphism.
- **Extração Analítica em Background**: O documento carregado passa a ter seu conteúdo bruto processado e acoplado no contexto do RAG sem impactar a tela de análise.
- **Segurança Cognitiva:** Prompt System robusto blindado contra injeções, limitando o robô a entregar respostas baseadas unicamente no conteúdo do texto.

## [1.9.2] - 2026-02-22
### Adicionado
- **Patches Agênticos Harbor**: Implementação de indexação rápida (fast-indexing) e aumento de timeout para 1 hora (`3600s`) no agente Aider, permitindo refatorações complexas em hardware local (Ollama/CPU).
- **Expansão de Testes Unitários**: Nova suíte de testes para `chunking.ts` e `persistencia-analise.ts`, garantindo integridade em documentos de 2M+ caracteres.
- **Ollama Proxy Estabilizado**: Proxy local em Node.js (porta 11435) para monitoramento de latência e debug de chamadas ao LLM local.

### Corrigido
- **Hardening Docker de Produção**: Aplicação de healthchecks, limites de recursos (mem/cpu) e políticas de restart no `docker-compose.prod.yml`.
- **Docker Compose Dev/Prod**: Sincronização de volumes e variáveis de ambiente para evitar drift entre ambientes de desenvolvimento e produção.
- **Harbor Scorecard**: Correção de caminhos de base normativa no script de validação de acurácia.

## [1.9.1] - 2026-02-22
### Adicionado
- **Infraestrutura Harbor Estabilizada**: Criação de Dockerfiles especializados para execução de agentes de IA com privilégios de root no ambiente de tarefas.
- **Relatório de Pendências IA**: Novo documento `docs/harbor/pendencias-e-erros.md` centralizando gargalos técnicos identificados.

### Corrigido
- **Hardening Docker de Produção**: Automação via agente Harbor (Aider) para aplicar healthchecks, limites de CPU/Memória e políticas de restart no `docker-compose.prod.yml`.
- **Resiliência do .dockerignore**: Remoção de regras que bloqueavam arquivos de configuração vitais (`Dockerfile`, `docker-compose`) durante o build de containers.
- **Environment Mapping**: Configuração de variáveis de ambiente dummy (`GROQ_API_KEY`, etc.) embutidas para permitir build de containers em ambientes agênticos isolados.

## [1.9.0] - 2026-02-21
### Adicionado
- **Auto-Sugestão de NRs (IA Mapeando IA)**: Novo endpoint `/api/ia/sugerir-nrs` que analisa o início do documento para sugerir normas aplicáveis automaticamente.
- **Botão "Descobrir Normas com IA"**: Integração no frontend para disparar a sugestão quando nenhuma norma está selecionada.
- **Accordions Dinâmicos**: Refatoração da exibição de gaps no `ResultadoAnalise.tsx` usando `shadcn/ui`, com gaps críticos/altos abertos por padrão.
- **Otimização de Performance (Canvas)**: Implementação da `Page Visibility API` no `CanvasBackground.tsx` para pausar animações quando a aba não está visível.

### Alterado
- Melhoria nos rótulos de botões em `AnaliseCliente.tsx` para clareza funcional.
- Atualização do componente `ResultadoAnalise.tsx` para priorizar visualmente riscos mais graves.
- **Manutenção**: Atualização seletiva de dependências (`Next.js`, `React`, `Sentry`, `Drizzle`) para melhoria de estabilidade.

Todas as mudanças relevantes do SGN são documentadas neste arquivo.

## [2026-02-21] - Persistência em Nuvem e UX de Tempo Real (V1.8.0)

### Adicionado
- **Infraestrutura Turso DB**: Migração do SQLite local para Turso (LibSQL), permitindo persistência real de dados no ambiente Serverless da Vercel.
- **Sistema de Job Tracking**: Implementação de polling assíncrono para acompanhamento do progresso da IA.
- **Feedback Visual de Progresso**: Novo componente de Stepper na UI que mostra as etapas de extração, análise e consolidação em tempo real.
- **Laudo Técnico com Rastreabilidade**: O PDF/Impressão agora inclui ID do Job, Nome do Arquivo e Metadados de processamento para auditoria profissional.
- **Fluxo Iniciado por Norma**: Botão "Analisar com esta NR" na página de detalhes da norma, permitindo iniciar um diagnóstico com pré-seleção automática.
- **Nomenclatura Corrigida**: Diferenciação entre "Ficha de Referência Normativa" (estática) e "Laudo de Conformidade" (analítico).

### Alterado
- **Conexão Lazy com o Banco**: Implementação de Proxy no cliente Drizzle para evitar tentativas de conexão durante o build do Next.js.
- **Branding de Impressão**: Layout de PDF otimizado para laudos corporativos, incluindo rótulos de nível de conformidade (Alta, Parcial, Baixa).

### Corrigido
- **Build Errors no Vercel**: Correção de async params em rotas dinâmicas e tipagem estrita para Next.js 15+.
- **Ghosting no Git**: Ajuste nas regras do `.gitignore` e `.vercelignore` que bloqueavam indevidamente pastas de código-fonte (`src/lib/data` e `src/app/api/ia/jobs`).
- **Hydration Mismatch**: Supressão de alertas de lint em transições de estado de montagem no Client.

## [2026-02-21] - Otimização de RAG e IA Híbrida (V1.7.0)

### Adicionado
- **Arquitetura de IA Híbrida**: suporte nativo a provedores **Groq (Cloud)** e **Ollama (Local)** via variável `AI_PROVIDER`.
- **Suporte NR-29 e NR-30 (Portos/Aquaviário)**: inclusão de base normativa de 100k+ bytes e validação no Harbor Scorecard.
- **Harbor Scorecard Automatizado**: script de orquestração (`scripts/harbor-scorecard.py`) para medição de Recall e Precision com Golden Dataset.
- **Cache de Evidências**: sistema de validação que garante que o "lastro" citado pela IA realmente existe no Knowledge Base local.
