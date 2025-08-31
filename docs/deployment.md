# Guia de Deploy

## Pré-requisitos

- Conta no Vercel
- Projeto no Supabase configurado
- N8N rodando (local ou cloud)
- Node.js 20+

## Deploy no Vercel

### 1. Configuração inicial
```bash
npm install -g vercel
vercel login
```

### 2. Deploy do frontend
```bash
cd frontend
vercel --prod
```

### 3. Variáveis de ambiente no Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Configuração Supabase

### 1. Banco de dados
- Executar scripts SQL das tabelas (ver `docs/runbooks/agente.md`)
- Configurar RLS policies
- Popular tabelas iniciais

### 2. Storage
- Criar bucket `documentos-empresa`
- Configurar policies de acesso

### 3. Auth (opcional para futuro)
- Configurar providers de autenticação
- Configurar redirect URLs

## Setup N8N

### Local
```bash
npm install -g n8n
n8n start
```

### Cloud
- Configurar webhook endpoints
- Agendar execução de workflows
- Conectar com Supabase

## Monitoramento

- Logs do Vercel
- Métricas do Supabase
- Status do N8N

## Troubleshooting

### Erro de conexão Supabase
- Verificar variáveis de ambiente
- Confirmar URLs e chaves

### Falha no N8N
- Verificar credenciais Supabase
- Testar conectividade manual
