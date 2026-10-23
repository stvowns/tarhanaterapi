import { getAdmin } from '../_lib/admin.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequestGet({ request, env }) {
  const admin = await getAdmin(request, env);
  if (!admin) return json({ error: 'Yetkisiz istek' }, 401);

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return json({ error: 'RESEND_API_KEY tanımlı değil' }, 500);

  const res = await fetch('https://api.resend.com/contacts?limit=100', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('list-newsletter-contacts error', await res.text());
    return json({ error: 'Resend kontaktları alınamadı' }, 502);
  }

  const payload = await res.json();
  const contacts = (Array.isArray(payload.data) ? payload.data : [])
    .map((contact) => ({
      id: contact.id || contact.email,
      email: String(contact.email || '').toLowerCase(),
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      unsubscribed: Boolean(contact.unsubscribed),
      createdAt: contact.created_at || '',
    }))
    .filter((contact) => contact.email)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return json({
    success: true,
    count: contacts.length,
    hasMore: Boolean(payload.has_more),
    contacts,
  });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
