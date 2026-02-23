import sqlite3
import time
import os
import json
from datetime import datetime

# Configurações
DB_PATH = './data/sgn.db'
REFRESH_INTERVAL = 1.0  # segundos

def get_latest_job(cursor):
    query = """
    SELECT j.id, j.status, j.progresso, j.documento_id, d.nome_arquivo, j.created_at
    FROM analise_jobs j
    JOIN documentos d ON j.documento_id = d.id
    ORDER BY j.created_at DESC
    LIMIT 1
    """
    cursor.execute(query)
    return cursor.fetchone()

def get_result_summary(cursor, job_id):
    query = """
    SELECT score_geral, nivel_risco, metadata
    FROM analise_resultados
    WHERE job_id = ?
    """
    cursor.execute(query, (job_id,))
    return cursor.fetchone()

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def main():
    print(f"--- SGN LLM Monitor v1.0 ---")
    print(f"Monitorando: {DB_PATH}")
    
    if not os.path.exists(DB_PATH):
        print(f"Erro: Banco de dados não encontrado em {DB_PATH}")
        return

    last_job_id = None
    
    try:
        while True:
            conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
            cursor = conn.cursor()
            
            job = get_latest_job(cursor)
            
            if job:
                job_id, status, progress, doc_id, filename, created_at = job
                
                clear_screen()
                print(f"--- SGN LLM MONITOR - {datetime.now().strftime('%H:%M:%S')} ---")
                print(f"{'='*50}")
                print(f"ID DO JOB:    {job_id}")
                print(f"DOCUMENTO:    {filename}")
                print(f"INÍCIO:       {created_at}")
                print(f"{'='*50}\n")
                
                # Barra de progresso visual
                bar_len = 30
                filled = int(bar_len * progress / 100)
                bar = '█' * filled + '-' * (bar_len - filled)
                
                status_color = ""
                if status == 'completed': status_color = "\033[92m" # Verde
                elif status == 'failed': status_color = "\033[91m"  # Vermelho
                elif status == 'processing': status_color = "\033[94m" # Azul
                
                print(f"STATUS:       {status_color}{status.upper()}\033[0m")
                print(f"PROGRESSO:    [{bar}] {progress}%")
                
                if status == 'completed':
                    result = get_result_summary(cursor, job_id)
                    if result:
                        score, nivel_risco, metadata_json = result
                        metadata = json.loads(metadata_json) if metadata_json else {}
                        
                        print(f"\n{'='*50}")
                        print(f"RESULTADO FINAL:")
                        print(f"SCORE:        {score}/100")
                        print(f"RISCO:        {nivel_risco.upper()}")
                        print(f"RESUMO:       {metadata.get('resumo', 'N/A')[:200]}...")
                        print(f"{'='*50}")
                
                elif status == 'failed':
                    cursor.execute("SELECT erro_detalhes FROM analise_jobs WHERE id = ?", (job_id,))
                    error = cursor.fetchone()
                    print(f"\nERRO: {error[0] if error else 'Desconhecido'}")
                
            else:
                print("Nenhuma análise encontrada no banco de dados.")
            
            conn.close()
            time.sleep(REFRESH_INTERVAL)
            
    except KeyboardInterrupt:
        print("\nMonitoramento encerrado.")
    except Exception as e:
        print(f"\nErro no monitoramento: {e}")

if __name__ == "__main__":
    main()
