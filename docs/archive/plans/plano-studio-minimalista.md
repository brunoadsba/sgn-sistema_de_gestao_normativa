# Plano de Implementação: Studio Minimalista (Industrial Standard)

**Versão**: 2.1.0  
**Status**: Em Planejamento (Aguardando Aprovação)  
**Técnico Responsável**: Senior Full-Stack Engineer

---

## 1. Sumário Executivo
Este plano detalha a reengenharia da interface da feature de Análise de Conformidade, migrando do atual layout paralelo de 3 colunas ("NotebookLM-like") para uma abordagem **Studio Minimalista**. O objetivo é reduzir a carga cognitiva, priorizar o diagnóstico normativo e oferecer suporte assistivo (NEX) de forma não intrusiva.

## 2. Racionais Técnicos & Arquitetura
- **KISS/DRY**: Centralização da lógica de layout em um container único, evitando redundância de wrappers responsivos.
- **Interatividade Sob Demanda**: Uso de *Drawers* laterais (Sheet) para ferramentas secundárias (Chat NEX), otimizando o *Real Estate* da tela.
- **Performance**: Redução do número de elementos renderizados simultaneamente no DOM principal para melhorar a performance de animações do Framer Motion.
- **Event-Driven UI**: Manutenção do sistema de eventos customizados para orquestração entre o container de resultados e o Assistente NEX.

## 3. Mudanças Propostas

### 3.1. [Frontend] Refatoração do Core Container
**Arquivo:** `src/features/analise/components/AnaliseCliente.tsx`

- **Rollback de Grid**: Substituição do `flex-row` de 3 colunas por um layout vertical `max-w-4xl` centralizado com `mx-auto`.
- **Hierarquia de Fluxo**:
    1.  **Zona de Configuração (Pilha)**: `UploadDocumento` (superior) + `SeletorNormas` (inferior).
    2.  **Zona de Ação**: Botão de análise centralizado com feedback visual de estado.
    3.  **Zona de Resultados**: Substituição completa do container de config pelo `ResultadoAnalise`.
- **Implementação do NEX Drawer**:
    - Abstração do `ChatInterface` para dentro de um painel lateral retrátil (estilo Sidebar).
    - Trigger de abertura: Botão flutuante "Consultar NEX" ou link ativo no header de resultados.

### 3.2. [Componentes] Adaptação de UI
**Arquivo:** `src/features/chat-documento/components/ChatInterface.tsx`

- **Ajuste de Viewport**: Modificar o componente para ser `h-full` (100% da altura do drawer), removendo paddings externos que poluem a integração lateral.
- **Responsividade Interna**: Garantir que as bolhas de chat e o input se adaptem a larguras reduzidas (320px - 400px).

## 4. Plano de Verificação (QA)

### 4.1. Quality Gates (Automatizado)
```bash
# Validação de integridade de tipos e regras de estilo
npx tsc --noEmit
npm run lint

# Verificação de Broken Links de Media/Assets
# (Validar se as imagens do NEX continuam renderizando)
```

### 4.2. Critérios de Aceite (Manual)
1.  **Foco**: A tela inicial de auditoria deve estar limpa e centralizada sem elementos colaterais.
2.  **Navegação**: O NEX Chat deve abrir de forma suave via animação lateral e não deve sobrepor conteúdo crítico de forma irreversível.
3.  **Consistência**: O contexto do documento deve ser mantido corretamente entre o container central e o Drawer do assistente.

## 5. Plano de Rollback
Caso a nova experiência sofra rejeição técnica ou de UX, as alterações serão revertidas via `git checkout master` do commit estável anterior (v2.0.0).

---
> [!NOTE]
> Este plano segue as regras de arquitetura `src/features/[NOME]` e prioriza Server Components onde a interatividade não é mandatória.
