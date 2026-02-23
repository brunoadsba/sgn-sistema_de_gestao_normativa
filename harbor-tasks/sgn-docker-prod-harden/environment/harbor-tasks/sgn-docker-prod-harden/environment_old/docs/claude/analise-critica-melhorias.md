# Análise Crítica: Melhorias SGN (Claude)

Esta análise avalia as sugestões do documento `melhorias-sgn-claude.md` sob a ótica de um Senior Engineer em 2026, focando em **KISS**, **YAGNI** e **DRY**.

---

## 1. Banco de Dados Persistente (Turso)
> [!IMPORTANT]
> **Avaliação: Prioritária (GO)**

- **Prós:** Resolve o reset de dados no Vercel (filesystem efêmero). Turso é baseado em `libsql` e mantém a compatibilidade com o SQLite usado localmente.
- **Contra:** Adiciona uma dependência externa à infra (Turso DB).
- **Veredito:** Essencial se o Bruno quiser usar a plataforma hospedada no Vercel de forma séria. Atualmente, o SGN perde o histórico a cada deploy.

## 2. Dashboard com Histórico Visual
> [!NOTE]
> **Avaliação: Útil, mas com ressalvas (GO - Fase 2)**

- **Prós:** Dá uma visão executiva do acervo.
- **Contra:** Pode violar o **YAGNI** se o usuário quiser apenas "Analisar e Sair". O SGN é uma ferramenta operacional, não necessariamente um BI.
- **Veredito:** Implementar apenas os cards de resumo e o histórico recente. Gráficos complexos podem ser adiados até que haja volume de dados que justifique.

## 3. Stepper de Progresso na Análise
> [!TIP]
> **Avaliação: Alta Prioridade UX (GO)**

- **Prós:** Reduz a ansiedade do usuário durante o processamento incremental que pode ser demorado.
- **Contra:** Lógica de SSE (Server-Sent Events) no Next.js (Vercel) tem limitações de timeout em Serverless Functions (10s-30s).
- **Veredito:** Melhor usar **Polling** simples no início ou **Server Actions + Optimistic UI**, já que o job de análise é persistido no banco e temos o status lá.

## 4. Visualização do Resultado da Análise
> [!IMPORTANT]
> **Avaliação: Parcialmente Implementada (CHECK)**

- **Observação:** O SGN **já possui** score circular SVG e cards por severidade (v1.6.0+).
- **Veredito:** O documento do Claude parece estar desatualizado em relação ao estado atual do projeto. Melhorariam-se apenas detalhes de layout (Gauge Chart do shadcn/ui), mas o motor já existe.

## 5. Exportação para PDF
> [!CAUTION]
> **Avaliação: Prioritária para Portos (GO)**

- **Prós:** Fundamental para o uso em fiscalização portuária (CODEBA). O técnico precisa levar o "laudo" para campo ou anexar a processos.
- **Contra:** `@react-pdf/renderer` aumenta o bundle.
- **Veredito:** Implementar via `window.print()` com CSS Print Media queries primeiro. É mais leve (zero bytes extras) e atende 90% dos casos.

## 6. Modo Claro / Escuro
> [!WARNING]
> **Avaliação: Conflitante com Branding (NO-GO inicial)**

- **Observação:** O SGN foi intencionalmente projetado como **Premium Dark Mode** (Canvas Background, SplashScreen de 2026).
- **Veredito:** Ignorar por enquanto para manter a identidade visual forte e o arquivo de estilos simples. Seguir a regra do projeto de "wow visual" que o Dark Mode atual entrega melhor.

---

# Proposta de Próximos Passos (Bruno)

1. **Correção de Infra:** Migrar para Turso (Persistência real).
2. **Feedback Operacional:** Implementar o Stepper/Status da análise no banco.
3. **Relatório Executivo:** Exportação PDF (via Print) e melhoria no Gauge de Score.

**Bruno, por gentileza, confirme se concorda com esta priorização ou se deseja focar em algum item específico do documento.**
