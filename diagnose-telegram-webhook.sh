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
print(f"  Bot adı     : {r.get(\"first_name\", \"\")}")
print(f"  Kullanıcı adı: @{r.get(\"username\", \"\")}")
print(f"  Bot ID      : {r.get(\"id\")}")
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
print(f"  URL                 : {r.get(\"url\") or \"(boş)\"}")
print(f"  Bekleyen güncelleme : {r.get(\"pending_update_count\", 0)}")
print(f"  Son hata tarihi     : {r.get(\"last_error_date\") or \"(yok)\"}")
print(f"  Son hata mesajı     : {r.get(\"last_error_message\") or \"(yok)\"}")
print(f"  Son hata kaynağı    : {r.get(\"last_error_source\") or \"(yok)\"}")
'

echo
echo "Önemli: Yukarıdaki kullanıcı adı, Telegram'da mesaj attığın botla aynı olmalı."
echo "Farklıysa yanlış bota /orders yazmış olabilirsin."
