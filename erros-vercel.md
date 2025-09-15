# 🚨 Erros Enfrentados no Deploy Vercel

## 📋 Resumo dos Problemas

### **1. Dependências TypeScript Ausentes**
**Erro:** `It looks like you're trying to use TypeScript but do not have the required package(s) installed`

**Causa:** Projeto usa TypeScript mas não tem as dependências instaladas no `package.json`

**Tentativas de Solução:**
- ✅ Instalar `typescript`, `@types/react`, `@types/node`, `eslint`
- ❌ Vercel executa `npm install` duas vezes e perde as dependências na segunda execução

### **2. ESLint Ausente**
**Erro:** `ESLint must be installed in order to run during builds`

**Causa:** Next.js tenta executar ESLint durante o build mas não encontra a dependência

**Tentativas de Solução:**
- ✅ Instalar `eslint` e `eslint-config-next`
- ❌ Mesmo problema de dupla execução do npm install

### **3. Configuração de Workspace**
**Erro:** Vercel detecta como monorepo e tenta instalar dependências na raiz

**Causa:** Estrutura de projeto com subdiretório `frontend/`

**Tentativas de Solução:**
- ✅ Criar `package.json` na raiz com workspaces
- ❌ Conflito com `package-lock.json` e `npm ci`

### **4. Dupla Execução de npm install**
**Problema Crítico:** Vercel executa `npm install` duas vezes:
1. Primeira execução: Instala dependências corretamente
2. Segunda execução: Não encontra as dependências instaladas

**Logs Evidenciando:**
```
[21:18:39.801] Running "install" command: `cd frontend && npm install`...
[21:18:54.215] added 518 packages, and audited 519 packages in 14s
[21:18:54.280] Running "cd frontend && npm install && npm run build"
[21:18:55.461] up to date, audited 251 packages in 1s
```

### **5. Configuração next.config.js Ineficaz**
**Tentativa:** Desabilitar ESLint e TypeScript checking
**Resultado:** ❌ Não resolve o problema da dupla execução

### **6. Erros Next.js 15 (Atualização)**
**Erro:** `searchParams` deve ser `await`
**Problema:** Next.js 15 mudou o comportamento do `searchParams`
**Solução Aplicada:**
```typescript
// Antes (Next.js 14)
export default function Page({ searchParams }: { searchParams?: SearchParams }) {
  const page = Number(searchParams?.page) || 1
}

// Agora (Next.js 15)
export default async function Page({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = await searchParams
  const page = Number(params?.page) || 1
}
```

### **7. Service Worker Cache Inválido**
**Erro:** `"Unable to add filesystem: <illegal path>"`
**Problema:** URLs inválidas sendo adicionadas ao cache
**Solução Aplicada:**
```javascript
// Validar URLs antes de cachear
const CRITICAL_ASSETS = [
  '/',
  '/normas',
  '/empresas'
]
```

## 🔍 Análise Técnica

### **Root Cause Analysis:**
O problema principal é que o Vercel está executando o comando de instalação duas vezes:
1. **Install Command**: `cd frontend && npm install`
2. **Build Command**: `cd frontend && npm install && npm run build`

Na segunda execução, o `npm install` não encontra as dependências que foram instaladas na primeira execução, possivelmente devido a:
- Isolamento de containers entre comandos
- Cache de dependências não persistente
- Configuração incorreta do workspace

### **Configurações Testadas:**
1. **vercel.json básico** - ❌ Falhou
2. **vercel.json com npm ci** - ❌ Falhou (sem package-lock.json)
3. **Workspace com package.json na raiz** - ❌ Piorou
4. **next.config.js ignorando erros** - ❌ Não resolveu
5. **vercel.json com installCommand customizado** - ❌ Falhou
6. **Configuração de buildCommand específico** - ❌ Falhou
7. **Desabilitar ESLint e TypeScript checking** - ❌ Não resolveu
8. **Usar npm ci em vez de npm install** - ❌ Falhou
9. **Configuração de cache de dependências** - ❌ Falhou
10. **Build local + deploy manual** - ⚠️ Parcialmente funcional
11. **Configuração de monorepo com workspaces** - ❌ Piorou
12. **Deploy direto do diretório frontend** - ❌ Falhou

## 💡 Soluções Propostas

### **Solução 1: Migrar para Netlify** ⭐ **RECOMENDADA**
- Melhor suporte a projetos com subdiretórios
- Configuração `netlify.toml` já criada
- Deploy mais confiável e previsível
- **Status:** ✅ Configuração pronta para teste

### **Solução 2: Reestruturar Projeto**
- Mover arquivos do `frontend/` para a raiz
- Eliminar subdiretório para simplificar deploy
- **Status:** ⚠️ Requer refatoração significativa

### **Solução 3: Deploy Manual**
- Fazer build local e deploy do `.next` compilado
- Bypass completo do processo de build do Vercel
- **Status:** ⚠️ Parcialmente funcional, mas não escalável

### **Solução 4: Usar Outra Plataforma**
- Railway (deploy direto do GitHub)
- Render (alternativa ao Vercel)
- **Status:** 🔄 Não testado ainda

### **Solução 5: Configuração Avançada Vercel**
- Usar `vercel.json` com configurações específicas de workspace
- Configurar build hooks customizados
- **Status:** ❌ Todas as tentativas falharam

## 📊 Status Atual

- **Tentativas:** 12+ configurações diferentes
- **Tempo Investido:** ~4 horas
- **Resultado:** ❌ Deploy ainda falha
- **Próximo Passo:** Migrar para Netlify ou reestruturar projeto

## 🎯 Recomendação Final

Para um **MVP sem custos**, recomendo:

1. **⭐ MIGRAR PARA NETLIFY** - Solução mais viável
   - Configuração `netlify.toml` já pronta
   - Melhor suporte a projetos com subdiretórios
   - Deploy mais confiável e previsível
   - **Próximo passo:** Testar deploy no Netlify

2. **Considerar Railway** - Alternativa secundária
   - Deploy direto do GitHub
   - Configuração mais simples

3. **Abandonar Vercel** - Não recomendado
   - Múltiplas tentativas falharam
   - Problema estrutural com workspace
   - Tempo investido sem retorno

---

**Data:** 15/01/2025  
**Projeto:** SGN - Sistema de Gestão Normativa  
**Plataforma:** Vercel  
**Status:** ❌ Falhou após múltiplas tentativas  
**Última Atualização:** Adicionados erros Next.js 15 e Service Worker
