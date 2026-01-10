# Framework de Agente Autônomo (Ralph Wiggum Adaptado)

Este diretório contém um framework minimalista para operar um agente autônomo, adaptado da metodologia "How to Ralph Wiggum" [1], para ser utilizado com o **Cursor (GLM-4.7)** e **WSL (Windows Subsystem for Linux)**. O objetivo é permitir que um LLM (Large Language Model) atue como um agente de desenvolvimento em um loop contínuo de "pensar, agir, validar", mantendo o estado e o plano de trabalho através de arquivos Markdown.

## Metodologia

A metodologia se baseia em um ciclo iterativo onde o agente:
1.  Lê o objetivo (`goal.md`), o estado atual (`state.md`) e a tarefa a ser executada (`task.md`).
2.  Executa uma ação concreta (escrever código, pesquisar, analisar, etc.).
3.  Atualiza o estado (`state.md`) e o plano (`plan.md`) com os resultados da ação.
4.  Prepara a próxima tarefa (`task.md`).

Este ciclo é orquestrado por um script Bash (`loop.sh`) no WSL, que interage com o usuário para acionar o Cursor em cada iteração.

## Estrutura do Diretório `.agent`

-   `goal.md`: Define o objetivo principal e imutável do projeto ou da tarefa atual. O agente deve sempre ter este arquivo em mente para guiar suas ações.
-   `plan.md`: Contém o plano de ação detalhado, geralmente uma lista de tarefas a serem realizadas. O agente é responsável por atualizar este plano, marcando tarefas como concluídas e adicionando novas, se necessário.
-   `state.md`: Armazena o estado atual do projeto, descobertas, informações relevantes, logs de erros, e qualquer contexto que o agente precise lembrar entre as iterações. É o "caderno de anotações" do agente.
-   `task.md`: Contém a descrição da **tarefa específica** que o agente deve executar na iteração atual. Este arquivo serve como o prompt principal para o LLM em cada ciclo.
-   `rules.md`: Contém as instruções de comportamento e as regras que o agente (LLM) deve seguir ao interagir com os arquivos de estado e o código. Este conteúdo deve ser copiado para as `.cursorrules` do Cursor para garantir o comportamento desejado.
-   `loop.sh`: Um script Bash que automatiza o fluxo de trabalho do agente. Ele gerencia as iterações, apresenta a tarefa ao usuário e aguarda a intervenção do Cursor.

## Como Usar

1.  **Configuração Inicial:**
    *   Certifique-se de ter o WSL configurado e o repositório `sgn-sistema_de_gestao_normativa` clonado.
    *   Copie o conteúdo de `rules.md` para o arquivo `.cursorrules` do seu projeto no Cursor. Isso instruirá o GLM-4.7 sobre como operar.
    *   Defina o `goal.md` com o objetivo principal do seu projeto.
    *   Popule o `plan.md` com um plano inicial de alto nível.
    *   Crie um `task.md` com a primeira tarefa a ser executada.

2.  **Executando o Loop:**
    *   Abra um terminal WSL no diretório raiz do seu projeto (`sgn-sistema_de_gestao_normativa`).
    *   Execute o script `loop.sh`:
        ```bash
        ./.agent/loop.sh
        ```
    *   O script irá exibir a `task.md` atual e instruí-lo a interagir com o Cursor.

3.  **Interação com o Cursor:**
    *   No Cursor, abra o arquivo `task.md`.
    *   Use o GLM-4.7 (via Cursor) para ler `goal.md`, `state.md` e `task.md`.
    *   Peça ao GLM-4.7 para executar a tarefa descrita em `task.md`, atualizando `state.md`, `plan.md` e, se necessário, o código do projeto.
    *   Após o GLM-4.7 concluir sua ação e atualizar os arquivos, retorne ao terminal WSL.

4.  **Continuando o Loop:**
    *   Pressione `ENTER` no terminal WSL para que o `loop.sh` continue para a próxima iteração.
    *   O script verificará o `plan.md` e `state.md` para determinar se o objetivo foi atingido. Se sim, o loop será encerrado.

## Exemplo de Fluxo (Iteração 1)

1.  **`loop.sh` inicia:** Exibe o conteúdo de `task.md`.
2.  **Usuário no Cursor:** Abre `task.md`, `goal.md`, `state.md`.
3.  **Prompt para GLM-4.7:** "Com base em `goal.md`, `state.md` e `task.md`, execute a tarefa em `task.md`. Atualize `state.md` e `plan.md` com seu progresso."
4.  **GLM-4.7 (via Cursor) age:** Lê o projeto, lista os diretórios principais em `state.md`, e marca a tarefa como concluída em `plan.md`.
5.  **Usuário no WSL:** Pressiona `ENTER`.
6.  **`loop.sh` continua:** Verifica o estado, e se o objetivo não foi atingido, aguarda a próxima `task.md` (que pode ser atualizada manualmente ou pelo próprio GLM-4.7 na iteração anterior).

## Referências

[1] ghuntley/how-to-ralph-wiggum: *How to Ralph Wiggum* [https://github.com/ghuntley/how-to-ralph-wiggum](https://github.com/ghuntley/how-to-ralph-wiggum)
