#!/usr/bin/env python3
import requests
import json
import os
import sys
import time

BASE_URL = "http://localhost:3001/api/ia/analisar-conformidade"
DATA_DIR = "e2e/evals/golden-dataset"
GROUND_TRUTH_PATH = os.path.join(DATA_DIR, "ground-truth.json")

def load_ground_truth():
    with open(GROUND_TRUTH_PATH, 'r') as f:
        return json.load(f)

def run_analysis(file_path, normas):
    with open(file_path, 'r') as f:
        documento = f.read()
    
    payload = {
        "documento": documento,
        "normasAplicaveis": normas,
        "tipoDocumento": "OUTRO"
    }
    
    try:
        response = requests.post(BASE_URL, json=payload, timeout=60)
        if response.status_code != 200:
            print(f"\n[ERROR] API returned {response.status_code}: {response.text}")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # print(f"Error calling API for {file_path}: {e}")
        return None

def evaluate(case, response_data):
    if not response_data or "data" not in response_data:
        return 0, 0, len(case["expected_gaps"])

    gaps_found = response_data["data"].get("gaps", [])
    expected_gaps = case["expected_gaps"]
    
    tp = 0
    matched_expected = set()
    matched_found = set()
    
    for i, exp in enumerate(expected_gaps):
        for j, found in enumerate(gaps_found):
            if j in matched_found: continue
            
            # Match by Norma (mais flexível - busca em evidências ou descrição)
            def clean_norma(n):
                if not n: return ""
                return n.upper().replace("NR", "").replace("-", "").lstrip("0")

            norma_clean = clean_norma(exp["norma"])
            found_norma_clean = clean_norma(found.get("codigoNorma", ""))
            found_normas_evidencias = [clean_norma(e.get("normaCodigo", "")) for e in found.get("evidencias", [])]
            found_desc_upper = found.get("descricao", "").upper()
            
            same_norma = (norma_clean == found_norma_clean) or (norma_clean in found_desc_upper) or (norma_clean in found_normas_evidencias)
            
            # Match by Keywords (basta 1 keyword parcial)
            content_to_check = (found.get("descricao", "") + " " + found.get("recomendacao", "")).lower()
            keyword_match = any(kw.lower() in content_to_check for kw in exp["keywords"])
            
            if same_norma and keyword_match:
                tp += 1
                matched_expected.add(i)
                matched_found.add(j)
                break
    
    fp = len(gaps_found) - len(matched_found)
    fn = len(expected_gaps) - len(matched_expected)
    
    return tp, fp, fn

def main():
    print("="*60)
    print("SGN HARBOR SCORECARD - LLM EVALUATION")
    print("="*60)
    
    gt = load_ground_truth()
    results = []
    
    total_tp = 0
    total_fp = 0
    total_fn = 0
    
    for case in gt["test_cases"]:
        file_path = os.path.join(DATA_DIR, case["file"])
        print(f"Running Test Case: {case['id']} ({case['file']})...", end="", flush=True)
        
        start_time = time.time()
        print(f" Normas: {case['normas']}", end="", flush=True)
        resp = run_analysis(file_path, case["normas"])
        duration = time.time() - start_time
        
        if resp:
            tp, fp, fn = evaluate(case, resp)
            total_tp += tp
            total_fp += fp
            total_fn += fn
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            
            print(f" DONE in {duration:.2f}s | F1: {f1:.2f} | P: {precision:.2f} | R: {recall:.2f}")
            results.append({
                "id": case["id"],
                "tp": tp, "fp": fp, "fn": fn,
                "f1": f1
            })
        else:
            print(" FAILED")
    
    # Final Metrics
    final_p = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0
    final_r = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0
    final_f1 = 2 * (final_p * final_r) / (final_p + final_r) if (final_p + final_r) > 0 else 0
    
    print("="*60)
    print(f"FINAL SCORECARD SUMMARY")
    print(f"Precision: {final_p:.2f}")
    print(f"Recall:    {final_r:.2f}")
    print(f"F1-Score:  {final_f1:.2f}")
    print(f"Total TP: {total_tp} | Total FP: {total_fp} | Total FN: {total_fn}")
    print("="*60)

if __name__ == "__main__":
    main()
