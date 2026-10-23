#!/usr/bin/env bash
# Supabase'teki pazarlama onaylı aboneleri Resend contacts/segment ile uzlaştırır.
# Anahtarları sohbetten istemez; ortam değişkenlerinden okur.
#
# Kullanım:
#   export SUPABASE_URL="https://<proje>.supabase.co"
#   export SUPABASE_SERVICE_ROLE_KEY="..."
#   export RESEND_API_KEY="..."
#   ./reconcile-resend.sh
set -euo pipefail

cd "$(dirname "$0")"

for var in SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY RESEND_API_KEY; do
  if [ -z "${!var:-}" ]; then
    echo "Eksik ortam değişkeni: $var" >&2
    exit 1
  fi
done

node scripts/reconcile-resend.mjs
