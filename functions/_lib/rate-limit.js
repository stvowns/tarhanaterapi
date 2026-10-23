/**
 * Supabase tabanlı kalıcı rate limit.
 *
 * Cloudflare Rate Limiting kuralı birincil katmandır. Bu fonksiyon, Functions
 * isolate'leri arasında paylaşılan ikinci katmanı sağlar.
 *
 * Dönüş:
 *   true  -> istek sınır içinde
 *   false -> sınır aşıldı
 *   null  -> Supabase/RPC kullanılamadı; çağıran in-memory fallback uygular
 */
export async function consumeRateLimit(env, key, limit, windowSeconds) {
  if (
    !env?.SUPABASE_URL ||
    !env?.SUPABASE_SERVICE_ROLE_KEY ||
    !key
  ) {
    return null;
  }

  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/rpc/consume_rate_limit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          p_key: String(key).slice(0, 256),
          p_limit: limit,
          p_window_seconds: windowSeconds,
        }),
      }
    );

    if (!res.ok) {
      console.error('rate-limit rpc error', res.status, (await res.text()).slice(0, 300));
      return null;
    }

    const allowed = await res.json();
    return allowed === true;
  } catch (err) {
    console.error('rate-limit rpc exception', err);
    return null;
  }
}
