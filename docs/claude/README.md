# SGN — Geração de PDF (Arquitetura Híbrida)

## Instalação

```bash
npm install @react-pdf/renderer react react-dom
npm install -D @types/react @types/react-dom
```

---

## Estrutura

```
src/
├── types/report.ts                        # Tipos TypeScript
├── components/report/
│   ├── ReportDocument.tsx                 # ★ Template único (browser + Node)
│   └── ReportPreview.tsx                  # Preview client-side com toolbar
├── services/reportService.ts              # Geração server-side
└── app/api/reports/generate/route.ts      # Endpoint Next.js App Router

docs/claude/
├── report.ts
├── mockReport.ts
├── ReportDocument.tsx
├── ReportPreview.tsx
├── reportService.ts
└── route.ts
```

---

## Como usar

### 1. Preview no browser

```tsx
import { ReportPreview } from '@/components/report/ReportPreview';
import { toReportData } from '@/lib/ia/report-mapper';

export default function Page() {
  const reportData = toReportData(resultadoAnalise);
  return <ReportPreview data={reportData} onClose={() => router.back()} />;
}
```

### 2. Download client-side (instantâneo)

```tsx
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportDocument } from '@/components/report/ReportDocument';

<PDFDownloadLink document={<ReportDocument data={reportData} />} fileName="relatorio.pdf">
  {({ loading }) => loading ? 'Preparando...' : 'Baixar PDF'}
</PDFDownloadLink>
```

### 3. Exportação server-side (recomendada para produção)

```ts
// POST /api/reports/generate
// Body: ReportData (JSON)
const res = await fetch('/api/reports/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reportData),
});
const blob = await res.blob(); // PDF pronto para download
```

---

## Problemas resolvidos vs. abordagem anterior (screenshot)

| Problema                         | Solução                                           |
|----------------------------------|---------------------------------------------------|
| Botões de UI no PDF              | Template dedicado — zero elementos interativos    |
| Matriz de gaps vazia             | Geração só ocorre após dados carregados           |
| Score sem contexto               | Disclaimer condicional por `meta.scope`           |
| Rodapé sem metadados             | `ReportFooter` com id, data, versão, sessão       |
| Sem acessibilidade               | Metadados PDF nativos (title, author, subject)    |
| Texto não selecionável           | PDF gerado programaticamente                      |

---

## Adicionando novos campos ao relatório

1. Adicione o tipo em `src/types/report.ts`
2. Crie o sub-componente em `src/components/report/sections/`
3. Importe e use em `ReportDocument.tsx`
4. O servidor gera automaticamente o novo layout

---

## Dependências

| Lib                    | Versão | Uso                          |
|------------------------|--------|------------------------------|
| @react-pdf/renderer    | ^4.3.x | Template + geração de PDF    |
| react                  | ^19.x  | Renderização                 |
| next                   | ^16.x  | App Router + API Routes      |
