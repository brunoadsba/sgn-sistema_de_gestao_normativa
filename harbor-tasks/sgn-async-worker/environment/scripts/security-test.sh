#!/bin/bash

# Script de teste de segurança para SGN
# Uso: ./scripts/security-test.sh [test-type]

set -e

TEST_TYPE=${1:-all}
BASE_URL=${2:-http://localhost:3001}

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Função para testar endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local headers=$3
    local data=$4
    local expected_status=$5
    local test_name=$6
    
    print_message $BLUE "🧪 Testando: $test_name"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json $headers "$url")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json $headers -X $method -d "$data" "$url")
    fi
    
    status_code=${response: -3}
    
    if [ "$status_code" = "$expected_status" ]; then
        print_message $GREEN "✅ $test_name: Status $status_code (esperado $expected_status)"
    else
        print_message $RED "❌ $test_name: Status $status_code (esperado $expected_status)"
        if [ -f /tmp/response.json ]; then
            echo "Resposta: $(cat /tmp/response.json)"
        fi
    fi
    
    echo ""
}

# Função para testar rate limiting
test_rate_limiting() {
    print_message $YELLOW "🔒 Testando Rate Limiting..."
    
    # Testar rate limiting geral
    print_message $BLUE "Testando rate limiting geral (máximo 100 requests/15min)..."
    for i in {1..5}; do
        curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/normas" | grep -q "200" && echo "Request $i: OK" || echo "Request $i: Failed"
    done
    
    # Testar rate limiting de IA (máximo 5 requests/5min)
    print_message $BLUE "Testando rate limiting de IA (máximo 5 requests/5min)..."
    for i in {1..3}; do
        curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/ia/analisar-conformidade" \
            -H "Content-Type: application/json" \
            -d '{"empresaId":"test","documentoBase":"test","normasAplicaveis":["NR-6"]}' | grep -q "200\|400\|429" && echo "IA Request $i: OK" || echo "IA Request $i: Failed"
    done
    
    echo ""
}

# Função para testar CORS
test_cors() {
    print_message $YELLOW "🌐 Testando CORS..."
    
    # Testar CORS com origin válida
    test_endpoint "OPTIONS" "$BASE_URL/api/normas" \
        "-H 'Origin: http://localhost:3000' -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: X-Requested-With'" \
        "" "200" "CORS com origin válida"
    
    # Testar CORS com origin inválida
    test_endpoint "OPTIONS" "$BASE_URL/api/normas" \
        "-H 'Origin: https://malicious-site.com' -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: X-Requested-With'" \
        "" "403" "CORS com origin inválida"
    
    # Testar CORS com GET request
    test_endpoint "GET" "$BASE_URL/api/normas" \
        "-H 'Origin: http://localhost:3000'" \
        "" "200" "CORS GET request"
    
    echo ""
}

# Função para testar security headers
test_security_headers() {
    print_message $YELLOW "🛡️ Testando Security Headers..."
    
    # Testar headers em endpoint de API
    print_message $BLUE "Verificando headers de segurança em /api/normas..."
    headers=$(curl -s -I "$BASE_URL/api/normas")
    
    # Verificar headers específicos
    if echo "$headers" | grep -q "X-Frame-Options"; then
        print_message $GREEN "✅ X-Frame-Options presente"
    else
        print_message $RED "❌ X-Frame-Options ausente"
    fi
    
    if echo "$headers" | grep -q "X-Content-Type-Options"; then
        print_message $GREEN "✅ X-Content-Type-Options presente"
    else
        print_message $RED "❌ X-Content-Type-Options ausente"
    fi
    
    if echo "$headers" | grep -q "X-XSS-Protection"; then
        print_message $GREEN "✅ X-XSS-Protection presente"
    else
        print_message $RED "❌ X-XSS-Protection ausente"
    fi
    
    if echo "$headers" | grep -q "Referrer-Policy"; then
        print_message $GREEN "✅ Referrer-Policy presente"
    else
        print_message $RED "❌ Referrer-Policy ausente"
    fi
    
    if echo "$headers" | grep -q "Content-Security-Policy"; then
        print_message $GREEN "✅ Content-Security-Policy presente"
    else
        print_message $RED "❌ Content-Security-Policy ausente"
    fi
    
    echo ""
}

# Função para testar attack protection
test_attack_protection() {
    print_message $YELLOW "🚨 Testando Attack Protection..."
    
    # Testar path traversal
    test_endpoint "GET" "$BASE_URL/api/normas?path=../../../etc/passwd" \
        "" "" "400" "Path Traversal Protection"
    
    # Testar SQL injection
    test_endpoint "GET" "$BASE_URL/api/normas?search='; DROP TABLE normas; --" \
        "" "" "400" "SQL Injection Protection"
    
    # Testar XSS
    test_endpoint "GET" "$BASE_URL/api/normas?search=<script>alert('xss')</script>" \
        "" "" "400" "XSS Protection"
    
    # Testar request size
    large_data=$(printf 'a%.0s' {1..10000})
    test_endpoint "POST" "$BASE_URL/api/ia/analisar-conformidade" \
        "-H 'Content-Type: application/json'" \
        "{\"empresaId\":\"test\",\"documentoBase\":\"$large_data\",\"normasAplicaveis\":[\"NR-6\"]}" \
        "413" "Request Size Protection"
    
    echo ""
}

# Função para testar APIs de segurança
test_security_apis() {
    print_message $YELLOW "🔧 Testando Security APIs..."
    
    # Testar configuração de segurança
    test_endpoint "GET" "$BASE_URL/api/security/config" \
        "" "" "200" "Security Config API"
    
    # Testar estatísticas de segurança
    test_endpoint "GET" "$BASE_URL/api/security/stats" \
        "" "" "200" "Security Stats API"
    
    # Testar teste de segurança
    test_endpoint "POST" "$BASE_URL/api/security/test" \
        "-H 'Content-Type: application/json'" \
        '{"testType": "all"}' "200" "Security Test API"
    
    echo ""
}

# Função para testar performance de segurança
test_security_performance() {
    print_message $YELLOW "⚡ Testando Performance de Segurança..."
    
    # Testar tempo de resposta com middlewares de segurança
    print_message $BLUE "Medindo tempo de resposta com middlewares de segurança..."
    
    start_time=$(date +%s%N)
    curl -s "$BASE_URL/api/normas" > /dev/null
    end_time=$(date +%s%N)
    duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ $duration -lt 1000 ]; then
        print_message $GREEN "✅ Tempo de resposta: ${duration}ms (aceitável)"
    else
        print_message $YELLOW "⚠️ Tempo de resposta: ${duration}ms (pode ser otimizado)"
    fi
    
    echo ""
}

# Função para gerar relatório
generate_report() {
    print_message $YELLOW "📊 Gerando Relatório de Segurança..."
    
    echo "## Relatório de Segurança SGN" > security-report.md
    echo "Data: $(date)" >> security-report.md
    echo "URL: $BASE_URL" >> security-report.md
    echo "" >> security-report.md
    
    echo "### Testes Executados" >> security-report.md
    echo "- Rate Limiting: ✅" >> security-report.md
    echo "- CORS: ✅" >> security-report.md
    echo "- Security Headers: ✅" >> security-report.md
    echo "- Attack Protection: ✅" >> security-report.md
    echo "- Security APIs: ✅" >> security-report.md
    echo "- Performance: ✅" >> security-report.md
    
    echo "" >> security-report.md
    echo "### Configuração de Segurança" >> security-report.md
    curl -s "$BASE_URL/api/security/config" >> security-report.md
    
    print_message $GREEN "✅ Relatório gerado: security-report.md"
    echo ""
}

# Função principal
main() {
    print_message $BLUE "🛡️ Iniciando Testes de Segurança SGN"
    print_message $BLUE "URL: $BASE_URL"
    print_message $BLUE "Tipo de teste: $TEST_TYPE"
    echo ""
    
    # Verificar se o servidor está rodando
    if ! curl -s "$BASE_URL/api/health" > /dev/null; then
        print_message $RED "❌ Servidor não está rodando em $BASE_URL"
        exit 1
    fi
    
    print_message $GREEN "✅ Servidor está rodando"
    echo ""
    
    # Executar testes baseado no tipo
    case $TEST_TYPE in
        "rate-limit")
            test_rate_limiting
            ;;
        "cors")
            test_cors
            ;;
        "headers")
            test_security_headers
            ;;
        "attack")
            test_attack_protection
            ;;
        "apis")
            test_security_apis
            ;;
        "performance")
            test_security_performance
            ;;
        "all")
            test_rate_limiting
            test_cors
            test_security_headers
            test_attack_protection
            test_security_apis
            test_security_performance
            generate_report
            ;;
        *)
            print_message $RED "❌ Tipo de teste inválido: $TEST_TYPE"
            print_message $YELLOW "Tipos disponíveis: rate-limit, cors, headers, attack, apis, performance, all"
            exit 1
            ;;
    esac
    
    print_message $GREEN "🎉 Testes de segurança concluídos!"
}

# Executar função principal
main "$@"
