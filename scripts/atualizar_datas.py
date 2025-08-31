#!/usr/bin/env python3
"""
Script para atualizar automaticamente as datas na documentação do SGN.
Execução: python scripts/atualizar_datas.py
"""

import re
import os
from datetime import datetime
from pathlib import Path

def obter_data_atual():
    """Retorna a data atual formatada em português."""
    agora = datetime.now()
    meses = {
        1: 'janeiro', 2: 'fevereiro', 3: 'março', 4: 'abril',
        5: 'maio', 6: 'junho', 7: 'julho', 8: 'agosto',
        9: 'setembro', 10: 'outubro', 11: 'novembro', 12: 'dezembro'
    }
    return f"{agora.day} de {meses[agora.month]} de {agora.year}"

def atualizar_arquivo(caminho_arquivo, padroes_substituicao):
    """Atualiza datas em um arquivo específico."""
    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo:
            conteudo = arquivo.read()
        
        conteudo_original = conteudo
        
        for padrao, substituto in padroes_substituicao:
            conteudo = re.sub(padrao, substituto, conteudo, flags=re.IGNORECASE)
        
        if conteudo != conteudo_original:
            with open(caminho_arquivo, 'w', encoding='utf-8') as arquivo:
                arquivo.write(conteudo)
            print(f"✅ Atualizado: {caminho_arquivo}")
            return True
        else:
            print(f"⏭️  Sem alterações: {caminho_arquivo}")
            return False
    
    except FileNotFoundError:
        print(f"❌ Arquivo não encontrado: {caminho_arquivo}")
        return False
    except Exception as e:
        print(f"❌ Erro ao processar {caminho_arquivo}: {e}")
        return False

def main():
    """Função principal do script."""
    data_atual = obter_data_atual()
    print(f"🗓️  Data atual: {data_atual}")
    
    # Diretório raiz do projeto
    raiz_projeto = Path(__file__).parent.parent
    
    # Padrões de substituição (regex, substituto)
    padroes = [
        # Padrão: **ÚLTIMA ATUALIZAÇÃO:** [data qualquer]
        (r'\*\*ÚLTIMA ATUALIZAÇÃO:\*\*\s+\d{1,2}\s+de\s+\w+\s+de\s+\d{4}', 
         f'**ÚLTIMA ATUALIZAÇÃO:** {data_atual}'),
        
        # Padrão: **Data:** [data qualquer]
        (r'\*\*Data:\*\*\s+\d{1,2}\s+de\s+\w+\s+de\s+\d{4}', 
         f'**Data:** {data_atual}'),
        
        # Padrão: **Data de Última Atualização:** [data qualquer]
        (r'\*\*Data de Última Atualização:\*\*\s+\d{1,2}\s+de\s+\w+\s+de\s+\d{4}', 
         f'**Data de Última Atualização:** {data_atual}'),
        
        # Padrão: (3 Jan 2025) ou similar
        (r'\(\d{1,2}\s+\w{3}\s+\d{4}\)', 
         f'(31 Ago 2025)'),
        
        # Padrão: IMPLEMENTADO (data)
        (r'IMPLEMENTADO\s+\(\d{1,2}\s+\w{3,}\s+\d{4}\)', 
         f'IMPLEMENTADO (31 de agosto de 2025)'),
    ]
    
    # Arquivos a serem atualizados
    arquivos_documentacao = [
        'agente.md',
        'melhorias.md', 
        'pendente.md',
        'plano_de_acao.md',
        'status_implementacao.md'
    ]
    
    arquivos_atualizados = 0
    
    for arquivo in arquivos_documentacao:
        caminho_completo = raiz_projeto / arquivo
        if atualizar_arquivo(caminho_completo, padroes):
            arquivos_atualizados += 1
    
    print(f"\n📊 Resumo:")
    print(f"   • Arquivos processados: {len(arquivos_documentacao)}")
    print(f"   • Arquivos atualizados: {arquivos_atualizados}")
    print(f"   • Data aplicada: {data_atual}")
    
    if arquivos_atualizados > 0:
        print("\n🎯 Próximos passos:")
        print("   1. Revisar as alterações: git diff")
        print("   2. Commit das mudanças: git add . && git commit -m 'docs: atualizar datas automaticamente'")

if __name__ == "__main__":
    main()
