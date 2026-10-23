/**
 * Cloudflare Pages Function — GET /api/my-orders
 *
 * Yalnızca Supabase oturumu doğrulanmış kullanıcının kendi siparişlerini
 * döndürür. Sahiplik `orders.auth_user_id = auth.uid()` eşleşmesine dayanır;
 * e-posta adresi tek başına sahiplik kanıtı sayılmaz.
 *
 * 23 Ekim 2026 öncesi siparişlerde auth_user_id yoktur; bu siparişler burada
 * görünmez ve tek kullanımlık e-posta bağlantısıyla açılabilir.
 */

import { getAuthenticatedUser } from '../_lib/auth.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

export async function onRequestGet({ request, env }) {
  const authUser = await getAuthenticatedUser(request, env);
  if (!authUser) {
    return json({ error: 'Sipariş geçmişi için giriş yapmalısınız.', code: 'AUTH_REQUIRED' }, 401);
  }

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/orders?select=id,order_number,customer_name,` +
      'customer_email,customer_phone,customer_address,customer_city,customer_district,' +
      'payment_method,delivery_note,items,subtotal,shipping_fee,discount,total,status,created_at' +
      `&auth_user_id=eq.${encodeURIComponent(authUser.id)}` +
      '&order=created_at.desc&limit=100',
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

  return json({ orders });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
