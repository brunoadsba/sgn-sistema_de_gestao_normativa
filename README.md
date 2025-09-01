# SGN — Sistema de Gestão Normativa

## Visão
Plataforma de compliance automatizada: coleta, análise de conformidade e relatórios executivos.

## Como rodar
1) Pré-requisitos: Node 20, Supabase, N8N.
2) Desenvolvimento:
```bash
cd /home/brunoadsba/sgn/frontend
npm install
PORT=3001 npm run dev
```
3) Variáveis de ambiente: veja `docs/arquitetura.md` e `docs/environment.md`.

## Teste rápido (API)
```bash
# Empresa (pegar um id existente)
EMPRESA_ID=$(curl -s "http://localhost:3001/api/empresas?limit=1" | jq -r '.data[0].id')

# Dashboard de conformidade
curl -s "http://localhost:3001/api/conformidade/dashboard/$EMPRESA_ID" | jq .

# Jobs de conformidade (param correto: empresa_id)
curl -s "http://localhost:3001/api/conformidade/analisar?empresa_id=$EMPRESA_ID" | jq .
```

## Estrutura
- `frontend/` (Next.js 15 + TypeScript)
  - `src/app/empresas/[id]/conformidade/page.tsx` (Página executiva de conformidade)
  - `src/components/conformidade/` (Kpis, GapsTable, JobsList)
- `docs/` (arquitetura, roadmap, runbooks, API)
- `status-implementacao.md` (fonte única de status)

## Status Atual
- **MVP**: 100% concluído
- **Conformidade corporativa**: 90% (multi-tenant, análise, relatórios, UI executiva)
- **UI Executiva**: Implementada (KPIs, gaps, jobs, componentes React)
- Roadmap: `docs/roadmap.md` (consolidado)
- Status detalhado: `status-implementacao.md`

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