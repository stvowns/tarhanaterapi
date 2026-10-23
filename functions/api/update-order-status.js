import { getAdmin } from '../_lib/admin.js';

const ALLOWED_STATUSES = ['Yeni Sipariş', 'Hazırlanıyor', 'Kargoya Verildi', 'Tamamlandı'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

const notifyEmail = async (env, to, subject, html) => {
  if (!env.RESEND_API_KEY || !to) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'TarhanaTerapi <satis@tarhanaterapi.com>',
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error('update-order-status resend error', res.status, (await res.text()).slice(0, 500));
      return false;
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export async function onRequestPost({ request, env }) {
  const admin = await getAdmin(request, env);
  if (!admin) {
    return json({ error: 'Yetkisiz istek' }, 401);
  }

  let payload = {};
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { orderId, status } = payload;
  if (!orderId || !status) return json({ error: 'orderId and status required' }, 400);
  if (!UUID_RE.test(String(orderId))) return json({ error: 'invalid orderId' }, 400);
  if (!ALLOWED_STATUSES.includes(status)) return json({ error: 'invalid status' }, 400);

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  // E-postayı yalnızca gerçek bir "Kargoya Verildi" geçişinde göndermek için
  // mevcut durumu ve alıcı bilgilerini güncellemeden önce okuyoruz.
  const currentRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=id,status,order_number,customer_name,customer_email`,
    { headers: authHeaders }
  );

  if (!currentRes.ok) {
    console.error('update-order-status read error', await currentRes.text());
    return json({ error: 'Sipariş bulunamadı' }, 500);
  }

  const rows = await currentRes.json();
  const current = Array.isArray(rows) ? rows[0] : null;
  if (!current) return json({ error: 'Sipariş bulunamadı' }, 404);

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    console.error('update-order-status supabase error', await res.text());
    return json({ error: 'Sipariş güncellenemedi' }, 500);
  }

  const data = await res.json();
  const updated = Array.isArray(data) ? data[0] : null;

  let notified = false;
  if (status === 'Kargoya Verildi' && current.status !== 'Kargoya Verildi') {
    const customerName = String(current.customer_name || 'Müşteri');
    const orderNumber = String(current.order_number || '');
    notified = await notifyEmail(
      env,
      String(current.customer_email || ''),
      `Siparişiniz Kargoya Verildi: ${orderNumber}`,
      `<p>Sayın ${escapeHtml(customerName)},</p>
       <p><strong>${escapeHtml(orderNumber)}</strong> numaralı siparişiniz kargoya verildi.</p>
       <p>TarhanaTerapi'yi tercih ettiğiniz için teşekkür ederiz.</p>
       <p>Sevgiler,<br>TarhanaTerapi</p>`
    );
  }

  return json({ success: true, notified, order: updated });
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
