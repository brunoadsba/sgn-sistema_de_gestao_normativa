# Variáveis de Ambiente

## Arquivo .env.local (Frontend)

Crie o arquivo `/frontend/.env.local` com as seguintes variáveis:

```env
# Supabase - Configuração pública
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_anonima

# Supabase - Chave de serviço (PRIVADA)
SUPABASE_SERVICE_ROLE_KEY=sua_chave_privada_service_role

# N8N - Configuração (opcional)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/sgn
N8N_API_KEY=sua_chave_n8n
```

## Como obter as chaves Supabase

### 1. Acesse o Dashboard Supabase
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto SGN

### 2. Navegue para Settings > API
- **URL**: copie a "Project URL"
- **Anon Key**: copie a "anon/public" key
- **Service Role**: copie a "service_role" key (⚠️ NUNCA COMMITAR)

## Configuração N8N

### Variáveis N8N
- **Supabase URL**: mesma do frontend
- **Supabase Key**: usar service_role para inserções
- **Webhook URL**: endpoint para receber dados

### Credenciais no N8N
1. Acesse N8N → Credentials
2. Criar "Supabase" credential
3. Adicionar URL e service_role key

## Segurança

### ⚠️ NUNCA COMMITAR:
- `.env.local`
- Chaves service_role
- Credenciais de produção

### ✅ PODE COMMITAR:
- `.env.example` (template sem valores reais)
- Configurações públicas (URLs, nomes de buckets)

## Template .env.example

```env
# Copie este arquivo para .env.local e preencha com valores reais

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_PRIVADA

# N8N (opcional)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/sgn
N8N_API_KEY=SUA_CHAVE_N8N
```

## Verificação

Para testar se as variáveis estão corretas:

```bash
cd frontend
npm run dev
```

Se conectar ao Supabase sem erros, está configurado corretamente.

---

## ✅ **MELHORIAS TÉCNICAS IMPLEMENTADAS (15 de setembro de 2025)**

### **🔧 Novas Variáveis de Ambiente**

#### **1. Dashboard de Conformidade**
```env
# Dashboard de Conformidade (automático)
NEXT_PUBLIC_DASHBOARD_ENABLED=true
NEXT_PUBLIC_CONFORMIDADE_VERSION=v1.0.0
```

#### **2. Terminologia SST**
```env
# Terminologia SST (automático)
NEXT_PUBLIC_SST_TERMINOLOGY=pt-BR
NEXT_PUBLIC_COMPLIANCE_MODE=enterprise
```

#### **3. Cache Next.js**
```env
# Cache Next.js (automático)
NEXT_PUBLIC_CACHE_ENABLED=true
NEXT_PUBLIC_CACHE_VERSION=v1.0.1
```

### **🚀 Configurações Implementadas**

#### **1. Dashboard de Conformidade**
- **Status:** ✅ **IMPLEMENTADO**
- **Interface:** Executiva com KPIs e métricas
- **Funcionalidades:** Oportunidades, avaliações, conformidade

#### **2. Terminologia SST**
- **Status:** ✅ **IMPLEMENTADO**
- **Termos:** Conforme, Não Conforme, Oportunidade de Melhoria
- **Métricas:** Índice de Conformidade, Avaliações, Lacunas

#### **3. Empresas Profissionais**
- **Status:** ✅ **IMPLEMENTADO**
- **Dados:** Construtora BR, Tech BR, Indústrias BR
- **Realismo:** CNPJs e informações corporativas

#### **4. Correções Técnicas**
- **Status:** ✅ **IMPLEMENTADO**
- **React:** Componentes e props corrigidos
- **Cache:** Sistema otimizado
- **Mapeamento:** Dados corretos

### **🧪 Testes de Configuração**

#### **✅ Testes Aprovados:**
1. **Dashboard de Conformidade:** Funcionando
2. **Empresas:** Listagem e detalhes
3. **Terminologia SST:** Adequada
4. **Cache:** Otimizado
5. **Componentes React:** Sem erros

### **📊 Métricas de Configuração**

#### **Antes das Melhorias:**
- ❌ Sem dashboard executivo
- ❌ Terminologia inadequada
- ❌ Erros de React
- ❌ Cache problemático
- ❌ Dados inconsistentes

#### **Depois das Melhorias:**
- ✅ Dashboard executivo funcional
- ✅ Terminologia SST profissional
- ✅ Componentes React corrigidos
- ✅ Cache otimizado
- ✅ Dados consistentes
- ✅ Configuração enterprise-grade

### **🎯 Próximos Passos de Configuração**

#### **1. Sistema de Alertas**
- Alertas básicos para conformidade
- Notificações de oportunidades

#### **2. Validação Zod**
- Schemas para APIs
- Validação robusta

#### **3. Testes Automatizados**
- Testes unitários
- Testes de integração

---

**Environment Guide atualizado em:** 15 de setembro de 2025  
**Status:** 🚀 **Enterprise Environment Configuration + Dashboard de Conformidade + Terminologia SST Profissional**  
**Capacidade:** Configuração profissional com dashboard executivo, terminologia adequada e funcionalidades avançadas