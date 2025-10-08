# Guia Corporativo de Integração: markitdown + SGN

Este guia detalha o processo profissional para integrar o markitdown à plataforma SGN, potencializando a análise documental por IA (Llama via Groq), com foco em escalabilidade, confiabilidade e experiência do usuário.

---

## Índice

1. Benefícios da Integração
2. Arquitetura Recomendada
3. Instalação e Setup
4. Fluxo Profissional de Processamento
5. Exemplo de Códigos (Python/Node.js)
6. Melhores Práticas para Documentos Grandes
7. Armazenamento e Versionamento
8. Logging, Monitoramento e Resiliência
9. Segurança e Compliance
10. FAQ, Referências e Troubleshooting

---

## 1. Benefícios da Integração

- **Conversão robusta e rápida** de DOCX/PDF para Markdown, ideal para análise textual por IA.
- **Redução do ruído visual e formatação**, tornando o texto mais limpo para processamento.
- **Padronização** do conteúdo normativo corporativo.
- **Facilita buscas e indexação**.
- **Melhora a experiência do usuário**: análise mais rápida, feedback claro, visualização amigável.

---

## 2. Arquitetura Recomendada

```mermaid
flowchart TD
  A(Upload Documento) -->|Supabase Storage| B[Documentos aguardando análise]
  B -->|Job criado| C{Worker}
  C -->|Python markitdown| D[Conversão para Markdown]
  D -->|Markdown gerado| E[Envio para IA (Groq/Llama)]
  E --> F[Resultados salvos no Postgres]
  F --> G[Exibição para usuário]
```

- **Worker** pode ser Python, Node.js, ou ambos.
- **Documentos** originais e convertidos ficam disponíveis para auditoria.
- **Jobs** gerenciam filas, priorização, e status.

---

## 3. Instalação e Setup

**Python**

```bash
pip install markitdown
```

**Scripts**

- Crie o script `convert_markitdown.py` para uso no worker:

```python name=scripts/convert_markitdown.py
import sys
from markitdown import convert_file

if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    convert_file(input_file, output_file)
```

---

## 4. Fluxo Profissional de Processamento

### 4.1. Upload

- Frontend envia documento (PDF/DOCX) pelo botão "Analisar com IA".
- Backend armazena no Supabase Storage e registra metadados no Postgres.

### 4.2. Job de Análise

- API cria job na fila, status 'pending'.
- Worker detecta job, baixa arquivo original.

### 4.3. Conversão para Markdown

- Worker executa script Python do markitdown.
- Gera arquivo `.md` correspondente.

### 4.4. Processamento por IA

- Worker lê `.md`, divide em partes (se necessário).
- Envia para Llama via Groq API, com tratamento para arquivos grandes.
- Recebe e salva resultados no banco.

### 4.5. Exibição

- Frontend mostra resultado da análise, permite download do Markdown e original.
- Notificações de sucesso/erro.

---

## 5. Exemplo de Código

### 5.1. Worker Node.js chamando Python

```typescript name=worker/documentProcessor.ts
import { spawn } from "child_process";
import fs from "fs/promises";

async function convertToMarkdown(filePath, mdPath) {
  return new Promise((resolve, reject) => {
    const py = spawn("python3", ["scripts/convert_markitdown.py", filePath, mdPath]);
    py.on("close", code => {
      if (code === 0) resolve(mdPath);
      else reject(new Error("Erro na conversão para Markdown"));
    });
  });
}

// Processamento do job
async function processDocumentJob(documentPath, job) {
  const mdPath = `/tmp/${job.documentoId}.md`;
  await convertToMarkdown(documentPath, mdPath);
  const markdownText = await fs.readFile(mdPath, "utf-8");
  // Divida markdownText em chunks para Groq/Llama se necessário
  // Envie para IA e salve resultados no Postgres
}
```

### 5.2. Worker Python puro

```python name=worker/document_worker.py
from markitdown import convert_file
import groq_llama_api  # Exemplo fictício

def process_document(input_path, output_path, job_id):
    convert_file(input_path, output_path)
    with open(output_path) as f:
        markdown = f.read()
    # Divida markdown se necessário
    # Envie para Groq/Llama e salve resultados
```

---

## 6. Melhores Práticas para Documentos Grandes

- **Chunking:** Divida o Markdown em partes menores (<4k tokens) antes do envio para IA.
- **Fila Prioritária:** Priorize jobs de acordo com o porte do cliente/complexidade.
- **Timeout e Retry:** Implemente tentativas automáticas e tempo máximo por job.
- **Feedback ao usuário:** Mostre barra de progresso, status, e logs amigáveis.

---

## 7. Armazenamento e Versionamento

- Salve o `.md` gerado junto ao documento original no Supabase.
- Mantenha versões (metadados: `versao`, `data_criacao`, `hash`).
- Permita download do Markdown para auditoria e reprocessamento futuro.

---

## 8. Logging, Monitoramento e Resiliência

- Use **Pino** (Node.js) ou **logging** (Python) para logs detalhados.
- Registre cada etapa: upload, conversão, análise IA, resultado.
- Integre métricas: tempo de conversão, tempo de análise, número de jobs.
- Implemente alertas para falhas, lentidão ou arquivos corrompidos.

---

## 9. Segurança e Compliance

- **Controle de acesso**: Use RLS (Row Level Security) no Supabase/Postgres.
- **Auditoria**: Mantenha logs de quem fez uploads, análises e downloads.
- **Backup**: Programe backups automáticos dos arquivos e resultados.
- **LGPD/GDPR**: Garanta anonimização e consentimento conforme necessário.

---

## 10. FAQ, Referências e Troubleshooting

### FAQ

- **Quais formatos são suportados?** PDF, DOCX, DOC.
- **E arquivos grandes?** Suportados, mas recomenda-se dividir o Markdown para análise IA.
- **Posso baixar o Markdown?** Sim, via frontend.

### Referências

- [markitdown - Microsoft](https://github.com/microsoft/markitdown)
- [Groq API Docs](https://groq.com/docs/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Pino Logger](https://getpino.io/)

### Troubleshooting

- **Erro na conversão:** Verifique formato e permissões do arquivo.
- **Timeout da IA:** Divida o texto, tente novamente.
- **Falha no upload:** Cheque logs e status do Supabase.

---

**Dúvidas? Consulte o time técnico SGN.  
Este guia pode ser atualizado conforme novas demandas corporativas.**
