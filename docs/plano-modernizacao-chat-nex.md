# Plano de Modernização — Chat NEX

> Criado em: 2026-03-03
> Feature: `src/features/chat-documento`
> Status: `concluído` — todas as 3 fases entregues em 2026-03-03

---

## 1. Diagnóstico do Estado Atual

| Problema | Causa raiz | Impacto |
|---|---|---|
| Usuário não sabe se o NEX está processando | `ChatTypingIndicator` sem texto — apenas barras animadas | Alto |
| Sem granularidade de estado | `isTyping: boolean` binário — sem fase `thinking` vs `writing` | Alto |
| Streaming ausente | API retorna JSON completo; resposta aparece "de uma vez" | Alto |
| Botão de envio sem loading visível | Somente `disabled` muda — sem spinner | Médio |
| Timestamps invisíveis | Campo `timestamp` existe no tipo mas não é exibido | Baixo |
| Modo atual não indicado no input | Modo `livre` / `grounded` sem indicação visual junto ao campo | Baixo |

---

## 2. Itens já concluídos nesta sessão

| # | Item | Arquivo | Data |
|---|---|---|---|
| ✅ | Persistência de histórico com TTL 30 dias | `lib/chat-storage.ts` | 2026-03-03 |
| ✅ | `ChatInterface.tsx` migrado para `chat-storage` | `components/ChatInterface.tsx` | 2026-03-03 |
| ✅ | **Fase 1.2** — `ChatTypingIndicator` com `phase` verbal e ellipsis animado | `components/ChatTypingIndicator.tsx` | 2026-03-03 |
| ✅ | **Fase 1.1** — `chatStatus: 'idle'\|'thinking'\|'writing'` substituindo `isTyping: boolean` | `components/ChatInterface.tsx` | 2026-03-03 |
| ✅ | **Fase 1.3** — Botão de envio com `Loader2 animate-spin` durante processamento | `components/ChatInterface.tsx` | 2026-03-03 |
| ✅ | **Fase 2.1** — `route.ts` com SSE streaming nativo Groq + fallback bloco Z.AI/Ollama | `api/chat-documento/route.ts`, `prompt-builder.ts` | 2026-03-03 |
| ✅ | **Fase 2.2** — Cliente consome SSE token a token via `ReadableStreamDefaultReader` | `components/ChatInterface.tsx`, `lib/chat-utils.ts` | 2026-03-03 |
| ✅ | **Fase 3.1** — Timestamps relativos (`"agora"`, `"há 2 min"`) nas mensagens | `components/ChatMessageBubble.tsx`, `lib/chat-utils.ts` | 2026-03-03 |
| ✅ | **Fase 3.3** — Badge de modo (`● Modo livre` / `● Grounded · [nome]`) no input | `components/ChatInterface.tsx` | 2026-03-03 |

---

## 3. Fases de Execução

### Fase 1 — Feedback de Processamento ✅ CONCLUÍDA

**Objetivo:** o usuário sabe com precisão que o NEX está "pensando" e redigindo.

#### 1.1 Estado de fase no `ChatInterface`

Substituir `isTyping: boolean` por `chatStatus: 'idle' | 'thinking' | 'writing'`.

```
'idle'     → campo habilitado, botão ArrowUp ativo
'thinking' → primeiros ~1,2 s após envio (setTimeout); label "Analisando..."
'writing'  → quando a resposta começa a ser recebida; label "Redigindo resposta..."
```

Arquivos: `ChatInterface.tsx`

#### 1.2 Refatorar `ChatTypingIndicator` para receber `phase`

```tsx
// contrato novo
<ChatTypingIndicator phase="thinking" | "writing" />
```

- **`thinking`**: ícone `BrainCircuit` pulsando + texto `"NEX está analisando o contexto..."` com animação de ellipsis (`...`)
- **`writing`**: ícone `PencilLine` + texto `"Redigindo resposta..."` + cursor piscando

Arquivos: `ChatTypingIndicator.tsx`

#### 1.3 Botão de envio com estado de loading

Enquanto `chatStatus !== 'idle'`, exibir `Loader2` com `animate-spin` no lugar do `ArrowUp`.

Arquivos: `ChatInterface.tsx`

---

### Fase 2 — Streaming de Resposta ✅ CONCLUÍDA

**Objetivo:** tokens aparecem progressivamente (padrão ChatGPT/Claude), eliminando o salto silêncio → resposta completa.

#### 2.1 Converter `/api/chat-documento` para `ReadableStream`

```typescript
// src/app/api/chat-documento/route.ts
const stream = await groq.chat.completions.create({ ...params, stream: true })
return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' },
})
```

Garantir suporte a Z.AI e Ollama com fallback para resposta JSON simples quando o provider não suportar streaming.

Arquivos: `src/app/api/chat-documento/route.ts`

#### 2.2 Consumir stream no cliente

Substituir `fetch → res.json()` por leitura incremental:

```typescript
const reader = res.body!.getReader()
const decoder = new TextDecoder()
let partial = ''
setChatStatus('writing')

while (true) {
    const { done, value } = await reader.read()
    if (done) break
    partial += decoder.decode(value, { stream: true })
    setMessages(prev => updateLastAssistantMessage(prev, partial))
}
```

Criar helper `updateLastAssistantMessage(messages, text)` em `lib/` para imutabilidade.

Arquivos: `ChatInterface.tsx`, `lib/chat-utils.ts` (novo)

---

### Fase 3 — Polimento de UX ✅ CONCLUÍDA

#### 3.1 Timestamps visíveis nas mensagens

Exibir hora relativa (`"agora"`, `"há 2 min"`, `"há 1 h"`) abaixo de cada mensagem do assistente.
Usar `Intl.RelativeTimeFormat` ou `date-fns/formatDistanceToNow`.

Arquivos: `ChatMessageBubble.tsx`

#### 3.2 Scroll âncora durante streaming

Forçar scroll para o fim enquanto `isNearBottom = true` durante a escrita de tokens.

Arquivos: `ChatInterface.tsx`

#### 3.3 Badge de modo no input

Badge sutil no rodapé do input: `◉ Modo livre` / `◉ Grounded · [nome do doc]`.
Dado já disponível via `useChatContext()`.

Arquivos: `ChatInterface.tsx`

---

## 4. Ordem de Execução Recomendada

| Prioridade | Fase | Arquivos afetados | Risco | Pré-requisito |
|---|---|---|---|---|
| 1 | **1.2 — Indicador verbal** | `ChatTypingIndicator.tsx` | Baixo | — |
| 2 | **1.1 + 1.3 — Estado de fase + botão** | `ChatInterface.tsx` | Baixo | 1.2 |
| 3 | **2.1 — Streaming na API** | `route.ts` | Médio | — |
| 4 | **2.2 — Consumo de stream** | `ChatInterface.tsx` | Médio | 2.1 |
| 5 | **3.x — Polimento** | `ChatMessageBubble.tsx`, `ChatInterface.tsx` | Baixo | 2.2 |

---

## 5. Gate de Qualidade por Fase

Ao finalizar cada fase executar:

```bash
npx tsc --noEmit
npm run lint
npm run test:ci
npm run test:e2e
```

E2E mínimo esperado: **45/47 passados** (2 pulados em `chat.spec.ts` são fixos).

---

## 6. Referências

- Componentes da feature: `src/features/chat-documento/components/`
- Contexto: `src/features/chat-documento/.context.md`
- API de chat: `src/app/api/chat-documento/route.ts`
- Storage com TTL: `src/features/chat-documento/lib/chat-storage.ts`
