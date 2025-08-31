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
