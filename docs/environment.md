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

## ✅ **MELHORIAS TÉCNICAS IMPLEMENTADAS (1º de setembro de 2025)**

### **🔧 Novas Variáveis de Ambiente**

#### **1. Logging Estruturado**
```env
# Logging - Pino (opcional)
LOG_LEVEL=info
LOG_FORMAT=json
```

#### **2. Health Check**
```env
# Health Check (automático)
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
```

#### **3. Service Worker**
```env
# Service Worker (automático)
NEXT_PUBLIC_SW_ENABLED=true
NEXT_PUBLIC_CACHE_VERSION=v1.0.1
```

### **🚀 Configurações Implementadas**

#### **1. Validação Zod**
- **Status:** ✅ **IMPLEMENTADO**
- **Schemas:** Empresas e normas
- **Validação:** Entrada de dados robusta

#### **2. Logging Pino**
- **Status:** ✅ **IMPLEMENTADO**
- **Formato:** JSON estruturado
- **Níveis:** debug, info, warn, error

#### **3. Health Check Endpoint**
- **Status:** ✅ **IMPLEMENTADO**
- **Endpoint:** `/api/health`
- **Monitoramento:** Serviços em tempo real

#### **4. Service Worker Otimizado**
- **Status:** ✅ **IMPLEMENTADO**
- **Cache:** Estratégia simplificada
- **Performance:** Otimizado

### **🧪 Testes de Configuração**

#### **✅ Testes Aprovados:**
1. **Variáveis:** Todas carregadas corretamente
2. **Supabase:** Conexão estável
3. **Health Check:** Funcionando
4. **Service Worker:** Cache otimizado
5. **Logs:** Estruturados

### ** Métricas de Configuração**

#### **Antes das Melhorias:**
- ❌ Logging básico
- ❌ Zero health check
- ❌ Service Worker problemático
- ❌ Validação inadequada

#### **Depois das Melhorias:**
- ✅ Logging estruturado
- ✅ Health check funcional
- ✅ Service Worker otimizado
- ✅ Validação robusta
- ✅ Configuração enterprise-grade

### **🎯 Próximos Passos de Configuração**

#### **1. Monitoramento Avançado**
- Integração com serviços de log
- Métricas de performance
- Alertas automáticos

#### **2. Validação Avançada**
- Schemas para todas as APIs
- Validação de entrada robusta
- Tratamento de erros estruturado

#### **3. Cache Avançado**
- Redis para cache distribuído
- Cache de consultas
- Otimização de performance

---

**Environment Guide atualizado em:** 1º de setembro de 2025  
**Status:** 🚀 **Enterprise Environment Configuration + Melhorias Técnicas Implementadas**  
**Capacidade:** Configuração profissional com monitoramento, validação e qualidade enterprise-grade
