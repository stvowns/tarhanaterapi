#!/usr/bin/env node
/**
 * Supabase -> Resend uzlaştırma.
 *
 * `marketing_consent = true` ve `unsubscribed_at` boş olan aboneleri Resend
 * contacts + segmente ekler. Idempotenttir: zaten var olan kontaktlar 409
 * döner ve atlanır. Anahtar/parola argüman olarak İSTENMEZ; ortam
 * değişkenlerinden okunur:
 *
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY
 *   RESEND_AUDIENCE_ID (opsiyonel)
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SEGMENT_ID =
  process.env.RESEND_AUDIENCE_ID || 'decff556-906f-4dd1-93c1-3009796ab097';

for (const [name, value] of Object.entries({
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY,
})) {
  if (!value) {
    console.error(`Eksik ortam değişkeni: ${name}`);
    process.exit(1);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, attempts = 3) => {
  let res;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    res = await fetch(url, options);
    if (
      res.ok ||
      ![429, 500, 502, 503, 504].includes(res.status) ||
      attempt === attempts - 1
    ) {
      return res;
    }
    await sleep(500 * (attempt + 1));
  }
  return res;
};

const loadSubscribers = async () => {
  const pageSize = 1000;
  const rows = [];

  for (let offset = 0; ; offset += pageSize) {
    const url =
      `${SUPABASE_URL}/rest/v1/subscribers?select=email&marketing_consent=eq.true` +
      `&unsubscribed_at=is.null&order=created_at.asc&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Supabase okunamadı: HTTP ${res.status}`);
    }
    const page = await res.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  return rows.map((row) => String(row.email || '').trim().toLowerCase()).filter(Boolean);
};

const syncContact = async (email) => {
  const contact = await fetchWithRetry('https://api.resend.com/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  });

  if (!contact.ok && contact.status !== 409) {
    const detail = await contact.text();
    throw new Error(`contact HTTP ${contact.status}: ${detail.slice(0, 200)}`);
  }

  const segment = await fetchWithRetry(
    `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${SEGMENT_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
    }
  );

  if (!segment.ok) {
    const detail = await segment.text();
    throw new Error(`segment HTTP ${segment.status}: ${detail.slice(0, 200)}`);
  }
};

const main = async () => {
  const emails = await loadSubscribers();
  console.log(`Pazarlama onaylı abone: ${emails.length}`);

  let synced = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      await syncContact(email);
      synced += 1;
    } catch (err) {
      failed += 1;
      console.error(`Senkronize edilemedi (${email}): ${err.message}`);
    }
    await sleep(100);
  }

  console.log(`Tamamlandı: ${synced} senkron, ${failed} hata`);
  if (failed > 0) process.exitCode = 1;
};

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
