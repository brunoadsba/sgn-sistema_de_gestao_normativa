# Tarefa: Melhorias de UI e Validação NR6 (EPIs 2026)

## Contexto
O SGN realiza a análise de conformidade de EPIs conforme a NR6. Com as atualizações normativas de 2026, a interface de seleção de EPIs precisa ser mais intuitiva e permitir validações em tempo real de Certificações de Aprovação (CA) e prazos de validade.

## Objetivo
Refatorar a UI de gerenciamento de EPIs e implementar validações estritas baseadas nos novos requisitos da NR6.

## Requisitos
1. **Interface de Seleção de EPI**:
   - Modernizar o componente de seleção de EPI (usar `shadcn/ui` ComboBox ou MultiSelect).
   - Adicionar campo para inserção do número do CA (Certificado de Aprovação).
2. **Validação de Conformidade**:
   - Implementar lógica de validação que verifica se o EPI selecionado é adequado para o risco identificado (mapeamento risco -> tipo de EPI).
   - Exibir alertas visuais (cores/ícones) quando um EPI for selecionado para um risco não compatível.
3. **Persistência**:
   - Garantir que os dados de EPI (CA, validade, tipo) sejam salvos corretamente no banco associados à análise de conformidade.
4. **UX de 2026**:
   - Design premium, dark mode nativo, micro-iterações fluidas.

## Stack
- Next.js 15 (App Router)
- Tailwind CSS
- Lucide React (ícones)
- React Hook Form + Zod

## Arquivos Relevantes
- `src/features/analise/components/SelecaoEPI.tsx` (se existir, ou criar novo)
- `src/lib/db/schema.ts` (verificar campos de EPI)
- `src/app/analise/normas/nr6/page.tsx` (página de referência)

## Critério de Aceite
- `npm run build` sem erros
- Interface responsiva com validação de CA funcionando
- Feedback visual de "Risco vs EPI" implementado
