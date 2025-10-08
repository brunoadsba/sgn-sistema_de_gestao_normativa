LEVANTAMENTO DE REQUISITOS E ENTENDIMENTO DO NEGÓCIO

## 1. Problemas de Negócio Identificados

### Problema Principal
- **Análise manual de conformidade**: Empresas gastam 8+ horas por mês analisando documentos contra Normas Regulamentadoras
- **Erros humanos**: Análises manuais são propensas a erros e inconsistências
- **Custo elevado**: Consultorias externas custam R$ 50.000-200.000 por implementação
- **Falta de padronização**: Cada empresa desenvolve seus próprios métodos de análise
- **Dificuldade de acompanhamento**: Ausência de histórico e métricas de conformidade

### Problemas Específicos por Setor
- **Construção Civil**: NR-18, NR-35, NR-12 - análise complexa e demorada
- **Indústria**: NR-12, NR-17, NR-06 - múltiplas normas simultâneas
- **Hospitalar**: NR-32 - requisitos específicos e atualizações frequentes

## 2. Resultados Esperados

### Resultados Quantitativos
- **Redução de 70%** no tempo de análise de conformidade
- **Economia de 6+ horas** por análise de documento
- **Identificação automática** de 85%+ dos gaps de conformidade
- **Padronização** de 100% dos relatórios gerados
- **Disponibilidade** de 99%+ do sistema

### Resultados Qualitativos
- **Relatórios profissionais** e padronizados
- **Histórico completo** de análises por empresa
- **Dashboard executivo** com métricas de compliance
- **Alertas automáticos** para não conformidades
- **Base de conhecimento** para consultas futuras

## 3. Requisitos Funcionais

### RF01 - Gestão de Empresas
- **RF01.1**: Sistema deve permitir cadastro de empresas clientes
- **RF01.2**: Sistema deve manter isolamento de dados por empresa (multi-tenant)
- **RF01.3**: Sistema deve permitir configuração de usuários e permissões por empresa
- **RF01.4**: Sistema deve armazenar dados da empresa (CNPJ, setor, tamanho, contatos)

### RF02 - Upload e Gestão Documental
- **RF02.1**: Sistema deve permitir upload de documentos (PDF, DOC, DOCX)
- **RF02.2**: Sistema deve armazenar documentos com versionamento
- **RF02.3**: Sistema deve categorizar documentos (manual, procedimento, treinamento)
- **RF02.4**: Sistema deve extrair texto automaticamente dos documentos
- **RF02.5**: Sistema deve armazenar metadados estruturados dos documentos

### RF03 - Análise de Conformidade
- **RF03.1**: Sistema deve comparar documentos empresariais com Normas Regulamentadoras
- **RF03.2**: Sistema deve identificar gaps de conformidade automaticamente
- **RF03.3**: Sistema deve gerar score de conformidade (0-100) por norma
- **RF03.4**: Sistema deve classificar gaps por severidade (alta, média, baixa)
- **RF03.5**: Sistema deve sugerir ações corretivas para cada gap
- **RF03.6**: Sistema deve processar análises de forma assíncrona

### RF04 - Dashboard de Conformidade
- **RF04.1**: Sistema deve exibir dashboard com métricas por empresa
- **RF04.2**: Sistema deve mostrar score geral de conformidade
- **RF04.3**: Sistema deve listar gaps por prioridade
- **RF04.4**: Sistema deve exibir timeline de ações necessárias
- **RF04.5**: Sistema deve gerar relatórios executivos

### RF05 - Relatórios e Exportação
- **RF05.1**: Sistema deve gerar relatórios em HTML
- **RF05.2**: Sistema deve permitir exportação em PDF (futuro)
- **RF05.3**: Sistema deve incluir gráficos e visualizações
- **RF05.4**: Sistema deve permitir personalização de relatórios
- **RF05.5**: Sistema deve manter histórico de relatórios gerados

### RF06 - Base de Dados Normativa
- **RF06.1**: Sistema deve manter base com 38 Normas Regulamentadoras
- **RF06.2**: Sistema deve atualizar normas automaticamente via N8N
- **RF06.3**: Sistema deve manter histórico de versões das normas
- **RF06.4**: Sistema deve permitir busca inteligente nas normas

### RF07 - Sistema de Jobs e Processamento
- **RF07.1**: Sistema deve processar análises em background
- **RF07.2**: Sistema deve mostrar progresso das análises em tempo real
- **RF07.3**: Sistema deve permitir cancelamento de jobs
- **RF07.4**: Sistema deve implementar graceful degradation
- **RF07.5**: Sistema deve manter log de todas as operações

## 4. SIPOC

SIPOC é uma ferramenta de mapeamento de processos utilizada para visualizar de forma macro todos os elementos-chave que compõem um processo.

### Suppliers (Fornecedores)
- **MTE (Ministério do Trabalho e Emprego)**: Fonte oficial das Normas Regulamentadoras
- **Empresas Clientes**: Fornecem documentos para análise
- **Equipe de Desenvolvimento**: Fornece manutenção e melhorias do sistema

### Inputs (Entradas)
- **Normas Regulamentadoras**: Texto oficial das 38 NRs atualizadas
- **Documentos Empresariais**: Manuais, procedimentos, treinamentos
- **Dados da Empresa**: CNPJ, setor, contatos, configurações
- **Feedback dos Usuários**: Sugestões e melhorias

### Process (Processo)
1. **Coleta Automática**: N8N coleta normas do MTE automaticamente
2. **Upload de Documentos**: Cliente faz upload via interface web
3. **Extração de Texto**: Sistema extrai texto dos documentos
4. **Análise de Conformidade**: IA compara documento com normas
5. **Identificação de Gaps**: Sistema identifica não conformidades
6. **Geração de Relatórios**: Sistema cria relatórios executivos
7. **Apresentação de Resultados**: Dashboard exibe métricas e ações

### Outputs (Saídas)
- **Relatórios de Conformidade**: HTML com análise detalhada
- **Dashboard Executivo**: Métricas e indicadores em tempo real
- **Lista de Gaps**: Não conformidades identificadas por prioridade
- **Plano de Ações**: Sugestões de correções personalizadas
- **Histórico de Análises**: Base de conhecimento para consultas

### Customers (Clientes)
- **Engenheiros de Segurança**: Usuários principais do sistema
- **Técnicos de Segurança**: Usuários operacionais
- **SESMT**: Equipes de segurança do trabalho
- **Gestores**: Tomadores de decisão que consomem relatórios
- **Auditores**: Profissionais que validam conformidade

**Benefícios do SIPOC:**
- Visão macro e estruturada do processo
- Facilita a identificação de problemas e melhorias
- Alinhamento entre equipes sobre entradas e saídas esperadas
- Base para análise de processos mais detalhados

## 5. Glossário

### Termos Técnicos
- **NR (Norma Regulamentadora)**: Conjunto de disposições complementares ao art. 200 da CLT
- **SESMT**: Serviço Especializado em Engenharia de Segurança e em Medicina do Trabalho
- **Multi-tenant**: Arquitetura que permite múltiplos clientes isolados no mesmo sistema
- **RLS (Row Level Security)**: Política de segurança que isola dados por tenant
- **Graceful Degradation**: Capacidade do sistema de funcionar com funcionalidades reduzidas
- **N8N**: Ferramenta de automação para coleta de dados
- **Supabase**: Plataforma de backend que fornece banco de dados, autenticação e storage

### Termos de Negócio
- **Gap de Conformidade**: Item não conforme identificado na análise
- **Score de Conformidade**: Pontuação de 0-100 que indica nível de adequação
- **Severidade**: Classificação de importância do gap (alta, média, baixa)
- **Plano de Ação**: Sugestões específicas para correção de gaps
- **Dashboard Executivo**: Interface com métricas e indicadores de alto nível
- **Piloto**: Período de teste gratuito para validação do produto

### Termos de Sistema
- **Job**: Tarefa assíncrona de processamento no sistema
- **Worker**: Processo que executa jobs em background
- **Queue**: Fila de jobs aguardando processamento
- **API REST**: Interface de programação para comunicação entre sistemas
- **OCR**: Reconhecimento óptico de caracteres para extração de texto
- **LLM**: Large Language Model para análise semântica de documentos


