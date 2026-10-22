#!/usr/bin/env bash
#
# Telegram webhook secret rotasyonu
# ---------------------------------
# Bu script:
#   1. Yeni, rastgele bir webhook secret üretir.
#   2. Secret'ı Cloudflare Pages projesine kaydeder.
#   3. Telegram bot token'ını gizli olarak sorar.
#   4. Telegram webhook'unu yeni secret ile günceller.
#   5. Webhook durumunu doğrular.
#
# Kullanım:
#   ./rotate-telegram-webhook.sh
#
# Not: Bot token'ı ve secret hiçbir yere yazılmaz, ekrana basılmaz.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_NAME="tarhanaterapi"
WEBHOOK_URL="https://tarhanaterapi.com/api/telegram-webhook"

cleanup() {
  unset NEW_SECRET TELEGRAM_BOT_TOKEN 2>/dev/null || true
}
trap cleanup EXIT

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "HATA: '$1' bulunamadı. Lütfen kurup tekrar dene." >&2
    exit 1
  fi
}

need openssl
need npx
need curl
need python3

echo "== Telegram webhook secret rotasyonu =="
echo

# 1) Yeni secret
NEW_SECRET="$(openssl rand -hex 32)"
echo "[1/4] Yeni secret üretildi (ekrana basılmıyor)."

# 2) Cloudflare Pages secret
echo "[2/4] Cloudflare'a TELEGRAM_WEBHOOK_SECRET yazılıyor..."
printf '%s' "$NEW_SECRET" | npx wrangler pages secret put TELEGRAM_WEBHOOK_SECRET \
  --project-name "$PROJECT_NAME"

# 3) Bot token'ı gizli al
echo
read -rsp "Telegram bot token (gizli giriş): " TELEGRAM_BOT_TOKEN
echo
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  echo "HATA: Bot token boş olamaz." >&2
  exit 1
fi
if [[ "$TELEGRAM_BOT_TOKEN" != *:* ]]; then
  echo "HATA: Bot token formatı beklenenden farklı (içinde ':' olmalı)." >&2
  exit 1
fi

# 4) Telegram webhook
echo "[3/4] Telegram webhook'u güncelleniyor..."
SET_WEBHOOK_RESPONSE="$(
  curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
    --data-urlencode "url=${WEBHOOK_URL}" \
    --data-urlencode "secret_token=${NEW_SECRET}"
)"

printf '%s' "$SET_WEBHOOK_RESPONSE" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    print("HATA: Telegram yanıtı JSON olarak okunamadı.", file=sys.stderr)
    sys.exit(1)
print(json.dumps(data, indent=2, ensure_ascii=False))
if not data.get("ok"):
    sys.exit(1)
'

# 5) Webhook durumu
echo
echo "[4/4] Webhook durumu kontrol ediliyor..."
WEBHOOK_INFO_RESPONSE="$(
  curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo"
)"

printf '%s' "$WEBHOOK_INFO_RESPONSE" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    print("HATA: getWebhookInfo yanıtı JSON olarak okunamadı.", file=sys.stderr)
    sys.exit(1)
result = data.get("result", {})
summary = {
    "url": result.get("url"),
    "pending_update_count": result.get("pending_update_count"),
    "last_error_date": result.get("last_error_date"),
    "last_error_message": result.get("last_error_message"),
}
print(json.dumps(summary, indent=2, ensure_ascii=False))
if result.get("url") != "https://tarhanaterapi.com/api/telegram-webhook":
    print("UYARI: Webhook URL beklenenden farklı.", file=sys.stderr)
    sys.exit(1)
'

echo
echo "Yetkisiz istek testi (401 bekleniyor):"
HTTP_CODE="$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WEBHOOK_URL")"
echo "HTTP $HTTP_CODE"
if [ "$HTTP_CODE" != "401" ]; then
  echo "UYARI: Yetkisiz istek 401 dönmedi. Cloudflare deploy'u henüz yapılmamış olabilir." >&2
fi

echo
echo "Bitti."
echo "Cloudflare secret değişikliğinin aktif olması için yeni bir deploy gerekiyor."
echo "Bu adımı tamamladıktan sonra '1 tamam' yaz; deploy ve Telegram /orders testini birlikte yapalım."
