/**
 * Cloudflare Pages Function — POST /api/update-order-status
 * Sadece admin e-postalarına açıktır (Supabase access token doğrulanır).
 */

const ADMIN_EMAILS = ['layeredstudio78@gmail.com', 'admin@tarhanaterapi.com'];
const ALLOWED_STATUSES = ['Yeni Sipariş', 'Hazırlanıyor', 'Kargoya Verildi', 'Tamamlandı'];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const notifyEmail = async (env, to, subject, html) => {
  if (!env.RESEND_API_KEY || !to) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'TarhanaTerapi <satis@tarhanaterapi.com>',
        to: [to],
        subject,
        html,
      }),
    });
  } catch (e) {
    console.error(e);
  }
};

async function getAdminEmail(env, authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const anonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const user = await res.json();
  const email = String(user?.email || '').toLowerCase();
  return ADMIN_EMAILS.includes(email) ? email : null;
}

export async function onRequestPost({ request, env }) {
  const adminEmail = await getAdminEmail(env, request.headers.get('authorization'));
  if (!adminEmail) {
    return json({ error: 'Yetkisiz istek' }, 401);
  }

  let payload = {};
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { orderId, status, customerEmail, orderNumber } = payload;
  if (!orderId || !status) return json({ error: 'orderId and status required' }, 400);
  if (!ALLOWED_STATUSES.includes(status)) return json({ error: 'invalid status' }, 400);

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    console.error('update-order-status supabase error', await res.text());
    return json({ error: 'Sipariş güncellenemedi' }, 500);
  }
  const data = await res.json();

  if (customerEmail) {
    await notifyEmail(
      env,
      customerEmail,
      `Sipariş Durumu Güncellendi: ${orderNumber || ''}`,
      `<p>Sayın ${payload.customerName || 'Müşteri'},</p><p>Siparişinizin durumu: <strong>${status}</strong>.</p><p>Sipariş No: ${orderNumber || ''}</p>`
    );
  }

  return json({ success: true, order: data[0] });
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
