# SGN — Sistema de Gestão Normativa

## Visão
Plataforma de compliance automatizada: coleta, análise de conformidade e relatórios executivos.

## Como rodar
1) Pré-requisitos: Node 20, Supabase, N8N.
2) Desenvolvimento:
```bash
cd /home/brunoadsba/sgn/frontend
npm install
npm run dev
```
3) Variáveis de ambiente: veja `docs/arquitetura.md` (ambiente e RLS).

## Estrutura
- `frontend/` (Next.js 15 + TypeScript)
- `docs/` (arquitetura, roadmap, runbooks, API)
- `docs/runbooks/agente.md` (runbook obrigatório)

## Roadmap e Status
- Roadmap: `docs/roadmap.md` (consolidado)
- Status: `status-implementacao.md` (fonte única de status)

## Segurança
Consulte `