import { getAdmin } from '../_lib/admin.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequestGet({ request, env }) {
  const admin = await getAdmin(request, env);
  if (!admin) return json({ error: 'Yetkisiz istek' }, 401);

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/subscribers?select=id,email,source,created_at&order=created_at.desc&limit=5000`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.error('list-subscribers error', await res.text());
    return json({ error: 'Liste alınamadı' }, 500);
  }

  const rows = await res.json();
  return json({
    success: true,
    count: rows.length,
    subscribers: rows.map((row) => ({
      id: row.id,
      email: row.email,
      source: row.source,
      createdAt: row.created_at
        ? new Date(row.created_at).toLocaleDateString('tr-TR')
        : '',
    })),
  });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
