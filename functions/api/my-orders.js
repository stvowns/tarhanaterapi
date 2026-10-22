/**
 * Cloudflare Pages Function — GET /api/my-orders
 * Oturum sahibinin e-postasına ait siparişleri döndürür.
 * Supabase access token doğrulanır; service role anahtarı yalnızca sunucuda kullanılır.
 */

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

async function getUserEmail(env, authHeader) {
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
  if (!user?.email_confirmed_at && !user?.confirmed_at) return null;
  const email = String(user?.email || '').trim().toLowerCase();
  return email || null;
}

const mapOrder = (r) => ({
  id: r.id,
  orderNumber: r.order_number,
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  customerPhone: r.customer_phone,
  customerAddress: r.customer_address || '',
  customerCity: r.customer_city,
  customerDistrict: r.customer_district,
  paymentMethod: r.payment_method || 'bank_transfer',
  deliveryNote: r.delivery_note || '',
  items: Array.isArray(r.items) ? r.items : [],
  subtotal: Number(r.subtotal || 0),
  shippingFee: Number(r.shipping_fee || 0),
  discount: Number(r.discount || 0),
  total: Number(r.total || 0),
  status: r.status || 'Yeni Sipariş',
  createdAt: r.created_at,
});

export async function onRequestGet({ request, env }) {
  const email = await getUserEmail(env, request.headers.get('authorization'));
  if (!email) {
    return json({ error: 'Yetkisiz istek' }, 401);
  }

  // PostgREST ilike kullanıyoruz ki e-posta büyük/küçük harf farkı sorun olmasın.
  // % ve _ karakterlerini escape ederek yalnızca bu e-postayı eşleştiriyoruz.
  const escapedEmail = email.replace(/[\\%_]/g, '\\$&');
  const filter = encodeURIComponent(escapedEmail);
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/orders?select=id,order_number,customer_name,customer_email,customer_phone,customer_address,customer_city,customer_district,payment_method,delivery_note,items,subtotal,shipping_fee,discount,total,status,created_at&customer_email=ilike.${filter}&order=created_at.desc`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.error('my-orders supabase error', await res.text());
    return json({ error: 'Siparişler alınamadı' }, 500);
  }

  const rows = await res.json();
  return json({ orders: rows.map(mapOrder) });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
