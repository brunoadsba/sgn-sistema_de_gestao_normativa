# 🚀 Deploy do SGN - Sistema de Gestão Normativa

## Arquitetura de Deploy

### **Frontend (Vercel)**
- **Framework**: Next.js
- **URL**: `seu-projeto.vercel.app`
- **Deploy**: Automático via GitHub

### **n8n (Render)**
- **Serviço**: Workflow automation
- **URL**: `seu-projeto.onrender.com`
- **Deploy**: Automático via GitHub

### **Supabase**
- **Banco**: PostgreSQL
- **URL**: `kqdilsmgjlgmqcoubpel.supabase.co`
- **Status**: Já configurado

## Como Fazer Deploy

### 1. Frontend no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Importe o repositório
4. Configure:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. n8n no Render
1. Acesse [render.com](https://render.com)
2. Conecte sua conta GitHub
3. Crie novo Web Service
4. Configure:
   - Repository: Seu repositório
   - Build Command: `npm install -g n8n`
   - Start Command: `n8n start`
   - Environment Variables: (ver render.yaml)

## Resultado Final

✅ **Sistema 100% na nuvem**
✅ **Zero custos**
✅ **Funcionamento 24/7**
✅ **Deploy automático**
✅ **Apresentação profissional**
