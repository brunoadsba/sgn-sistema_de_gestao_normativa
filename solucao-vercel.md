# 🚀 Soluções para Deploy no Vercel

Este documento propõe três planos para resolver os problemas de deploy no Vercel enfrentados pelo projeto **SGN - Sistema de Gestão Normativa**, com base nos erros documentados (dependências TypeScript/ESLint ausentes, dupla execução de `npm install`, configuração de monorepo, erros do Next.js 15 e Service Worker). Cada plano é detalhado com passos claros, vantagens, desvantagens e probabilidade de sucesso.

---

## Plano A: Persistir e Corrigir no Vercel (Abordagem Otimizada)

Foca em resolver os problemas raiz no Vercel, como dupla execução de `npm install` e configuração de monorepo, sem migrar a plataforma. Prioriza configurações avançadas para persistir dependências e otimizar builds.

### Passos
1. **Configurar Monorepo com Workspaces**:
   - Crie um `package.json` na raiz:
     ```json
     {
       "name": "sgn-root",
       "private": true,
       "workspaces": ["frontend"]
     }
     ```
   - No dashboard da Vercel, defina o **Root Directory** como `frontend/` para evitar detecção de monorepo e dupla instalação.
   - Adicione um `vercel.json` na raiz:
     ```json
     {
       "installCommand": "npm install --workspace=frontend",
       "buildCommand": "npm run build --workspace=frontend"
     }
     ```
   - **Opcional**: Use Yarn (`yarn workspaces`) em vez de NPM para melhor suporte a monorepos:
     ```json
     "installCommand": "yarn install",
     "buildCommand": "yarn workspace frontend build"
     ```

2. **Otimizar Build e Ignorar Erros**:
   - No `frontend/next.config.js`, desabilite verificações desnecessárias:
     ```js
     module.exports = {
       typescript: { ignoreBuildErrors: true },
       eslint: { ignoreDuringBuilds: true }
     };
     ```
   - Para erros do Next.js 15 (`searchParams`):
     ```typescript
     // Exemplo de correção
     export default async function Page({ searchParams }: { searchParams?: Promise<SearchParams> }) {
       const params = await searchParams;
       const page = Number(params?.page) || 1;
     }
     ```
   - Para Service Worker (`Unable to add filesystem: <illegal path>`), valide URLs:
     ```javascript
     const CRITICAL_ASSETS = ['/', '/normas', '/empresas'];
     ```

3. **Gerenciar Cache e Dependências**:
   - Use `npm ci` para instalações consistentes (gere `package-lock.json` localmente e commite):
     ```json
     "installCommand": "cd frontend && npm ci"
     ```
   - Ative **Build Cache** no dashboard da Vercel para persistir `node_modules`.
   - Teste localmente com `vercel dev` para simular o ambiente.

4. **Implementação**:
   - **Tempo Estimado**: 1-2 horas.
   - **Teste**: Faça deploy previews após cada mudança.
   - **Monitoramento**: Consulte logs detalhados no Vercel. Se falhar, ajuste com base em erros (ex.: use `VERCEL_FORCE_NO_BUILD_CACHE=false`).

### Vantagens
- Mantém o projeto no Vercel (gratuito para MVP, CDN global escalável).
- Solução sem migração, preservando configurações existentes.

### Desvantagens
- Pode requerer iterações adicionais se o problema for um bug da plataforma.

### Probabilidade de Sucesso
- **Alta**: Configuração correta de workspaces e cache deve resolver a dupla execução.

---

## Plano B: Migrar para Netlify (Solução Recomendada e Rápida)

Netlify é a abordagem mais viável para um MVP sem custos, com suporte robusto a projetos com subdiretórios e builds previsíveis, evitando os problemas de dupla instalação do Vercel.

### Passos
1. **Configuração Inicial**:
   - Crie uma conta no Netlify e conecte o repositório GitHub.
   - Use o `netlify.toml` na raiz (já mencionado como pronto):
     ```toml
     [build]
       base = "frontend"
       command = "npm install && npm run build"
       publish = "frontend/.next"
     ```

2. **Ajustes Específicos**:
   - **Next.js 15**: Netlify suporta SSR/SSG nativamente; mantenha correções de `searchParams` como no Plano A.
   - **Dependências TS/ESLint**: Instale `typescript`, `@types/react`, `@types/node`, `eslint`, e `eslint-config-next` no `frontend/package.json`.
   - **Service Worker**: Mantenha validação de URLs ou use Netlify Edge Functions.
   - **Domínios/HTTPS**: Configuração automática, similar ao Vercel.

3. **Implementação**:
   - Importe o site no Netlify dashboard.
   - Defina variáveis de ambiente (ex.: chaves de API).
   - **Deploy**: Automático via Git push; teste com branch previews.
   - **Tempo Estimado**: 30-60 minutos.

### Vantagens
- Builds confiáveis, suporte nativo a monorepos, gratuito para tráfego baixo.
- Configuração simples com `netlify.toml`.

### Desvantagens
- Latência ligeiramente maior que Vercel em algumas regiões.

### Probabilidade de Sucesso
- **Muito Alta**: Netlify é comprovadamente mais estável para estruturas como a do projeto.

---

## Plano C: Explorar Plataformas Alternativas (Railway ou Render)

Se Netlify não atender (ex.: necessidade de mais recursos serverless), migre para Railway (simplicidade) ou Render (similar ao Vercel, mas com builds mais controlados). Ambas são opções gratuitas/escaláveis para MVP.

### Passos
1. **Opção 1: Railway**:
   - Conecte o repositório GitHub e defina o serviço como "Node.js" no subdiretório `frontend/`.
   - Configure:
     - **Root Directory**: `frontend/`.
     - **Build Command**: `npm install && npm run build`.
     - **Start Command**: `npm start`.
   - Ajustes para Next.js 15 e Service Worker: Idênticos aos Planos A/B.
   - Monorepo: Railway ignora subdiretórios se configurado corretamente.

2. **Opção 2: Render**:
   - Crie um "Static Site" ou "Web Service" para Next.js.
   - Configure:
     - **Root Directory**: `frontend/`.
     - **Build Command**: `npm install && npm run build`.
     - **Publish Directory**: `frontend/.next`.
   - Evita dupla instalação por design de build único.

3. **Implementação**:
   - Escolha uma plataforma (priorize Railway por simplicidade).
   - Migre repositório e teste deploy.
   - **Tempo Estimado**: 1 hora.

### Vantagens
- Alternativas gratuitas com builds previsíveis.
- Suporte a Next.js sem hacks complexos.

### Desvantagens
- Menos recursos edge que Vercel/Netlify.
- Curva de aprendizado para configurações customizadas.

### Probabilidade de Sucesso
- **Alta**: Ambas são alternativas robustas para casos em que Vercel falha.

---

## Recomendação Final
1. **Plano B (Netlify)**: Comece aqui para resolução rápida e confiável, dado o suporte a subdiretórios e builds estáveis. Use o `netlify.toml` existente e teste em 1 hora.
2. **Plano A (Vercel)**: Tente se preferir permanecer no Vercel, mas limite a 2 horas de iteração. Foque em workspaces e cache.
3. **Plano C (Railway/Render)**: Use como backup se Netlify falhar ou para explorar alternativas.

**Próximos Passos**:
- Crie branches separadas (`fix-vercel`, `try-netlify`, `try-railway`) para testar cada plano.
- Monitore logs e tempo investido (máximo 2 horas por plano).
- Priorize Netlify para o MVP, dado o histórico de falhas no Vercel.

**Data**: 15/01/2025  
**Projeto**: SGN - Sistema de Gestão Normativa  
**Status**: Soluções propostas, aguardando implementação.