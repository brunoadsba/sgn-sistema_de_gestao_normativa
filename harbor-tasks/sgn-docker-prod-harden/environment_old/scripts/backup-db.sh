#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="${DATABASE_PATH:-$ROOT_DIR/data/sgn.db}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

if [[ ! -f "$DB_PATH" ]]; then
  echo "Banco não encontrado em: $DB_PATH"
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/sgn-$TIMESTAMP.db"

cp "$DB_PATH" "$BACKUP_FILE"
gzip -f "$BACKUP_FILE"

find "$BACKUP_DIR" -name "sgn-*.db.gz" -mtime "+$RETENTION_DAYS" -delete

echo "Backup criado: ${BACKUP_FILE}.gz"
