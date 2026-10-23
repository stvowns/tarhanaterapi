/**
 * Cloudflare Pages Function — GET /api/order-access?token=...
 *
 * Sipariş onay e-postasındaki rastgele token ile tek bir siparişi döndürür.
 * E-posta + sipariş numarası ile arama yapılmaz; token sahipliğin kanıtıdır.
 * Veritabanında yalnızca token'ın SHA-256 özeti saklanır.
 */

const TOKEN_RE = /^[A-Za-z0-9_-]{40,128}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const sha256Hex = async (value) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const mapOrder = (row) => ({
  id: row.id,
  orderNumber: row.order_number,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  customerAddress: row.customer_address || '',
  customerCity: row.customer_city,
  customerDistrict: row.customer_district,
  paymentMethod: row.payment_method || 'bank_transfer',
  deliveryNote: row.delivery_note || '',
  items: Array.isArray(row.items) ? row.items : [],
  subtotal: Number(row.subtotal || 0),
  shippingFee: Number(row.shipping_fee || 0),
  discount: Number(row.discount || 0),
  total: Number(row.total || 0),
  status: row.status || 'Yeni Sipariş',
  createdAt: row.created_at,
});

export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!TOKEN_RE.test(token)) {
    return json({ error: 'Geçersiz veya eksik bağlantı.' }, 400);
  }

  const tokenHash = await sha256Hex(token);
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/orders?access_token_hash=eq.${tokenHash}` +
      '&select=id,order_number,customer_name,customer_email,customer_phone,' +
      'customer_address,customer_city,customer_district,payment_method,' +
      'delivery_note,items,subtotal,shipping_fee,discount,total,status,' +
      'created_at,access_token_expires_at&limit=1',
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.error('order-access supabase error', await res.text());
    return json({ error: 'Sipariş getirilemedi.' }, 500);
  }

  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) {
    return json({ error: 'Sipariş bulunamadı veya bağlantının süresi dolmuş.' }, 404);
  }

  if (
    row.access_token_expires_at &&
    new Date(row.access_token_expires_at).getTime() < Date.now()
  ) {
    return json({ error: 'Bağlantının süresi dolmuş.' }, 410);
  }

  return json({ order: mapOrder(row) });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
