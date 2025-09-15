# SGN — Sistema de Gestão Normativa

## Visão
Plataforma de compliance automatizada: coleta, análise de conformidade e relatórios executivos.

## Como rodar
1) **Pré-requisitos:** Node 20, Supabase, N8N
2) **Desenvolvimento:**
```bash
# Frontend
cd /home/brunoadsba/sgn/frontend
npm install
npm run dev

# N8N (em terminal separado)
cd /home/brunoadsba/sgn
n8n start
```
3) **Acesso:**
   - Frontend: http://localhost:3001
   - N8N: http://localhost:5678
4) **Variáveis de ambiente:** veja `docs/arquitetura.md` e `docs/environment.md`

## Teste rápido (API)
```bash
# Estatísticas das normas
curl -s "http://localhost:3001/api/normas/stats" | jq .

# Lista de normas (primeiras 5)
curl -s "http://localhost:3001/api/normas?limit=5" | jq .

# Detalhes de uma norma específica
curl -s "http://localhost:3001/api/normas/56" | jq .
```

## Estrutura
- `frontend/` (Next.js 15 + TypeScript)
  - `src/app/page.tsx` (Dashboard principal)
  - `src/app/normas/` (Páginas de normas)
  - `src/app/api/normas/` (APIs de normas)
  - `src/components/conformidade/` (Componentes de conformidade)
- `docs/` (arquitetura, roadmap, runbooks, API)
- `.env-n8n` (Configuração do N8N)
- `status-implementacao.md` (fonte única de status)

## Status Atual
- **MVP**: 100% concluído ✅
- **Sistema**: 100% funcional e operacional ✅
- **Dados**: 38 normas (36 ativas, 2 revogadas) ✅
- **Interface**: Otimizada e sem problemas ✅
- **Conformidade corporativa**: 90% (multi-tenant, análise, relatórios, UI executiva)
- **UI Executiva**: Implementada (KPIs, gaps, jobs, componentes React)
- Roadmap: `docs/roadmap.md` (consolidado)
- Status detalhado: `status-implementacao.md`

### 🔧 Correções Recentes (14/09/2025)
- ✅ **n8n configurado para Supabase** (PostgreSQL)
- ✅ **Dados duplicados limpos** (380 → 38 registros)
- ✅ **Interface corrigida** (sem repetições de texto)
- ✅ **Sincronização funcionando** (n8n ↔ frontend)
- ✅ **Footer atualizado** (2025 + créditos do desenvolvedor)

## Configuração do N8N
O sistema usa N8N conectado ao Supabase (PostgreSQL). Configuração em `.env-n8n`:

```bash
N8N_TIMEZONE=America/Sao_Paulo
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=db.kqdilsmgjlgmqcoubpel.supabase.co
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=sua_senha_aqui
```

## Segurança
Consulte `docs/environment.md` e políticas RLS em `docs/arquitetura.md`.

## Solução de Problemas Comuns

### Erro: `ECONNREFUSED` durante o Build

Se você encontrar um erro `ECONNREFUSED` (Connection Refused) durante o processo de build (ex: `npm run build` ou `yarn build`), isso geralmente significa que o seu aplicativo frontend (Next.js, por exemplo) está tentando se conectar a um servidor de API local que não está em execução.

**Causa:**

Alguns frameworks de frontend, como o Next.js, podem realizar requisições de dados para APIs durante o processo de build estático (Server-Side Rendering - SSR ou Static Site Generation - SSG). Se a API que ele tenta acessar não estiver disponível (ou seja, o servidor da API não está rodando), a conexão será recusada, resultando no erro `ECONNREFUSED`.

**Solução:**

Para resolver este problema, certifique-se de que o servidor de desenvolvimento da API esteja em execução **antes** de iniciar o processo de build do frontend.

1. **Inicie o servidor da API:** Navegue até o diretório do seu projeto de backend (se for separado) e inicie-o. Por exemplo:
   ```bash
   cd ../backend # Ou o caminho para o seu backend
   npm run dev   # Ou o comando para iniciar sua API
   ```
2. **Inicie o build do Frontend:** Após confirmar que a API está rodando, inicie o build do seu projeto frontend:
   ```bash
   npm run build # Ou yarn build
   ```

**Observação:** Este erro é comum em ambientes de desenvolvimento local. Em ambientes de CI/CD ou produção, a API geralmente já estará disponível e acessível, então este problema não deve ocorrer.