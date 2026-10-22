/**
 * Cloudflare Pages Function — GET/POST /api/unsubscribe?token=...
 * Bülten e-postalarındaki tek tıkla abonelikten çıkma bağlantısını işler.
 * Token, gönderim sırasında e-posta adresine özel HMAC imzasıyla üretilir.
 */

const SITE_URL = 'https://tarhanaterapi.com';
const encoder = new TextEncoder();

const html = (body, status = 200) =>
  new Response(
    `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Abonelikten Çık | TarhanaTerapi</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f7f3e9;color:#2d2424;font-family:Georgia,'Times New Roman',serif;padding:24px}
    main{max-width:520px;background:#fffdf8;border:1px solid #e7dfd0;border-radius:18px;padding:40px 32px;text-align:center;box-shadow:0 18px 40px rgba(45,36,36,.08)}
    h1{font-size:26px;font-weight:normal;margin:0 0 14px}
    p{font-size:15px;line-height:1.7;color:#6b6458;margin:0 0 18px}
    a{display:inline-block;background:#b45f3c;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 22px;border-radius:10px}
    .mark{display:inline-block;background:#eef4ee;color:#31523c;font-size:12px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;padding:7px 12px;border-radius:999px;margin-bottom:16px}
  </style>
</head>
<body>
  <main>
    <div class="mark">TarhanaTerapi</div>
    ${body}
    <a href="${SITE_URL}">Siteye dön</a>
  </main>
</body>
</html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'X-Frame-Options': 'DENY',
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      },
    }
  );

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const base64UrlEncode = (bytes) => {
  let binary = '';
  const array = new Uint8Array(bytes);
  for (let index = 0; index < array.length; index += 1) {
    binary += String.fromCharCode(array[index]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function readToken(token, secret) {
  const [encodedEmail, signature] = String(token || '').split('.');
  if (!encodedEmail || !signature || !secret) return null;

  let email = '';
  try {
    email = new TextDecoder().decode(base64UrlDecode(encodedEmail));
  } catch {
    return null;
  }
  if (!email || email.length > 254) return null;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(signature),
      encoder.encode(email)
    );
    return valid ? email : null;
  } catch {
    return null;
  }
}

async function unsubscribe(email, env) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return false;

  const res = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ unsubscribed: true }),
  });

  // Resend'de kayıtlı olmayan bir adres zaten bülten almıyor demektir.
  if (res.status !== 404) {
    if (!res.ok) {
      console.error('unsubscribe resend error', res.status, (await res.text()).slice(0, 500));
      return false;
    }
  }

  // Supabase kaydı opsiyoneldir; kolon yoksa veya tablo erişilemezse işlemi bozmayız.
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabaseRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ unsubscribed_at: new Date().toISOString() }),
      }
    );
    if (!supabaseRes.ok) {
      console.error('unsubscribe supabase error', supabaseRes.status);
    }
  }

  return true;
}

export async function onRequestGet({ request, env }) {
  const secret = env.UNSUBSCRIBE_SECRET || env.RESEND_API_KEY || '';
  const url = new URL(request.url);
  const email = await readToken(url.searchParams.get('token'), secret);

  if (!email) {
    return html(
      '<h1>Bağlantı geçersiz</h1><p>Bu abonelikten çıkma bağlantısı geçersiz veya süresi dolmuş.</p><p>Bülteni durdurmak için bize <a href="mailto:satis@tarhanaterapi.com?subject=Abonelikten%20%C3%A7%C4%B1k%C4%B1%C5%9F" style="background:none;color:#3f4a32;padding:0;text-decoration:underline;">e-posta gönderebilirsiniz</a>.</p>',
      400
    );
  }

  const success = await unsubscribe(email, env);
  if (!success) {
    return html(
      '<h1>Şu anda işlem yapılamadı</h1><p>Lütfen birkaç dakika sonra tekrar deneyin veya bize e-posta gönderin.</p>',
      502
    );
  }

  return html(
    '<h1>Abonelikten çıktınız</h1><p>E-posta adresiniz bülten listesinden kaldırıldı. Artık Şifa Bülteni göndermeyeceğiz.</p>'
  );
}

export async function onRequestPost({ request, env }) {
  const secret = env.UNSUBSCRIBE_SECRET || env.RESEND_API_KEY || '';
  const url = new URL(request.url);
  const email = await readToken(url.searchParams.get('token'), secret);

  if (!email) {
    return new Response('Invalid token', { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const success = await unsubscribe(email, env);
  return new Response(success ? 'OK' : 'Failed', {
    status: success ? 200 : 502,
    headers: { 'Cache-Control': 'no-store' },
  });
}
