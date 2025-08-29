SGN - Mínimo Produto Viável (MVP)
Passo a Passo para Implementação do MVP
Para colocar o sistema em funcionamento, focaremos nas funcionalidades essenciais que
entregam o valor principal: coletar, armazenar, processar e exibir as informações de normas.
Etapa 1: Configuração da Infraestrutura Básica
1. Conta no Supabase: Crie um novo projeto no Supabase. Ele servirá como seu banco
de dados PostgreSQL e sistema de autenticação.
2. Configuração do Banco de Dados: No seu projeto Supabase, crie as tabelas
essenciais conforme o modelo de dados definido:
○ normas
○ versoes
○ mudancas
○ Nota: A tabela empresa_normas pode ser simplificada ou adiada no MVP inicial
se o foco for apenas no monitoramento geral das normas.
3. Ambiente de Desenvolvimento: Configure um projeto Next.js localmente. Instale as
dependências necessárias, como o cliente do Supabase para JavaScript.
4. Conta no N8N: Crie uma conta no N8N (pode ser na nuvem ou auto-hospedado) para
a automação de coleta de dados.
Etapa 2: Automação da Coleta de Dados
1. Desenvolver o Fluxo de Scraping no N8N:
○ Crie um novo fluxo de trabalho no N8N para fazer o scraping (coleta) das
normas e leis de sites oficiais.
○ Configure o fluxo para extrair informações como código da norma, título, órgão
publicador e o conteúdo ou link do texto integral.
2. Integrar N8N com Supabase:
○ Adicione um nó do Supabase ao final do seu fluxo no N8N.
○ Configure este nó para inserir ou atualizar os dados coletados nas tabelas
normas e versoes do seu banco de dados. O fluxo deve ser capaz de identificar
se uma norma é nova ou se é uma nova versão de uma norma existente.Etapa 3: Desenvolvimento do Backend e IA
1. Criação das API Routes no Next.js:
○ Desenvolva os endpoints de API necessários para que o frontend possa
consultar os dados do Supabase. Para o MVP, você precisará de, no mínimo:
1. Um endpoint para listar todas as normas.
2. Um endpoint para buscar os detalhes de uma norma específica, incluindo
seu histórico de versões e as mudanças identificadas.
2. Integração com LLM (Modelo de Linguagem):
○ Crie um fluxo (pode ser no N8N ou um serviço no backend) que é acionado
sempre que uma nova versão de uma norma é adicionada ao banco de dados.
○ Este fluxo deve:
1. Buscar o conteúdo da versão nova e da anterior no Supabase.
2. Enviar os dois textos para um modelo de linguagem (LLM) com um
prompt para comparar as versões, identificar as mudanças e gerar um
resumo.
3. Salvar o resumo gerado e o impacto estimado na tabela
mudancas, associando as versões antiga e nova.
Etapa 4: Desenvolvimento do Frontend
1. Criar a Página Principal (Dashboard):
○ Desenvolva a interface do usuário utilizando Next.js e TypeScript.
○ Esta tela deve consumir a API criada na Etapa 3 para exibir uma lista das
normas monitoradas.
○ Para cada norma, exiba informações básicas como código, título e a data da
última atualização.
2. Página de Detalhes da Norma:
○ Ao clicar em uma norma na lista, o usuário deve ser levado para uma página de
detalhes.
○ Esta página deve mostrar:
■ As informações completas da norma.
■ Uma lista das mudanças (tabela
mudancas) com o resumo gerado pela IA e o impacto.
■ O histórico de versões da norma (tabela
versoes).