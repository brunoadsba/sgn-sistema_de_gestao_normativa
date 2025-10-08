# Levantamento de Requisitos e Entendimento do Negócio – Automação LTCAT

**Responsáveis – SESI:** Marcos Vinicio, Bruno Almeida  
**Última Atualização:** 12/08/2025

## Histórico de Revisões

| Data | Versão | Descrição da Alteração | Autor |
|------|--------|------------------------|-------|
| 18.07.2025 | 1.0 | Informações adicionais foram coletadas com Helder durante reunião | Bruno |
| 23.07.2025 | 1.1 | Detalhamento das atividades do sistema | Bruno |
| 25.07.2025 | 1.2 | Apresentação do Fluxo com automação e sugestão de ajustes com Helder | Bruno |

## Identificação dos Envolvidos

| Papel | Nome | E-mail |
|-------|------|--------|
| Analistas de Requisitos | Marcos Vinício | mvinicio@fieb.org.br |
| Analistas de Requisitos | Bruno Almeida | bruno.as@fieb.org.br |
| Analistas de Requisitos | Helder Andrade | helder.andrade@fieb.org.br |
| Analistas de Requisitos | Josemar Araújo | josemars@fieb.org.br |
| Analistas de Requisitos | Luiza Pereira | luiza.pereira@fieb.org.br |

## Problemas de Negócio Identificados

As avaliações qualitativas que são realizadas pelos Técnicos e Engenheiros de Segurança algumas vezes não incluem os dados obrigatórios: **EPIs, exposição, fonte geradora, técnicas empregadas e "ausência de exposição"**.

Esses dados faltantes implicam em ineficiência e imprecisão na geração das informações, dificultando a elaboração do LTCAT.

### Fluxo atual de elaboração do LTCAT (As Is)

A interrupção no fluxo da elaboração do LTCAT ocorre devido à necessidade de contato com as unidades (Técnicos e Engenheiros de Segurança) para corrigir os dados. Eventualmente há retrabalho, pois todos os campos exigem validação manual antes da análise. Isso gera atrasos nas entregas, já que a etapa de adequação de dados consome tempo excessivo.

**Atualmente a elaboração do LTCAT consome aproximadamente duas horas de trabalho de um profissional da equipe.**

### Processo Manual Atual

1. **Acesso ao Sistema SOC**
   - Acessar: https://sistema.soc.com.br/WebSoc
   - Inserir Login, Senha e ID
   - Selecionar Unidade Operacional (UO)
   - Digitar nome da empresa no campo "Localizar Empresas"
   - Digitar "358" no campo "Cód. Prog" (tela GHE)

2. **Verificação de Inconsistências**
   - Selecionar "SEDE" na Unidade
   - Verificar inconsistências nos GES
   - GES administrativos devem conter: "Ausência de agente nocivo ou de atividades previstas no Anexo IV do Decreto 3.048/1999"

3. **Geração do Rascunho**
   - Acessar tela 1105
   - Inserir data em "Medição a partir de:"
   - Clicar em "Gerar Pedido de Processamento"
   - Salvar parâmetros e consultar pedidos
   - Fazer download do arquivo zip

4. **Análise do Rascunho**
   - Extrair zip e abrir documento docx
   - Analisar Inventário de Riscos
   - Verificar Tabela de Identificação e Avaliação de Risco por GES
   - Comunicar ajustes necessários ao responsável pelo PGR

5. **Correções e Pareceres**
   - Retornar à tela 358
   - Preencher campos de parecer técnico
   - Marcar aposentadoria especial se aplicável
   - Inserir tempo de contribuição
   - Repetir processo para todos os GES

6. **Emissão Final**
   - Retornar à tela 1105
   - Marcar quadros necessários para composição do documento
   - Gerar pedido de processamento
   - Fazer download do arquivo final
   - Enviar para ChatGPT (LLM) para formatação ABNT
   - Gerar PDF final
   - Enviar para assinatura do engenheiro

## Resultados Esperados

Desenvolver uma automação para o processo de elaboração do LTCAT, através de um sistema, visando a redução de tempo e retrabalho por parte da equipe operacional que atua neste processo.

> **IMPORTANTE:** Neste primeiro momento estamos considerando os riscos físicos de ruído e vibração.

**A expectativa é que o sistema permita que a elaboração do LTCAT seja reduzida para aproximadamente 20 minutos.**

## Requisitos Funcionais

### 3.1 Acesso e Preenchimento Inicial
- Acessar o SESI Digital
- Selecionar o sistema LTCAT
- Inserir dados: Unidade Operacional, Empresa e Estabelecimento

### 3.2 Verificação de Campos Obrigatórios
- Clicar no botão 'CHECAR PGR'
- Sistema verifica se campos obrigatórios foram lançados no INVENTÁRIO DE RISCO
- Retorna tela com dados para verificação de inconsistências

### 3.3 Ação em Caso de Campos Pendentes
- Clicar em 'Gerar e enviar relatório de inconsistências'
- Responsável pelo PGR recebe e-mail sobre campos pendentes
- Responsável pelo PGR realiza ajustes e confirma via e-mail
- Responsável pelo LTCAT clica novamente em 'CHECAR PGR'

### 3.4 Emissão do LTCAT
- Clicar no botão 'Emitir LTCAT'
- Robô busca informações no S+
- Processa dados considerando:
  - Lógica dos pareceres do SESI
  - Anexo IV da lei 3.048
  - NR 15
- Preenche tela do LTCAT automaticamente
- Responsável valida pareceres e campos sugeridos
- Define assinante do documento

### 3.5 Integração com o Sistema S+
O RPA (Processo de Automação Robótica) realizará:

1. **Acesso ao Sistema S+**
   - Link: https://www.sesivivamais.com.br/smais/
   - Login com usuário de integração SESI Digital x S+
   - Seleção da franqueada

2. **Processamento dos Dados**
   - Digitar e clicar na empresa selecionada
   - Acessar TELA 358 – GHE
   - Clicar em cada GES
   - Processar riscos físicos (ruído e vibração)
   - Lançar Aposentadoria Especial para cada risco
   - Gerar conclusão do parecer do GES/GHE

3. **Finalização**
   - Gerar LTCAT completo
   - Enviar para LLM realizar formatação padrão
   - Disponibilizar para download

### 3.6 Finalização do Documento
- Download do documento formatado
- Revisão manual se necessário
- Geração da versão final em PDF
- Assinatura na plataforma de assinatura
- Armazenamento no SESI GED do S+

## GLOSSÁRIO

- **LTCAT:** Laudo Técnico das Condições Ambientais de Trabalho
- **PGR:** Programa de Gerenciamento de Riscos
- **Inventário de Riscos:** Levantamento de Riscos que existem no ambiente laboral
- **EPI:** Equipamento de Proteção Individual
- **C.A:** Certificado de Aprovação de EPI
- **SESI Digital:** Plataforma online do SESI
- **S+:** Sistema Integrado de Gestão do SESI
- **SESI GED:** Gerenciamento Eletrônico de Documentos do SESI
- **RPA:** Robotic Process Automation - Processo de Automação Robótica
- **LLM:** Large Language Model – Modelo de Linguagem de Grande Escala
- **Responsável Técnico:** Profissional habilitado que responde legalmente por projetos e serviços técnicos
- **Responsável pelo LTCAT:** Engenheiro de Segurança que elabora o Laudo Técnico das Condições Ambientais do Trabalho
- **Responsável pelo PGR:** Profissional que elabora o Programa de Gerenciamento de Riscos
- **Engenheiro de Segurança do Trabalho:** Engenheiro especializado, registrado no CREA, elabora laudos e programas de segurança
- **Técnico em Segurança do Trabalho:** Técnico registrado no MTE, elabora PGR, consultoria em SST
