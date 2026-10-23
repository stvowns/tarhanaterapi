import { getAdmin } from '../_lib/admin.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequestGet({ request, env }) {
  const admin = await getAdmin(request, env);
  if (!admin) {
    return json({ error: 'Yetkisiz istek' }, 401);
  }

  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get('limit') || '500');
  const rawOffset = Number(url.searchParams.get('offset') || '0');
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 500)
    : 500;
  const offset = Number.isFinite(rawOffset)
    ? Math.max(Math.trunc(rawOffset), 0)
    : 0;

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/orders?select=id,order_number,customer_name,` +
      'customer_email,customer_phone,customer_address,customer_city,customer_district,' +
      'payment_method,delivery_note,items,subtotal,shipping_fee,discount,total,status,created_at' +
      `&order=created_at.desc&limit=${limit}&offset=${offset}`,
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
    console.error('list-orders supabase error', await res.text());
    return json({ error: 'Siparişler alınamadı' }, 500);
  }
  const rows = await res.json();

  const orders = rows.map((r) => ({
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
  }));

  return json({
    orders,
    limit,
    offset,
    hasMore: orders.length === limit,
  });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
