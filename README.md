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