/**
 * Cloudflare Pages Function — GET /api/my-orders
 *
 * 23 Ekim 2026: sahiplik açığı nedeniyle geçici olarak kapatıldı.
 *
 * Eski akış, oturum sahibinin e-postasına ait tüm siparişleri döndürüyordu.
 * Ancak Supabase'de `mailer_autoconfirm: true` olduğu için bir e-posta ile
 * signUp yapan kişi otomatik olarak doğrulanmış oturum alıyor; bu da e-postayı
 * sahiplik kanıtı gibi kullanmayı güvensiz hale getiriyor.
 *
 * Sipariş geçmişi, tek kullanımlık token veya e-posta magic link'i eklendikten
 * sonra yeniden açılacak. O zamana kadar endpoint PII döndürmüyor.
 */

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

export async function onRequestGet() {
  return json(
    {
      error: 'Sipariş geçmişi geçici olarak kapalı.',
      code: 'ORDER_HISTORY_DISABLED',
    },
    410
  );
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
