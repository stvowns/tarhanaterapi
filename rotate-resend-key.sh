#!/usr/bin/env bash
#
# Resend API key rotasyonu
# -----------------------
# Bu script:
#   1. Yeni Resend API key'ini gizli olarak sorar.
#   2. Key'i Resend API'sinde doğrular (domains + audiences erişimi).
#   3. Geçerliyse Cloudflare Pages projesine RESEND_API_KEY olarak yazar.
#
# Kullanım:
#   ./rotate-resend-key.sh
#
# Not: Eski key'i bu script silmez. Yeni key deploy edilip test edildikten
# sonra Resend panelinden eski key'i iptal et.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_NAME="tarhanaterapi"

cleanup() {
  unset RESEND_API_KEY 2>/dev/null || true
  rm -f "${DOMAINS_BODY:-}" "${AUDIENCES_BODY:-}" 2>/dev/null || true
}
trap cleanup EXIT

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "HATA: '$1' bulunamadı." >&2
    exit 1
  fi
}

need curl
need python3
need npx

echo "== Resend API key doğrulama ve Cloudflare'e kaydetme =="
echo
echo "Not: Yeni key 'Full access' olmalı. Uygulama contacts/audience API'sini de kullanıyor."
echo
read -rsp "Yeni Resend API key (gizli giriş): " RESEND_API_KEY
echo
if [ -z "${RESEND_API_KEY:-}" ]; then
  echo "HATA: API key boş olamaz." >&2
  exit 1
fi

DOMAINS_BODY="$(mktemp)"
AUDIENCES_BODY="$(mktemp)"

echo
echo "[1/3] Domains erişimi kontrol ediliyor..."
DOMAINS_HTTP="$(curl -sS -o "$DOMAINS_BODY" -w "%{http_code}" \
  -H "Authorization: Bearer ${RESEND_API_KEY}" \
  "https://api.resend.com/domains")"

if [ "$DOMAINS_HTTP" != "200" ]; then
  echo "HATA: Resend domains isteği HTTP ${DOMAINS_HTTP} döndü." >&2
  cat "$DOMAINS_BODY" >&2
  echo >&2
  echo "Key geçersiz olabilir veya yetkisi yetersiz." >&2
  exit 1
fi

python3 -c '
import json, sys
with open(sys.argv[1], encoding="utf-8") as f:
    data = json.load(f)
items = data.get("data", [])
print("  Domains erişimi OK. Kayıtlı domain sayısı: " + str(len(items)))
' "$DOMAINS_BODY"

echo
echo "[2/3] Audiences/contacts erişimi kontrol ediliyor..."
AUDIENCES_HTTP="$(curl -sS -o "$AUDIENCES_BODY" -w "%{http_code}" \
  -H "Authorization: Bearer ${RESEND_API_KEY}" \
  "https://api.resend.com/audiences")"

if [ "$AUDIENCES_HTTP" != "200" ]; then
  echo "HATA: Resend audiences isteği HTTP ${AUDIENCES_HTTP} döndü." >&2
  cat "$AUDIENCES_BODY" >&2
  echo >&2
  echo "Bu key muhtemelen 'Sending access'. 'Full access' bir key oluşturup tekrar dene." >&2
  exit 1
fi

python3 -c '
import json, sys
with open(sys.argv[1], encoding="utf-8") as f:
    data = json.load(f)
items = data.get("data", [])
print("  Audiences erişimi OK. Audience sayısı: " + str(len(items)))
' "$AUDIENCES_BODY"

echo
echo "[3/3] Key Cloudflare'a RESEND_API_KEY olarak yazılıyor..."
printf '%s' "$RESEND_API_KEY" | npx wrangler pages secret put RESEND_API_KEY \
  --project-name "$PROJECT_NAME"

echo
echo "Bitti."
echo "Değişikliğin aktif olması için yeni bir deploy gerekiyor."
echo "Deploy ve testten sonra eski key'i Resend panelinden iptal et."
echo "Bu scripti çalıştırdıktan sonra 'resend key güncellendi' yaz."
