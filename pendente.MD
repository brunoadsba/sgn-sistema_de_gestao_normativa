# SGN - Tarefas Pendentes

## 🔄 PRÓXIMA ETAPA

### Etapa 2: Automação da Coleta de Dados
- [ ] Desenvolver fluxo de scraping no N8N
  - [ ] Configurar nó de HTTP Request para sites oficiais
  - [ ] Configurar extração de dados (código, título, órgão, conteúdo)
  - [ ] Configurar parsing de HTML/XML
- [ ] Integrar N8N com Supabase
  - [ ] Adicionar nó do Supabase no workflow
  - [ ] Configurar inserção de dados na tabela `normas`
  - [ ] Configurar inserção de dados na tabela `versoes`
- [ ] Configurar lógica de identificação
  - [ ] Identificar se norma é nova ou atualização
  - [ ] Implementar versionamento automático
- [ ] Configurar agendamento de execução
  - [ ] Definir frequência de coleta (diária, semanal)
  - [ ] Configurar triggers automáticos
- [ ] Testar fluxo de coleta automatizada

### Etapa 3: Desenvolvimento do Backend e IA
- [ ] Criar API Routes no Next.js
  - [ ] Endpoint GET /api/normas (listar todas as normas)
  - [ ] Endpoint GET /api/normas/[id] (detalhes de norma específica)
  - [ ] Endpoint GET /api/normas/[id]/versoes (histórico de versões)
  - [ ] Endpoint GET /api/normas/[id]/mudancas (mudanças identificadas)
- [ ] Integração com LLM (Modelo de Linguagem)
  - [ ] Escolher provedor LLM (OpenAI, Anthropic, local)
  - [ ] Configurar chaves de API
  - [ ] Criar prompt para comparação de versões
- [ ] Fluxo automático de análise de mudanças
  - [ ] Trigger quando nova versão é adicionada
  - [ ] Buscar versão anterior no Supabase
  - [ ] Enviar textos para LLM
  - [ ] Processar resposta e extrair resumo/impacto
  - [ ] Salvar na tabela `mudancas`

### Etapa 4: Desenvolvimento do Frontend
- [ ] Instalar componentes Shadcn/ui necessários
  - [ ] Table, Card, Button, Modal, Badge
  - [ ] DataTable para listas grandes
- [ ] Criar página principal (Dashboard)
  - [ ] Layout base com navegação
  - [ ] Lista de normas com paginação
  - [ ] Filtros por órgão/data
  - [ ] Cards de estatísticas
- [ ] Criar página de detalhes da norma
  - [ ] Informações completas da norma
  - [ ] Histórico de versões (timeline)
  - [ ] Lista de mudanças com resumos IA
  - [ ] Comparação entre versões
- [ ] Implementar responsividade
- [ ] Configurar temas dark/light

## 🎯 PRÓXIMO PASSO IMEDIATO
**Iniciar Etapa 2: Configurar primeiro workflow no N8N**
1. Criar novo workflow de coleta
2. Configurar fonte de dados (site oficial)
3. Testar extração básica de informações

## ✅ ETAPAS CONCLUÍDAS
- [x] **Etapa 1: Configuração da Infraestrutura Básica** - 100% ✅
  - [x] Supabase configurado
  - [x] Banco de dados criado
  - [x] Next.js + TypeScript + Shadcn/ui
  - [x] N8N local instalado
  - [x] Git configurado

## 📅 Última atualização
Data: ${new Date().toLocaleDateString('pt-BR')}
