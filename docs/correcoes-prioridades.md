# Plano de Correção por Prioridade (SGN)

Este documento organiza as correções necessárias para estabilizar o SGN em produção (Vercel) e local, além de preparar/ativar a automação via N8N.

## Prioridade 1 — Corrigir SSR no Vercel (erro "digest")
Motivo: Server Components fazem `fetch` para `http://localhost:3001`, inexistente em produção.

Ações:
- Trocar chamadas para rotas internas do Next (`/api/...`).
- Arquivos:
  - `src/app/page.tsx`
  - `src/app/normas/page.tsx`
  - `src/app/normas/[id]/page.tsx`
  - `src/app/sitemap.ts` (construir `baseUrl` via `headers()` + `VERCEL`).

Exemplo (page.tsx):
```diff
- await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/normas/stats`, { next: { revalidate: 60 } })
+ await fetch('/api/normas/stats', { next: { revalidate: 60 } })
```

## Prioridade 2 — Estabilizar Upload/Extração (PDF/DOCX/TXT)
Motivo: 405/Edge + libs de parsing; o front tenta parsear JSON de respostas HTML → "Unexpected token '<'".

Ações (rota `src/app/api/extrair-texto/route.ts`):
```ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
```

## Prioridade 3 — Robustez do Front (IA)
Motivo: respostas de erro nem sempre são JSON.

Ações (arquivo `src/components/ia/ModalAnaliseIASimples.tsx`):
- Em `!response.ok`, checar `content-type`.
- Se JSON → `await response.json()`; caso contrário → `await response.text()`.
- Exibir mensagem amigável.

Pseudocódigo:
```ts
const ct = response.headers.get('content-type') || ''
let errorDetails = ''
if (ct.includes('application/json')) {
  const err = await response.json().catch(() => ({} as any))
  errorDetails = err.error || err.detalhes || `Erro ${response.status}: ${response.statusText}`
} else {
  const text = await response.text().catch(() => '')
  errorDetails = text || `Erro ${response.status}: ${response.statusText}`
}
throw new Error(errorDetails)
```

## Prioridade 4 — Ambiente de Execução
- Vercel → Settings → Build and Deployment → `Node.js Version = 20.x`.

## Prioridade 5 — Automação via N8N (produção)
Motivo: SGN usa N8N para coleta/atualização automática (ex.: MTE).

Caminho curto (já funciona):
- Publicar N8N com HTTPS (Render recomendado).
- Habilitar runners/ajustes mínimos:
  - `N8N_PROTOCOL=https`
  - `N8N_RUNNERS_ENABLED=true`
  - `DB_SQLITE_POOL_SIZE=4` (ou migrar para Postgres gerenciado)
- Adicionar no SGN (Vercel):
  - `NEXT_PUBLIC_N8N_WEBHOOK_COLETA_MTE=https://<seu-n8n>/webhook/coleta-mte`
- Workflow atual (coleta MTE) grava direto no Supabase (nó Create Row).

Caminho recomendado (médio prazo):
- Criar API de ingestão no SGN:
  - `src/app/api/ingest/normas/route.ts` (POST)
  - Validar payload com Zod; persistir no Supabase; logar resultado.
- No N8N, apontar saída do workflow para essa API (em vez de escrever no DB).
- Benefícios: versionamento do schema, logs centralizados, segurança.

## Observabilidade e Saúde (contínuo)
- Logs estruturados nas APIs críticas (contexto + tempo de execução).
- Healthcheck em `src/app/api/health/route.ts` validando Supabase; opcionalmente HEAD no endpoint N8N.
- Alertas simples no N8N (Slack/Email/Telegram) em caso de falhas no workflow.

## Validação
1. Home e páginas de Normas rendendo no Vercel (sem "digest").
2. Upload de PDF/DOCX/TXT (<= 3–5 MB) extraindo texto e prosseguindo para IA.
3. N8N: executar workflow manual (Webhook/cron) e confirmar dados no Supabase (ou resposta 200 da API de ingestão).

## Sequência de Execução
1. Prioridade 1 (SSR) → deploy.
2. Prioridade 2 (rota de extração) → deploy.
3. Prioridade 3 (front IA) → deploy.
4. Ajustar Node 20.x.
5. Publicar/ligar N8N e variável `NEXT_PUBLIC_N8N_WEBHOOK_COLETA_MTE`.
6. (Opcional) Implementar API de ingestão.

---
Última atualização deste plano: <!-- atualizar manualmente quando necessário -->
