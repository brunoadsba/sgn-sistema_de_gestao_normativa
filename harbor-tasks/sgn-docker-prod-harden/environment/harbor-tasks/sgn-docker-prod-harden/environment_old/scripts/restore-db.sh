#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: ./scripts/restore-db.sh <arquivo-backup.db.gz>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="${DATABASE_PATH:-$ROOT_DIR/data/sgn.db}"
BACKUP_FILE="$1"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Arquivo de backup não encontrado: $BACKUP_FILE"
  exit 1
fi

mkdir -p "$(dirname "$DB_PATH")"

TMP_FILE="$(mktemp)"
gunzip -c "$BACKUP_FILE" > "$TMP_FILE"
mv "$TMP_FILE" "$DB_PATH"

echo "Banco restaurado com sucesso em: $DB_PATH"
