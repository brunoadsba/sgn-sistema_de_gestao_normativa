# 🚀 Guia Completo de Deploy na Vercel - SGN

## ✅ Status Atual

**PROJETO REESTRUTURADO COM SUCESSO!** 

- ✅ Estrutura Next.js padrão implementada
- ✅ Build funcionando sem erros
- ✅ Configurações otimizadas para Vercel
- ✅ Dependências problemáticas removidas
- ✅ Código commitado e enviado para GitHub

## 📋 Próximos Passos para Deploy

### 1. Conectar Repositório à Vercel

1. **Acesse:** https://vercel.com/
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Selecione o repositório:** `sgn-sistema_de_gestao_normativa`
5. **Selecione a branch:** `feaure/deploy-vercel-reestruturacao`

### 2. Configurações de Deploy

**Framework Preset:** Next.js (será detectado automaticamente)
**Root Directory:** `.` (raiz do projeto)
**Build Command:** `npm run build` (já configurado)
**Output Directory:** `.next` (já configurado)
**Install Command:** `npm ci` (já configurado)

### 3. Variáveis de Ambiente Obrigatórias

Configure estas variáveis na Vercel (Settings > Environment Variables):

```bash
# Supabase (OBRIGATÓRIAS)
NEXT_PUBLIC_SUPABASE_URL=https://kqdilsmgjlgmqcoubpel.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_supabase_aqui

# GROQ AI (OBRIGATÓRIA)
GROQ_API_KEY=sua_chave_groq_aqui

# N8N (OPCIONAL - para desenvolvimento)
NEXT_PUBLIC_N8N_WEBHOOK_COLETA_MTE=https://seu-n8n-render.onrender.com/webhook/mte/coleta
```

### 4. Deploy Automático

Após configurar:
1. **Clique em "Deploy"**
2. **Aguarde o build** (2-3 minutos)
3. **Acesse a URL gerada** pela Vercel

## 🔧 Configurações Avançadas (Opcional)

### Domínio Personalizado
- Settings > Domains
- Adicione seu domínio personalizado

### Analytics
- Analytics > Enable Vercel Analytics
- Monitoramento de performance gratuito

### Otimizações de Performance
- Functions > Configure function regions
- Edge Functions para melhor performance global

## 🚨 Resolução de Problemas

### Se o Deploy Falhar:

1. **Verifique as variáveis de ambiente**
2. **Confira os logs de build na Vercel**
3. **Teste o build local:** `npm run build`

### Erros Comuns:

**"Module not found"**
- Verifique se todas as dependências estão no package.json
- Execute: `npm install`

**"Build failed"**
- Verifique os logs detalhados na Vercel
- Teste localmente: `npm run build`

**"API routes not working"**
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se o Supabase está acessível

## 📊 Métricas de Sucesso

Após o deploy, verifique:

- ✅ **Site carregando:** URL da Vercel acessível
- ✅ **Dashboard funcionando:** Página inicial com dados
- ✅ **APIs respondendo:** /api/health retorna status OK
- ✅ **IA funcionando:** Teste de análise de conformidade
- ✅ **Performance:** Lighthouse Score > 90

## 🎯 URLs Importantes

Após o deploy, você terá:

- **Site Principal:** `https://seu-projeto.vercel.app`
- **API Health Check:** `https://seu-projeto.vercel.app/api/health`
- **Dashboard:** `https://seu-projeto.vercel.app/empresas`
- **Teste IA:** `https://seu-projeto.vercel.app/teste-ia`

## 🔄 Deploy Contínuo

Configurado automaticamente:
- **Push para branch** → Deploy automático
- **Pull Request** → Preview deploy
- **Merge para main** → Deploy de produção

## 📞 Suporte

Se encontrar problemas:
1. Verifique este guia
2. Consulte logs da Vercel
3. Teste build local
4. Verifique variáveis de ambiente

---

**🎉 PARABÉNS! Seu projeto SGN está pronto para produção na Vercel!**

