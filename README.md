# SGN - Sistema de Gestão Normativa

Plataforma de análise de conformidade em Saúde e Segurança no Trabalho (SST) com Inteligência Artificial. O SGN ajuda sua empresa a verificar se documentos e processos estão em conformidade com as Normas Regulamentadoras (NRs) brasileiras.

## Para quem é o SGN

- Profissionais de SST e técnicos de segurança
- Gestores que precisam auditar conformidade
- Empresas que querem identificar gaps antes de fiscalizações

## O que você pode fazer

| Funcionalidade | Descrição |
|----------------|-----------|
| **Analisar** | Envie um documento (PDF, DOCX, etc.), escolha as NRs aplicáveis e receba uma análise automática com IA. O sistema indica conformidades, gaps e recomendações. |
| **Empresas** | Cadastre e visualize empresas. Acesse detalhes, documentos e análises de conformidade por empresa. |
| **Normas** | Consulte o catálogo de NRs disponíveis para análise. |
| **NR-6** | Análise específica para EPIs (Equipamentos de Proteção Individual): documentação, treinamento e adequação às exigências da NR-6. |

## Como usar

### 1. Análise de conformidade (página inicial)

1. Acesse a página inicial.
2. Faça upload do documento SST (PGR, PCMSO, LTCAT, etc.).
3. Selecione as NRs que deseja verificar.
4. Clique em **Analisar Conformidade com IA**.
5. Aguarde a extração do texto e a análise. O resultado exibe:
   - Pontuação de conformidade
   - Gaps identificados (descrição, severidade, recomendação)
   - Resumo geral

### 2. Gerenciar empresas

1. Acesse **Empresas** no menu.
2. Use a busca para localizar empresas.
3. Clique em uma empresa para ver detalhes, documentos e análises de conformidade vinculadas.

### 3. Consultar normas

1. Acesse **Normas** no menu.
2. Use a busca para encontrar NRs.
3. Clique em uma norma para ver detalhes e conteúdo.

### 4. Análise NR-6 (EPIs)

1. Acesse **NR6** no menu (ou pela rota `/nr6`).
2. Informe o texto do documento ou faça upload.
3. Selecione o tipo de documento e a empresa.
4. Clique em analisar para obter o resultado focado em EPIs.

## Como iniciar o sistema

### Pré-requisitos

- Node.js 18 ou superior
- Chave de API do GROQ (para a análise com IA)

### Passos

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie o arquivo de configuração:
   ```bash
   cp .env.example .env.local
   ```

3. Edite `.env.local` e defina sua chave de API:
   ```bash
   GROQ_API_KEY=sua_chave_aqui
   ```

4. (Opcional) Carregue dados de exemplo:
   ```bash
   npm run db:seed
   ```

5. Inicie o sistema:
   ```bash
   npm run dev
   ```

6. Acesse `http://localhost:3001` no navegador.

### Com Docker

Se preferir rodar com Docker:

```bash
npm run docker:start
```

O sistema estará disponível em `http://localhost:3001`.

## Dicas de uso

- **Documentos suportados:** PDF, DOCX, TXT. O sistema extrai o texto automaticamente.
- **Normas:** Comece com NR-6 (EPI), NR-5 (CIPA), NR-7 (PCMSO) ou NR-9 (PPRA) conforme o tipo de documento.
- **Empresa:** Informe o ID da empresa quando fizer análises para vincular os resultados ao cadastro.

## Problemas comuns

| Situação | O que fazer |
|----------|-------------|
| Erro ao extrair texto | Verifique se o documento não está protegido ou corrompido. Tente um PDF sem senha ou imagem. |
| Análise demora muito | A IA pode levar alguns segundos. Aguarde a conclusão. |
| GROQ_API_KEY inválida | Confirme que a chave está correta em `.env.local` e que a conta GROQ está ativa. |

## Documentação técnica

Para detalhes de arquitetura, API e contribuição:

- `docs/memory.md` — estado do projeto e próximos passos
- `docs/sql/arquitetura.md` — arquitetura e banco de dados
- `docs/Guia-Vercel.md` — referência Skills.sh para agentes IA
- `SECURITY.md` — segurança
- `CONTRIBUTING.md` — como contribuir
