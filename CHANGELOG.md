# Changelog

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
