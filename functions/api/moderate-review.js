import { getAdmin } from '../_lib/admin.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestPost({ request, env }) {
  const admin = await getAdmin(request, env);
  if (!admin) return json({ error: 'Yetkisiz istek' }, 401);

  let payload = {};
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const id = String(payload.id || '').trim();
  const action = payload.action;

  if (!id || !['approve', 'delete'].includes(action)) {
    return json({ error: 'id ve geçerli bir action gerekli' }, 400);
  }

  const endpoint = `${env.SUPABASE_URL}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`;
  const res = await fetch(endpoint, {
    method: action === 'delete' ? 'DELETE' : 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: action === 'delete' ? undefined : JSON.stringify({ verified: true }),
  });

  if (!res.ok) {
    console.error('moderate-review error', await res.text());
    return json({ error: 'İşlem yapılamadı' }, 500);
  }

  return json({ success: true, action });
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
