# SGN - Tarefas Pendentes

## 🔄 PRÓXIMA ETAPA - ETAPA 3

### Etapa 3: Desenvolvimento do Backend e IA (0% iniciada)

#### ⏳ Criar API Routes no Next.js
- [ ] Endpoint GET /api/normas (listar todas as normas)
- [ ] Endpoint GET /api/normas/[id] (detalhes de norma específica)
- [ ] Endpoint GET /api/normas/[id]/versoes (histórico de versões)
- [ ] Endpoint GET /api/normas/[id]/mudancas (mudanças identificadas)
- [ ] Implementar paginação e filtros
- [ ] Adicionar validação de parâmetros
- [ ] Configurar CORS e headers apropriados

#### ⏳ Integração com LLM (Modelo de Linguagem)
- [ ] Escolher provedor LLM (OpenAI, Anthropic, local)
- [ ] Configurar chaves de API
- [ ] Criar prompts para comparação de versões
- [ ] Implementar client para comunicação com LLM
- [ ] Testar respostas e refinar prompts

#### ⏳ Sistema de Versionamento e Análise de Mudanças
- [ ] Fluxo automático de análise de mudanças
- [ ] Trigger quando nova versão é adicionada
- [ ] Buscar versão anterior no Supabase
- [ ] Enviar textos para LLM para comparação
- [ ] Processar resposta e extrair resumo/impacto
- [ ] Salvar resultados na tabela `mudancas`
- [ ] Implementar detecção de mudanças significativas

#### ⏳ Aprimoramentos no Backend
- [ ] Implementar cache com Redis ou similar
- [ ] Adicionar logs estruturados
- [ ] Configurar monitoramento de erros
- [ ] Implementar rate limiting
- [ ] Adicionar testes unitários para APIs

## 📋 ETAPA 4: DESENVOLVIMENTO DO FRONTEND

### Frontend com Shadcn/ui (0% iniciada)
- [ ] Instalar componentes Shadcn/ui necessários
  - [ ] Table, Card, Button, Modal, Badge
  - [ ] DataTable para listas grandes
  - [ ] Charts para visualizações
- [ ] Criar página principal (Dashboard)
  - [ ] Layout base com navegação
  - [ ] Lista de normas com paginação
  - [ ] Filtros por órgão/data/status
  - [ ] Cards de estatísticas
  - [ ] Gráficos de atividade
- [ ] Criar página de detalhes da norma
  - [ ] Informações completas da norma
  - [ ] Histórico de versões (timeline)
  - [ ] Lista de mudanças com resumos IA
  - [ ] Comparação visual entre versões
- [ ] Implementar responsividade
- [ ] Configurar temas dark/light
- [ ] Adicionar loading states e error handling

## 🔧 MELHORIAS OPCIONAIS

### Aprimoramentos da Etapa 2 (Opcional)
- [ ] Configurar agendamento automático do workflow N8N
- [ ] Implementar coleta de conteúdo completo das NRs
- [ ] Adicionar coleta de outros tipos de normas
- [ ] Configurar notificações de falha
- [ ] Implementar backup automático dos workflows

### Funcionalidades Avançadas (Futuro)
- [ ] Sistema de notificações para usuários
- [ ] API para integração com sistemas externos  
- [ ] Dashboard administrativo
- [ ] Relatórios customizados
- [ ] Sistema de alertas por email/webhook

## 🎯 PRÓXIMO PASSO IMEDIATO
**Iniciar Etapa 3: Criar primeiro endpoint da API**
1. Criar /api/normas para listar normas
2. Testar conexão API ↔ Supabase
3. Implementar paginação básica

## ✅ ETAPAS CONCLUÍDAS
- [x] **Etapa 1: Configuração da Infraestrutura Básica** - 100% ✅
  - [x] Supabase configurado com 3 tabelas
  - [x] Next.js + TypeScript + Shadcn/ui
  - [x] N8N local instalado e funcional
  - [x] Git configurado e sincronizado

- [x] **Etapa 2: Automação da Coleta de Dados** - 100% ✅
  - [x] Workflow N8N refinado e testado
  - [x] Coleta automática de 38 NRs oficiais
  - [x] Integração perfeita N8N ↔ Supabase
  - [x] Dados filtrados e estruturados
  - [x] Sistema de coleta escalável e confiável

## 🎉 CONQUISTAS PRINCIPAIS
- **Automação completa de coleta** funcionando
- **38 Normas Regulamentadoras** coletadas automaticamente
- **Pipeline de dados** robusto e testado
- **Infraestrutura sólida** para desenvolvimento
- **Base de dados** populada com informações reais

## 📅 Última atualização
Data: ${new Date().toLocaleDateString('pt-BR')}
