#!/usr/bin/env bash
# TarhanaTerapi canlı SEO/GEO hızlı kontrol.
# Kullanım: ./seo-check.sh [https://tarhanaterapi.com]
# Yalnızca okuma yapar; hiçbir servise veri göndermez.

set -u

BASE="${1:-https://tarhanaterapi.com}"
BASE="${BASE%/}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

OK=0
WARN=0
FAIL=0

ok()   { printf '  [OK]   %s\n' "$1"; OK=$((OK + 1)); }
warn() { printf '  [WARN] %s\n' "$1"; WARN=$((WARN + 1)); }
fail() { printf '  [FAIL] %s\n' "$1"; FAIL=$((FAIL + 1)); }

status_code() {
  curl -sS -o /dev/null -w '%{http_code}' --max-time 25 "$1" 2>/dev/null || printf '000'
}

redirect_target() {
  curl -sS -o /dev/null -w '%{redirect_url}' --max-time 25 "$1" 2>/dev/null || true
}

echo "TarhanaTerapi SEO/GEO kontrolü"
echo "Hedef: $BASE"
echo "Tarih: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo

echo "1) Temel dosyalar"
for path in /robots.txt /llms.txt /llms-full.txt /sitemap.xml /index.md /auth.md /.well-known/security.txt; do
  code="$(status_code "$BASE$path")"
  if [ "$code" = "200" ]; then ok "$path (200)"; else fail "$path ($code)"; fi
done

echo
echo "2) Yönlendirmeler ve 404"
code="$(status_code "$BASE/urunler")"
target="$(redirect_target "$BASE/urunler")"
if [ "$code" = "301" ] && printf '%s' "$target" | grep -q '/urunler/tarhana-classic'; then
  ok "/urunler -> 301 /urunler/tarhana-classic"
else
  fail "/urunler beklenen 301 değil: $code $target"
fi

for path in /urunler/tarhana-spicy /urunler/tarhana-baby /urunler/tarhana-family-pack /urunler/tarhana-starter-set /urunler/tarhana-gourmet-duo; do
  code="$(status_code "$BASE$path")"
  target="$(redirect_target "$BASE$path")"
  if [ "$code" = "301" ] && printf '%s' "$target" | grep -q '/urunler/tarhana-classic'; then
    ok "$path -> 301"
  else
    fail "$path beklenen 301 değil: $code $target"
  fi
done

code="$(status_code "$BASE/bu-sayfa-yok-12345")"
if [ "$code" = "404" ]; then ok "bilinmeyen URL (404)"; else fail "bilinmeyen URL 404 değil: $code"; fi

echo
echo "3) Sitemap URL'leri"
curl -sS --max-time 25 "$BASE/sitemap.xml" -o "$TMP_DIR/sitemap.xml" || true
if [ -s "$TMP_DIR/sitemap.xml" ]; then
  mapfile -t URLS < <(grep -o '<loc>[^<]*</loc>' "$TMP_DIR/sitemap.xml" | sed 's#</\?loc>##g')
  printf '  %s URL bulundu\n' "${#URLS[@]}"
  for url in "${URLS[@]}"; do
    code="$(status_code "$url")"
    if [ "$code" = "200" ]; then ok "$url"; else fail "$url ($code)"; fi
  done
  printf '  lastmod: %s\n' "$(grep -o '<lastmod>[^<]*' "$TMP_DIR/sitemap.xml" | sed 's#<lastmod>##' | sort -u | tr '\n' ' ')"
else
  fail "sitemap.xml okunamadı"
fi

echo
echo "4) Canlı sayfalarda eski/yanlış ifade taraması"
for path in / /urunler/tarhana-classic /iletisim /kvkk /yorumlar /llms.txt /llms-full.txt; do
  curl -sS --max-time 25 "$BASE$path" -o "$TMP_DIR/page.html" || true
  hits="$(grep -Eio '450[[:space:]]*TL|21[[:space:]]*gün|toprak[[:space:]]*küp|420\+|4\.9[[:space:]]*/[[:space:]]*5|99\.4|0850[[:space:]]*302|Gedelek|İstanbul[[:space:]]*tadım' "$TMP_DIR/page.html" 2>/dev/null | sort -u | tr '\n' ' ')"
  if [ -n "$hits" ]; then
    fail "$path eski ifade içeriyor: $hits"
  else
    ok "$path temiz"
  fi
done

echo
echo "5) Bing doğrulama dosyası"
code="$(status_code "$BASE/BingSiteAuth.xml")"
if [ "$code" = "200" ]; then ok "/BingSiteAuth.xml (200)"; else warn "/BingSiteAuth.xml yok ($code) — Bing Webmaster doğrulaması ayrıca kontrol edilmeli"; fi

echo
echo "6) AI bot erişimi (ana sayfa)"
for bot in "Googlebot" "Bingbot" "OAI-SearchBot" "ChatGPT-User" "PerplexityBot" "Claude-SearchBot" "GPTBot"; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 25 -A "$bot/1.0 (+https://tarhanaterapi.com)" "$BASE/" 2>/dev/null || printf '000')"
  if [ "$code" = "200" ]; then ok "$bot (200)"; else fail "$bot ($code)"; fi
done

echo
echo "Özet: $OK OK, $WARN uyarı, $FAIL hata"
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
