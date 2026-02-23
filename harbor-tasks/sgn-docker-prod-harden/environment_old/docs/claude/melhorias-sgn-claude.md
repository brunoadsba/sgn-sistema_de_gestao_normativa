# Melhorias SGN — Sistema de Gestão Normativa

> Documento gerado para orientar o dev/LLM na implementação das melhorias priorizadas.
> Contexto: uso único, privado (1 usuário: dev/tst). Stack: Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui, SQLite + Drizzle, GROQ.

---

## 1. Banco de Dados Persistente no Vercel

**Problema:** SQLite com `better-sqlite3` usa o sistema de arquivos local. No Vercel, o filesystem é efêmero — todos os dados são perdidos a cada novo deploy.

**Solução recomendada:** Migrar para [Turso](https://turso.tech/) (SQLite distribuído, compatível com Drizzle e gratuito no tier hobby).

### Passos de implementação

```bash
npm install @libsql/client drizzle-orm
```

1. Criar banco no Turso:
   ```bash
   turso db create sgn
   turso db tokens create sgn
   ```

2. Adicionar variáveis de ambiente (`.env.local` e Vercel Dashboard):
   ```
   TURSO_DATABASE_URL=libsql://sgn-<usuario>.turso.io
   TURSO_AUTH_TOKEN=<token>
   ```

3. Atualizar `drizzle.config.ts`:
   ```ts
   import { defineConfig } from 'drizzle-kit'

   export default defineConfig({
     schema: './src/db/schema.ts',
     dialect: 'turso',
     dbCredentials: {
       url: process.env.TURSO_DATABASE_URL!,
       authToken: process.env.TURSO_AUTH_TOKEN,
     },
   })
   ```

4. Atualizar o client de DB em `src/lib/db.ts`:
   ```ts
   import { drizzle } from 'drizzle-orm/libsql'
   import { createClient } from '@libsql/client'

   const client = createClient({
     url: process.env.TURSO_DATABASE_URL!,
     authToken: process.env.TURSO_AUTH_TOKEN,
   })

   export const db = drizzle(client)
   ```

5. Rodar migração:
   ```bash
   npm run db:push
   ```

**Critério de aceitação:** Dados de análise e histórico persistem após `git push` e novo deploy no Vercel.

---

## 2. Dashboard com Histórico Visual

**Problema:** A home vai direto para o upload. Não há visão geral de uso, evolução de conformidade ou atalhos contextuais.

**Solução:** Criar um dashboard na rota `/` (ou `/dashboard`) com:

### Componentes a implementar

#### 2.1 Cards de resumo (topo)
- Total de análises realizadas
- Score médio de conformidade (últimos 30 dias)
- NR mais analisada
- Última análise (data + score)

#### 2.2 Gráfico de evolução (linha)
- Eixo X: data das análises
- Eixo Y: score de conformidade (0–100)
- Biblioteca sugerida: `recharts` (já disponível no ecossistema shadcn)

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Dados vindos de: SELECT data, score FROM analise_resultados ORDER BY data DESC LIMIT 30
```

#### 2.3 Lista de últimas análises
- Tabela com: documento, NRs analisadas, score, data, link para ver resultado
- Ordenação por data decrescente
- Máximo 10 itens, com link "Ver histórico completo" → `/historico`

#### 2.4 Atalhos rápidos
- Botão primário: "Nova Análise" → `/`
- Botão secundário: "Catálogo de NRs" → `/normas`

**Critério de aceitação:** Ao acessar o app, o usuário vê imediatamente o estado geral do sistema antes de iniciar uma nova análise.

---

## 3. Stepper de Progresso na Análise

**Problema:** A análise com chunking pode levar minutos. Atualmente não há feedback visual de etapa — parece que travou.

**Solução:** Implementar progresso em tempo real via **Server-Sent Events (SSE)** ou **polling**, com stepper visual.

### Etapas do fluxo
```
[1] Recebendo arquivo → [2] Extraindo texto → [3] Analisando com IA → [4] Consolidando → [5] Concluído
```

### Implementação com SSE (recomendado)

1. Criar rota `GET /api/analise/[jobId]/progress` que emite eventos SSE:
   ```ts
   // src/app/api/analise/[jobId]/progress/route.ts
   export async function GET(req: Request, { params }: { params: { jobId: string } }) {
     const encoder = new TextEncoder()
     const stream = new ReadableStream({
       start(controller) {
         const interval = setInterval(async () => {
           const job = await db.query.analise_jobs.findFirst({
             where: eq(analise_jobs.id, params.jobId)
           })
           controller.enqueue(encoder.encode(`data: ${JSON.stringify({ step: job.status, progress: job.progress })}\n\n`))
           if (job.status === 'concluido' || job.status === 'erro') {
             clearInterval(interval)
             controller.close()
           }
         }, 1000)
       }
     })
     return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
   }
   ```

2. Componente `<AnaliseProgress jobId={id} />`:
   - Usa `useEffect` + `EventSource` para consumir SSE
   - Renderiza stepper com shadcn (ou componente customizado)
   - Em caso de erro, mostra mensagem e botão "Tentar novamente"

**Critério de aceitação:** O usuário vê qual etapa está em execução em tempo real, sem necessidade de adivinhar se o processo está rodando.

---

## 4. Visualização do Resultado da Análise

**Problema:** O resultado é exibido em texto/JSON. Dados de score e gaps pedem visualização.

**Solução:** Criar página `/analise/[id]/resultado` com componentes visuais.

### 4.1 Gauge de Conformidade
```tsx
// Score de 0–100 exibido como medidor semicircular
// Cores: 0-40 vermelho | 41-70 amarelo | 71-100 verde
// Biblioteca: recharts RadialBarChart ou react-gauge-chart
```

### 4.2 Gráfico de Gaps por Severidade
```tsx
// BarChart horizontal com 3 barras: Alta | Média | Baixa
// Cores: vermelho | amarelo | azul
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
```

### 4.3 Accordion de Gaps Detalhados
- Cada gap em um `<AccordionItem>` com:
  - Badge de severidade (colorido)
  - Requisito normativo
  - Situação encontrada
  - Ação recomendada

### 4.4 Card de Próximos Passos
- Lista ordenada por prioridade
- Checkbox visual (não interativo — apenas indicativo)

**Critério de aceitação:** O resultado da análise é visualmente executivo — pode ser compartilhado como print/PDF sem precisar de interpretação adicional.

---

## 5. Exportação do Resultado em PDF

**Problema:** Só existe exportação CSV do histórico. O resultado da análise não tem saída formatada.

**Solução:** Adicionar botão "Exportar PDF" na página de resultado.

### Abordagem recomendada: `@react-pdf/renderer`

```bash
npm install @react-pdf/renderer
```

```tsx
// src/components/ExportarResultadoPDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export const RelatorioConformidade = ({ analise }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.titulo}>SGN — Relatório de Conformidade SST</Text>
        <Text style={styles.meta}>Data: {analise.data} | Documento: {analise.nomeArquivo}</Text>
      </View>
      <View style={styles.score}>
        <Text>Score de Conformidade: {analise.score}/100</Text>
      </View>
      {/* Gaps, próximos passos, NRs analisadas */}
    </Page>
  </Document>
)
```

**Alternativa mais simples:** `window.print()` com CSS `@media print` bem configurado na página de resultado (zero dependências extras).

**Critério de aceitação:** O usuário consegue gerar um PDF do relatório formatado diretamente da interface.

---

## 6. Modo Claro / Escuro

**Problema:** Interface aparentemente dark-only. Contexto corporativo/diurno pode demandar modo claro.

**Solução:** Implementar toggle com `next-themes`.

```bash
npm install next-themes
```

1. Envolver o layout com `<ThemeProvider>`:
   ```tsx
   // src/app/layout.tsx
   import { ThemeProvider } from 'next-themes'

   export default function RootLayout({ children }) {
     return (
       <html lang="pt-BR" suppressHydrationWarning>
         <body>
           <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
             {children}
           </ThemeProvider>
         </body>
       </html>
     )
   }
   ```

2. Componente de toggle no header:
   ```tsx
   import { useTheme } from 'next-themes'
   import { Sun, Moon } from 'lucide-react'

   export function ThemeToggle() {
     const { theme, setTheme } = useTheme()
     return (
       <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
         {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
       </button>
     )
   }
   ```

3. Garantir que as cores Tailwind usam `dark:` prefix consistentemente.

**Critério de aceitação:** Toggle no header muda o tema e a preferência persiste entre sessões.

---

## Ordem de Implementação Recomendada

| # | Melhoria | Branch sugerida | Esforço estimado |
|---|----------|----------------|-----------------|
| 1 | Banco persistente (Turso) | `feat/turso-db` | 2–4h |
| 2 | Stepper de progresso | `feat/analise-progress` | 3–5h |
| 3 | Dashboard com histórico | `feat/dashboard` | 4–6h |
| 4 | Visualização do resultado | `feat/resultado-visual` | 3–5h |
| 5 | Exportação PDF | `feat/export-pdf` | 2–3h |
| 6 | Modo claro/escuro | `feat/theme-toggle` | 1–2h |

> **Nota para o LLM:** Sempre criar uma nova branch antes de iniciar cada item. Nunca commitar diretamente na `master`.
