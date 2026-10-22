#!/usr/bin/env bash
#
# Telegram webhook teşhisi
# -----------------------
# Bot token'ını gizli olarak sorar; botun kullanıcı adını ve webhook durumunu
# gösterir. Token'ı ekrana basmaz, dosyaya yazmaz.
#
# Kullanım:
#   ./diagnose-telegram-webhook.sh

set -euo pipefail

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

echo "== Telegram webhook teşhisi =="
echo
read -rsp "Telegram bot token (gizli giriş): " TELEGRAM_BOT_TOKEN
echo
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  echo "HATA: Bot token boş olamaz." >&2
  exit 1
fi

echo
echo "[1/2] Bot bilgisi (getMe):"
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" | python3 -c '
import json, sys
data = json.load(sys.stdin)
if not data.get("ok"):
    print(json.dumps(data, indent=2, ensure_ascii=False))
    sys.exit(1)
r = data["result"]
name = r.get("first_name", "")
username = r.get("username", "")
bot_id = r.get("id")
print("  Bot adı      : " + str(name))
print("  Kullanıcı adı: @" + str(username))
print("  Bot ID       : " + str(bot_id))
'

echo
echo "[2/2] Webhook durumu (getWebhookInfo):"
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" | python3 -c '
import json, sys
data = json.load(sys.stdin)
if not data.get("ok"):
    print(json.dumps(data, indent=2, ensure_ascii=False))
    sys.exit(1)
r = data["result"]
url = r.get("url") or "(boş)"
pending = r.get("pending_update_count", 0)
last_date = r.get("last_error_date") or "(yok)"
last_message = r.get("last_error_message") or "(yok)"
last_source = r.get("last_error_source") or "(yok)"
print("  URL                 : " + str(url))
print("  Bekleyen güncelleme : " + str(pending))
print("  Son hata tarihi     : " + str(last_date))
print("  Son hata mesajı     : " + str(last_message))
print("  Son hata kaynağı    : " + str(last_source))
'

echo
echo "Önemli: Yukarıdaki kullanıcı adı, Telegram'da mesaj attığın botla aynı olmalı."
echo "Farklıysa yanlış bota /orders yazmış olabilirsin."
