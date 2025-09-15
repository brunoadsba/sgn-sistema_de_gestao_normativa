# 🔧 PREPARAÇÃO TÉCNICA - PROJETO PILOTO

## 📋 **OBJETIVO**

Estabilizar o sistema SGN para suportar o projeto piloto sem custos adicionais.  
**Prazo**: Semanas 1-2  
**Tempo estimado**: 20-30 horas  
**Status**: Dashboard de Conformidade implementado + Terminologia SST profissional  

---

## 🚨 **CORREÇÕES CRÍTICAS (Semana 1)**

### **1.1 Erro do Tailwind (5 minutos)**
```bash
# Problema atual em tailwind.config.ts:
plugins: [require("tailwindcss-animate")],

# Solução:
import tailwindcssAnimate from "tailwindcss-animate";
plugins: [tailwindcssAnimate],
```

**Arquivo**: `frontend/tailwind.config.ts`  
**Impacto**: Build falha com erro de ESLint  
**Prioridade**: CRÍTICA  

### **1.2 Variáveis Não Utilizadas (2 horas)**
```bash
# Limpar em:
- frontend/src/app/normas/page.tsx (linhas 20, 84)
- frontend/public/sw.js (linhas 14, 29)

# Remover:
- 'NormasResponse' is defined but never used
- 'total' is defined but never used
- 'page' is defined but never used
- 'API_ROUTES' is assigned a value but never used
- 'error' is defined but never used
```

**Impacto**: Código desnecessário, bundle size maior  
**Prioridade**: ALTA  

### **1.3 Health Check Robusto (3 horas)**
```typescript
// Melhorar /api/health com:
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Verificar conexão com banco
    const { data, error } = await supabase
      .from('normas')
      .select('id')
      .limit(1);

    if (error) {
      logger.error({ error }, 'Health check falhou: erro no banco');
      return Response.json({ 
        status: 'error', 
        message: 'API não está saudável - erro no banco',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    return Response.json({
      status: 'ok',
      message: 'API está saudável',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        api: 'ok'
      }
    });
  } catch (error) {
    logger.error({ error }, 'Health check falhou: erro interno');
    return Response.json({ 
      status: 'error', 
      message: 'API não está saudável - erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
```

**Arquivo**: `frontend/src/app/api/health/route.ts`  
**Impacto**: Monitoramento básico do sistema  
**Prioridade**: ALTA  

---

## ✅ **FUNCIONALIDADES ESSENCIAIS (Semana 1-2)**

### **2.1 Dashboard Funcional para Empresas (5 horas)**
```typescript
// Verificar se estas funcionalidades estão funcionando:
- Listagem de empresas
- Upload de documentos
- Visualização de análises
- Métricas básicas
```

**Arquivos**: `frontend/src/app/empresas/[id]/conformidade/page.tsx`  
**Status**: Verificar se está funcionando  

### **2.2 Upload de Documentos Básico (3 horas)**
```typescript
// Testar endpoint:
POST /api/empresas/[id]/documentos

// Verificar:
- Upload de PDF, DOC, DOCX
- Armazenamento no Supabase Storage
- Metadados salvos corretamente
```

**Arquivos**: `frontend/src/app/api/empresas/[id]/documentos/route.ts`  
**Status**: Implementado, testar funcionamento  

### **2.3 Análise Simples (8 horas)**
```typescript
// Implementar análise básica sem IA:
function analisarDocumento(documento: string, norma: string) {
  // Comparação de palavras-chave
  // Identificação de seções obrigatórias
  // Score simples (0-100)
  // Gaps básicos identificados
}
```

**Arquivo**: Criar `frontend/src/lib/analise-basica.ts`  
**Status**: A implementar  

### **2.4 Relatório Básico HTML (4 horas)**
```typescript
// Gerar relatório em HTML (não PDF ainda):
function gerarRelatorio(empresa: Empresa, analises: Analise[]) {
  return `
    <html>
      <head><title>Relatório de Conformidade - ${empresa.nome}</title></head>
      <body>
        <h1>Relatório de Conformidade</h1>
        <h2>${empresa.nome}</h2>
        <div class="analises">
          ${analises.map(analise => `
            <div class="analise">
              <h3>${analise.norma.codigo}</h3>
              <p>Score: ${analise.score}/100</p>
              <p>Gaps: ${analise.gaps.join(', ')}</p>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;
}
```

**Arquivo**: Criar `frontend/src/lib/relatorio-html.ts`  
**Status**: A implementar  

---

## 🧪 **TESTES BÁSICOS (Semana 2)**

### **3.1 Testes Manuais (5 horas)**
```bash
# Fluxo completo a testar:
1. Acessar dashboard principal
2. Navegar para empresas
3. Criar nova empresa
4. Fazer upload de documento
5. Executar análise
6. Visualizar relatório
7. Verificar métricas
```

### **3.2 Testes de Carga (2 horas)**
```bash
# Testar com:
- 5 empresas simuladas
- 10 documentos por empresa
- Análises simultâneas
- Verificar performance
```

### **3.3 Testes de Navegadores (3 horas)**
```bash
# Testar em:
- Chrome (desktop)
- Firefox (desktop)
- Safari (desktop)
- Chrome Mobile
- Safari Mobile
```

---

## 📊 **MONITORAMENTO BÁSICO**

### **4.1 Logs Estruturados (2 horas)**
```typescript
// Verificar se Pino está funcionando:
import { logger } from '@/utils/logger';

// Em todas as APIs, usar:
logger.info('Operação realizada', { empresaId, documentoId });
logger.error('Erro na operação', { error, contexto });
```

### **4.2 Métricas Básicas (1 hora)**
```typescript
// Endpoint para métricas do piloto:
GET /api/piloto/metricas

// Retornar:
- Total de empresas
- Total de documentos
- Total de análises
- Última atividade
```

---

## ✅ **CHECKLIST DE PREPARAÇÃO**

### **Semana 1**
- [ ] Corrigir erro do Tailwind
- [ ] Remover variáveis não utilizadas
- [ ] Melhorar health check
- [ ] Testar upload de documentos
- [ ] Verificar dashboard de empresas

### **Semana 2**
- [ ] Implementar análise básica
- [ ] Criar relatório HTML
- [ ] Testes manuais completos
- [ ] Testes de navegadores
- [ ] Configurar monitoramento básico

### **Validação Final**
- [ ] Sistema estável sem erros críticos
- [ ] Todas as funcionalidades principais funcionando
- [ ] Interface responsiva
- [ ] Performance aceitável (< 3s)
- [ ] Pronto para demonstrações

---

## 🚀 **COMANDOS ÚTEIS**

### **Desenvolvimento**
```bash
# Iniciar desenvolvimento
cd frontend
npm run dev

# Build de produção
npm run build

# Verificar erros
npm run lint

# Testar APIs
curl http://localhost:3001/api/health
curl http://localhost:3001/api/normas/stats
```

### **Deploy**
```bash
# Deploy no Vercel
vercel --prod

# Verificar logs
vercel logs

# Monitorar performance
vercel analytics
```

---

## 📋 **PRÓXIMOS PASSOS**

1. **Executar** correções críticas (Semana 1)
2. **Implementar** funcionalidades essenciais
3. **Testar** completamente o sistema
4. **Preparar** para demonstrações

**Meta**: Sistema estável e pronto para o piloto em 2 semanas!
