#!/usr/bin/env bash
#
# Telegram bot token'ını Cloudflare'e kaydeder.
# -------------------------------------------------
# Bu script:
#   1. Bot token'ını gizli olarak sorar.
#   2. Telegram getMe ile token'ın geçerli olduğunu doğrular.
#   3. Geçerliyse Cloudflare Pages projesine TELEGRAM_BOT_TOKEN olarak yazar.
#
# Kullanım:
#   ./set-telegram-bot-token.sh
#
# Token ekrana basılmaz, dosyaya yazılmaz.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROJECT_NAME="tarhanaterapi"

cleanup() {
  unset TELEGRAM_BOT_TOKEN 2>/dev/null || true
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

echo "== Telegram bot token doğrulama ve Cloudflare'e kaydetme =="
echo
read -rsp "Telegram bot token (gizli giriş): " TELEGRAM_BOT_TOKEN
echo
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  echo "HATA: Bot token boş olamaz." >&2
  exit 1
fi

echo
echo "[1/2] Token Telegram'da doğrulanıyor (getMe)..."
GET_ME_RESPONSE="$(curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe")"

printf '%s' "$GET_ME_RESPONSE" | python3 -c '
import json, sys
data = json.load(sys.stdin)
if not data.get("ok"):
    print(json.dumps(data, indent=2, ensure_ascii=False))
    print("HATA: Token geçersiz. BotFather uzerinden doğru tokenı aldığından emin ol.", file=sys.stderr)
    sys.exit(1)
r = data["result"]
print("  Geçerli token. Bot: @" + str(r.get("username", "")) + " (" + str(r.get("first_name", "")) + ")")
'

echo
echo "[2/2] Token Cloudflare'a TELEGRAM_BOT_TOKEN olarak yazılıyor..."
printf '%s' "$TELEGRAM_BOT_TOKEN" | npx wrangler pages secret put TELEGRAM_BOT_TOKEN \
  --project-name "$PROJECT_NAME"

echo
echo "Bitti."
echo "Değişikliğin aktif olması için yeni bir deploy gerekiyor."
echo "Bu scripti çalıştırdıktan sonra 'token güncellendi' yaz; deploy edip test edelim."
