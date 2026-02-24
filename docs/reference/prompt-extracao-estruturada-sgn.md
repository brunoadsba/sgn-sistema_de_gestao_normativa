# Mapeamento: Prompt de Extração Estruturada SST → SGN

> Documento de referência para integração do prompt de extração estruturada (Anthropic/OpenAI) ao SGN.
> Versão: 1.1 | Data: 2026-02-24
>
> **Implementado (2026-02-24):** Metodologia GUT, plano 5W2H, campos probabilidade/pontuacaoGut/classificacao/prazoDias em gaps.

---

## Resumo Executivo

O prompt de extração estruturada oferece um schema JSON rico para relatórios padrão indústria. O SGN já possui análise de conformidade com gaps e score. Este documento mapeia o que **já existe**, o que **pode ser adotado** e o que **exige evolução maior**.

---

## Comparativo: Schema Atual SGN vs Schema Proposto

| Dimensão | SGN Atual | Prompt Extração |
|----------|-----------|-----------------|
| **Score** | Único (0–100), penalidade por severidade | Score por 5 pilares (pesos 30/25/20/15/10) |
| **Gaps** | severidade, descricao, recomendacao, prazo | + probabilidade, severidade, pontuacao_gut, classificacao, trabalhadores_expostos |
| **Plano de ação** | proximosPassos (lista de strings) | Planos 5W2H com who, when, how_much, evidencia_conclusao, kpi |
| **Empresa** | Não extraído | razao_social, cnpj, cnae, grau_risco, responsavel_tecnico |
| **NRs aplicáveis** | Usuário seleciona | IA identifica por CNAE + justificativa |
| **KPIs** | Não | taxas TF/TG, quase-acidentes, treinamentos, etc. |
| **Metodologia** | Implícita | GUT/FMEA/BOW-TIE explícito |

---

## O que pode ser útil imediatamente (baixo esforço)

### 1. Metodologia GUT para gaps

| Item | Onde | Ação |
|------|------|------|
| `probabilidade` (1–5) | `GapConformidade` | Adicionar campo opcional |
| `severidade` (1–5) | Já existe como string (baixa/media/alta/critica) | Mapear para escala numérica |
| `pontuacao_gut` | Novo | `probabilidade × severidade` |
| `classificacao` | Novo | CRITICO | ALTO | MEDIO | BAIXO por faixa |

**Benefício:** Priorização objetiva e prazos automáticos (CRITICO=30d, ALTO=90d, MEDIO=180d, BAIXO=365d).

**Arquivos afetados:** `src/types/ia.ts`, `src/lib/ia/groq.ts`, `src/lib/db/schema.ts`, `src/schemas/index.ts`.

---

### 2. Critérios de probabilidade e severidade (tabelas)

Incorporar as tabelas do prompt no system prompt do SGN para padronizar a avaliação:

```
Critérios de Probabilidade (1-5): Improvável → Certo
Critérios de Severidade (1-5): Desprezível → Catastrófica
Classificação: 20-25=CRITICO, 12-19=ALTO, 6-11=MEDIO, 1-5=BAIXO
```

**Arquivo:** `src/lib/ia/groq.ts` (system prompt).

---

### 3. Plano de ação 5W2H (parcial)

O SGN tem `proximosPassos: string[]`. O prompt propõe ações estruturadas com:

- `who` (cargo: Eng. Segurança, Coord. SST)
- `prazo_dias` (derivado da classificação)
- `how_much` (estimativa R$)
- `evidencia_conclusao` (documento verificável)
- `kpi` (mensurável com meta e prazo)

**Opção A:** Adicionar `planoAcao?: Array<{ what, who, prazoDias, evidenciaConclusao }>` ao `AnaliseConformidadeResponse`.

**Opção B:** Manter `proximosPassos` e enriquecer cada item com metadados no prompt (ex.: "30 dias | Eng. Segurança | R$ 5.000 a R$ 50.000").

---

### 4. NRs aplicáveis por CNAE

O SGN já tem auto-sugestão de NRs. O prompt sugere:

- Identificar CNAE no documento
- Cruzar com NRs obrigatórias por CNAE
- Para CNAE 5231 (Portos): NR-29 + NORMAM-10
- Para Grau de Risco 3 ou 4: NR-15, NR-23, NR-35

**Ação:** Incluir essa lógica no prompt de análise ou em um módulo de pré-processamento (ex.: `src/lib/ia/sugestao-nrs.ts`).

---

## O que exige evolução maior (médio/alto esforço)

### 5. Score por pilares

O schema proposto usa 5 pilares com rubricas e pesos:

| Pilar | Peso | Rubricas |
|-------|------|----------|
| Gestão de SST | 30% | PGR, ISO 45001, participação NR-1.5.3.3, plano de ação |
| Planos de Emergência | 25% | PEI, PAE, simulados |
| Infraestrutura e Acesso | 20% | Análise de vias, obras mitigatórias |
| Cobertura Normativa | 15% | NR setorial, complementares, evidências |
| Indicadores de SST | 10% | TF, TG, proativos |

**Implementação:** Novo schema `score.pilares` e ajuste no prompt para calcular score por pilar. UI atual exibe só score único. Requer mudança em `ResultadoAnalise.tsx` e `persistencia-analise.ts`.

---

### 6. Extração de dados da empresa

`empresa.razao_social`, `cnpj`, `cnae_principal`, `grau_risco`, `responsavel_tecnico`.

**Benefício:** Relatórios mais padronizados e rastreáveis.

**Custo:** Schema e persistência novos; validação de CNPJ; UI para exibir/editar dados da empresa.

---

### 7. KPIs reativos e proativos

`kpis.reativos` (TF, TG, acidentes, doenças ocupacionais) e `kpis.proativos` (quase-acidentes, treinamentos, auditorias).

**Benefício:** Relatórios mais alinhados a padrões de auditoria.

**Custo:** Novo bloco no schema; prompt para extrair KPIs; UI para exibir/editar.

---

### 8. Pipeline completo Documento → JSON → PDF

O prompt inclui pipeline Python (Anthropic → JSON → `gerar_relatorio_sst.py`). O SGN já possui exportação PDF (`/api/export`).

**Ação:** Avaliar se o PDF gerado pelo script Python pode ser substituído ou complementado pela exportação atual do SGN.

---

## Checklist de qualidade (adaptado ao SGN)

Antes de aceitar o JSON do LLM, validar:

- [ ] `score` entre 0 e 100
- [ ] Cada gap tem `evidencias` com `chunkId` (quando RAG ativo)
- [ ] `severidade` em `baixa | media | alta | critica`
- [ ] Se GUT adotado: `probabilidade` e `severidade` entre 1 e 5
- [ ] `pontuacao_gut` = probabilidade × severidade
- [ ] Datas em `YYYY-MM-DD` (quando aplicável)
- [ ] `how_much` como número (float), não string
- [ ] `status` das ações = "NAO_INICIADO" para relatório inicial

---

## Ordem sugerida de adoção

| Fase | Item | Esforço | Impacto |
|------|------|---------|---------|
| 1 | Tabelas GUT no system prompt | Baixo | Médio |
| 2 | Campos `probabilidade`, `pontuacao_gut`, `classificacao` em gaps | Baixo | Alto |
| 3 | Prazos automáticos por classificação | Baixo | Médio |
| 4 | Plano de ação 5W2H (estrutura mínima) | Médio | Alto |
| 5 | NRs aplicáveis por CNAE (refino da auto-sugestão) | Médio | Médio |
| 6 | Score por pilares | Alto | Alto |
| 7 | Extração empresa + KPIs | Alto | Médio |

---

## Referências

- Prompt original: `# PROMPT DE EXTRAÇÃO ESTRUTURADA — SGN SST`
- Schema atual: `src/types/ia.ts`, `src/lib/ia/groq.ts`
- Persistência: `src/lib/ia/persistencia-analise.ts`, `src/lib/db/schema.ts`
- UI: `src/features/analise/components/ResultadoAnalise.tsx`
