#!/bin/bash

# Configurações iniciais
AGENT_DIR=".agent"
GOAL_FILE="$AGENT_DIR/goal.md"
PLAN_FILE="$AGENT_DIR/plan.md"
STATE_FILE="$AGENT_DIR/state.md"
TASK_FILE="$AGENT_DIR/task.md"
RULES_FILE="$AGENT_DIR/rules.md"

# Função para exibir mensagens coloridas
print_info() {
    echo -e "\e[34m[INFO]\e[0m $1"
}

print_success() {
    echo -e "\e[32m[SUCCESS]\e[0m $1"
}

print_error() {
    echo -e "\e[31m[ERROR]\e[0m $1"
}

# Verificar se os arquivos necessários existem
if [ ! -f "$GOAL_FILE" ] || [ ! -f "$PLAN_FILE" ] || [ ! -f "$STATE_FILE" ] || [ ! -f "$TASK_FILE" ] || [ ! -f "$RULES_FILE" ]; then
    print_error "Arquivos do agente não encontrados no diretório $AGENT_DIR."
    exit 1
fi

# Loop principal
ITERATION=1
while true; do
    print_info "Iniciando iteração $ITERATION..."

    # 1. Ler a tarefa atual
    TASK=$(cat "$TASK_FILE")
    print_info "Tarefa atual: $TASK"

    # 2. Notificar o usuário para executar a tarefa no Cursor
    echo "--------------------------------------------------------------------------------"
    echo "POR FAVOR, EXECUTE A TAREFA NO CURSOR (GLM-4.7):"
    echo "1. Abra o arquivo $TASK_FILE no Cursor."
    echo "2. Peça ao Cursor para executar a tarefa descrita no arquivo, seguindo as regras em $RULES_FILE."
    echo "3. Após o Cursor terminar de atualizar os arquivos de estado e o código, pressione ENTER aqui para continuar."
    echo "--------------------------------------------------------------------------------"
    read -p "Pressione ENTER para continuar..."

    # 3. Verificar se o objetivo foi atingido
    if grep -q "DONE" "$PLAN_FILE" || grep -q "OBJETIVO ATINGIDO" "$STATE_FILE"; then
        print_success "Objetivo atingido! Finalizando o loop."
        break
    fi

    # 4. Preparar a próxima tarefa (opcional, o Cursor pode fazer isso)
    # Aqui poderíamos adicionar lógica para extrair a próxima tarefa do plan.md e atualizar o task.md automaticamente.
    # Por enquanto, vamos deixar o Cursor gerenciar o task.md conforme as regras.

    ITERATION=$((ITERATION + 1))
    print_success "Iteração $ITERATION concluída."
done
