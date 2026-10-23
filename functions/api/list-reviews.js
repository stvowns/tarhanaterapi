import { getAdmin } from '../_lib/admin.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const mapReview = (row) => ({
  id: row.id,
  author: row.author,
  location: row.location || 'Türkiye',
  rating: row.rating,
  content: row.content,
  productName: row.product_name || '',
  verified: Boolean(row.verified),
  createdAt: row.created_at || '',
});

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') === 'pending' ? 'pending' : 'approved';

  if (status === 'pending') {
    const admin = await getAdmin(request, env);
    if (!admin) return json({ error: 'Yetkisiz istek' }, 401);
  }

  const filter = status === 'pending' ? 'verified=eq.false' : 'verified=eq.true';
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/reviews?${filter}&select=id,author,location,rating,content,product_name,verified,created_at&order=created_at.desc&limit=200`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.error('list-reviews error', await res.text());
    return json({ error: 'Yorumlar alınamadı' }, 500);
  }

  const rows = await res.json();
  return json({
    success: true,
    status,
    count: rows.length,
    reviews: rows.map(mapReview),
  });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
