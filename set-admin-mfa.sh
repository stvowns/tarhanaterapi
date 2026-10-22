#!/usr/bin/env bash
#
# Yönetici API'lerinde AAL2 (MFA) zorunluluğunu açar/kapatır.
#
# Kullanım:
#   ./set-admin-mfa.sh on
#   ./set-admin-mfa.sh off
#
# "on" yapmadan önce yönetici hesabında TOTP MFA kurulmuş ve doğrulanmış olmalı.
# Aksi halde yönetici panelindeki API çağrıları 401 döner.
#
# Not: Cloudflare secret değişikliği yeni bir deploy ile aktif olur.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_NAME="tarhanaterapi"
MODE="${1:-}"

case "$MODE" in
  on|enable|true)
    VALUE="true"
    ;;
  off|disable|false)
    VALUE="false"
    ;;
  *)
    echo "Kullanım: ./set-admin-mfa.sh on|off" >&2
    exit 2
    ;;
esac

echo "ADMIN_MFA_REQUIRED=${VALUE} Cloudflare Pages projesine yazılıyor..."
printf '%s' "$VALUE" | npx wrangler pages secret put ADMIN_MFA_REQUIRED \
  --project-name "$PROJECT_NAME"

echo
if [ "$VALUE" = "true" ]; then
  echo "MFA zorunluluğu açıldı. Yönetici girişlerinde aal2 oturumu gerekli."
  echo "Değişikliğin aktif olması için yeni bir deploy gerekiyor."
else
  echo "MFA zorunluluğu kapatıldı. Yönetici API'leri tekrar aal1 oturumlarını kabul eder."
  echo "Değişikliğin aktif olması için yeni bir deploy gerekiyor."
fi
