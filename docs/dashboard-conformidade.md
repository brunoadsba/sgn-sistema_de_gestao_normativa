# Dashboard de Conformidade - SGN

## Visão Geral

O Dashboard de Conformidade é uma funcionalidade empresarial do SGN que permite monitorar e gerenciar a conformidade de empresas com as Normas Regulamentadoras (NRs) do Ministério do Trabalho.

## Funcionalidades

### 🎯 Resumo Executivo
- **Índice de Conformidade**: Percentual de conformidade geral da empresa
- **Total de Oportunidades de Melhoria**: Número de lacunas identificadas
- **Documentos Avaliados**: Quantidade de documentos analisados

### 📊 KPIs Detalhados
- **Total de Avaliações Realizadas**: Número total de análises executadas
- **Em Andamento**: Avaliações em processo
- **Concluídas**: Avaliações finalizadas com sucesso
- **Não Conformes**: Avaliações que falharam
- **Pendentes**: Avaliações aguardando processamento
- **Oportunidades de Melhoria**: Lacunas identificadas
- **Documentos Avaliados**: Documentos processados
- **Índice de Conformidade (%)**: Score geral de conformidade

### 📋 Seções de Análise
- **Oportunidades de Melhoria Identificadas**: Lacunas de conformidade
- **Avaliações Recentes**: Status das análises mais recentes

## Terminologia SST

O sistema utiliza terminologia adequada para a área de Segurança do Trabalho:

### Status de Conformidade
- **Conforme**: Atende completamente aos requisitos
- **Não Conforme**: Não atende aos requisitos
- **Oportunidade de Melhoria**: Pode ser melhorado (substitui "parcial conforme")

### Termos Técnicos
- **Índice de Conformidade** (em vez de "Score")
- **Avaliações** (em vez de "Jobs")
- **Lacunas** (em vez de "Gaps")
- **Documentos Avaliados** (em vez de "Analisados")

## Empresas Cadastradas

### Construtora BR
- **ID**: `9feb8d42-d560-4465-95c6-ad31e6aeb387`
- **Setor**: Construção Civil
- **CNPJ**: 98.765.432/0001-10
- **Índice de Conformidade**: 87%
- **Documentos**: PGR, PCMSO, LTCAT, Manual de Segurança

### Tech BR
- **ID**: `3a984213-10b0-489b-8af7-054df3525b20`
- **Setor**: Tecnologia
- **CNPJ**: 12.345.678/0001-90

### Indústrias BR
- **ID**: `3b0fb367-8ecb-43a5-8421-5b27a7f1716f`
- **Setor**: Indústria
- **CNPJ**: 34.567.890/0001-23

## APIs Disponíveis

### GET /api/conformidade/dashboard/[empresaId]
Retorna dados completos do dashboard de conformidade para uma empresa específica.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "empresa": {
      "id": "uuid",
      "nome": "Nome da Empresa",
      "cnpj": "CNPJ",
      "setor": "Setor",
      "porte": "Porte"
    },
    "resumo_executivo": {
      "score_geral_medio": 87,
      "total_analises": 2,
      "total_gaps": 6,
      "gaps_criticos_pendentes": 1,
      "taxa_resolucao_gaps": 33,
      "risco_predominante": "baixo"
    },
    "processamento": {
      "total_jobs": 4,
      "jobs_pendentes": 1,
      "jobs_processando": 0,
      "jobs_completos": 2,
      "jobs_falharam": 0,
      "taxa_sucesso_percentual": 50
    },
    "conformidade": {
      "total_analises": 2,
      "score_medio": 87,
      "distribuicao_status": {
        "conforme": 2,
        "nao_conforme": 0,
        "parcial_conforme": 0
      }
    },
    "gaps": {
      "total": 6,
      "resolvidos": 2,
      "pendentes": 4,
      "taxa_resolucao_percentual": 33
    },
    "documentos": {
      "total": 4,
      "por_tipo": {
        "manual": 2,
        "politica": 1,
        "procedimento": 1
      }
    }
  }
}
```

### GET /api/empresas
Retorna lista de empresas com paginação e busca.

**Parâmetros:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)
- `search`: Termo de busca (nome da empresa)

## Acesso

### URLs
- **Lista de Empresas**: `http://localhost:3001/empresas`
- **Dashboard Construtora BR**: `http://localhost:3001/empresas/9feb8d42-d560-4465-95c6-ad31e6aeb387/conformidade`

### Navegação
1. Acesse a lista de empresas
2. Clique em "Conformidade" na empresa desejada
3. Visualize o dashboard completo

## Correções Técnicas Implementadas

### Erros Resolvidos
- **Dashboard de Conformidade**: Implementado com dados reais e profissionais
- **Terminologia SST**: Adequada para área de Segurança do Trabalho
- **Correções React**: Suspense e Button asChild corrigidos
- **Cache Next.js**: Otimizado para dados em tempo real
- **Mapeamento de dados**: API → Frontend corrigido

### Melhorias de Performance
- Dashboard executivo funcional
- Terminologia SST profissional
- Componentes React corrigidos
- Cache otimizado para dados em tempo real
- Dados consistentes e profissionais

## Dados de Exemplo

### Construtora BR - Dados Profissionais
- **4 avaliações**: 2 concluídas, 1 pendente, 1 em andamento
- **6 lacunas**: 1 Não Conforme, 5 Oportunidades de Melhoria
- **4 documentos**: PGR, PCMSO, LTCAT, Manual de Segurança
- **87% de conformidade**: Bom nível de conformidade

### Documentos Típicos
- **PGR**: Programa de Gerenciamento de Riscos
- **PCMSO**: Programa de Controle Médico de Saúde Ocupacional
- **LTCAT**: Laudo Técnico das Condições Ambientais de Trabalho
- **Manual de Segurança**: Procedimentos de segurança

## Próximos Passos

1. **Implementar validação Zod** nas APIs existentes
2. **Adicionar testes automatizados** para componentes
3. **Implementar sistema de alertas** para não conformidades
4. **Adicionar relatórios em PDF** do dashboard
5. **Implementar notificações** por email/SMS

## Suporte

Para dúvidas ou problemas com o Dashboard de Conformidade:
1. Verifique se o servidor está rodando na porta 3001
2. Confirme se as APIs estão respondendo
3. Verifique os logs do console para erros
4. Consulte a documentação de APIs em `docs/api.md`
