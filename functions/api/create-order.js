/**
 * Cloudflare Pages Function — POST /api/create-order
 */

import { consumeRateLimit } from '../_lib/rate-limit.js';
import { getAuthenticatedUser } from '../_lib/auth.js';

const RATE_LIMIT = new Map();

const PRODUCT_PRICES = {
  'tarhana-classic': 500,
};
const FREE_SHIPPING_THRESHOLD = 2000;
const STANDARD_SHIPPING_FEE = 150;
const SITE_URL = 'https://tarhanaterapi.com';
const MAX_ITEMS = 10;
const MAX_QUANTITY_PER_ITEM = 20;
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
const cleanText = (value, maxLength) => String(value ?? '').trim().slice(0, maxLength);

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

const formatMoney = (value) => `${new Intl.NumberFormat('tr-TR').format(Number(value) || 0)} TL`;

const formatOrderDate = (date) => {
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Europe/Istanbul',
    }).format(date);
  } catch {
    return date.toISOString();
  }
};

const ORDER_SEQUENCE_START = 48210;
// Eski TT-###### siparişleriyle karışmaması için yalnızca bu andan sonra oluşan
// siparişler sayaç hesabına dahil edilir. İlk yeni sipariş TT-48210 olur.
const ORDER_SEQUENCE_STARTED_AT = '2026-10-21T16:08:00.000Z';
const ORDER_ACCESS_TTL_DAYS = 180;

const randomAccessToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const sha256Hex = async (value) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const nextOrderNumber = async (env) => {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/orders?select=order_number&created_at=gte.${encodeURIComponent(
      ORDER_SEQUENCE_STARTED_AT
    )}&order=created_at.desc&limit=500`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Sipariş numarası okunamadı: ${res.status} ${await res.text()}`);
  }
  const rows = await res.json();
  let max = ORDER_SEQUENCE_START - 1;
  for (const row of rows) {
    const match = /^TT-(\d{5,6})$/.exec(String(row.order_number || ''));
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `TT-${max + 1}`;
};

// ⬇️ IBAN / BANKA BİLGİLERİ: Bilgiler gelince buraya yazılacak.
// Cloudflare'de BANK_TRANSFER_* tanımlıysa öncelik ondadır; yoksa aşağıdaki değerler kullanılır.
const CONFIGURED_BANK_TRANSFER = {
  bankName: '',
  accountName: '',
  iban: '',
};

const bankTransferDetails = (env) => ({
  bankName: String(
    env.BANK_TRANSFER_BANK || env.VITE_BANK_TRANSFER_BANK || CONFIGURED_BANK_TRANSFER.bankName || ''
  ).trim(),
  accountName: String(
    env.BANK_TRANSFER_ACCOUNT_NAME ||
    env.VITE_BANK_TRANSFER_ACCOUNT_NAME ||
    CONFIGURED_BANK_TRANSFER.accountName ||
    ''
  ).trim(),
  iban: String(
    env.BANK_TRANSFER_IBAN || env.VITE_BANK_TRANSFER_IBAN || CONFIGURED_BANK_TRANSFER.iban || ''
  ).trim(),
});

const customerOrderHtml = (order, orderNumber, bankTransfer = {}, accessToken = '') => {
  const paymentLabel =
    order.payment_method === 'cod'
      ? 'Kapıda Ödeme'
      : order.payment_method === 'bank_transfer'
        ? 'Havale / EFT'
        : order.payment_method === 'credit_card'
          ? 'Kredi / Banka Kartı'
          : order.payment_method || 'Havale / EFT';

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e8e2d9;font-size:14px;color:#2b2b2b;line-height:1.45;">
            <strong>${esc(item.name)}</strong>
            ${item.weight ? `<br /><span style="font-size:12px;color:#7a746b;">${esc(item.weight)}</span>` : ''}
          </td>
          <td align="center" style="padding:12px 8px;border-bottom:1px solid #e8e2d9;font-size:14px;color:#2b2b2b;">
            ${esc(item.quantity)}
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #e8e2d9;font-size:14px;color:#2b2b2b;white-space:nowrap;">
            ${formatMoney(Number(item.price) * Number(item.quantity))}
          </td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Siparişiniz alındı: ${esc(orderNumber)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f3ee;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f3ee;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e2d9;">
            <tr>
              <td style="background-color:#31523c;padding:24px 28px;">
                <div style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:0.3px;">TarhanaTerapi</div>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 28px 8px 28px;">
                <h1 style="margin:0 0 10px 0;font-size:22px;line-height:1.3;color:#31523c;">Siparişiniz alındı, teşekkür ederiz!</h1>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4a4a4a;">
                  Merhaba <strong>${esc(order.customer_name)}</strong>,<br />
                  Siparişiniz bize ulaştı. En kısa sürede özenle hazırlanıp kargoya verilecek.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 28px 0 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f7f1;border:1px solid #dbe7d6;border-radius:10px;">
                  <tr>
                    <td style="padding:14px 16px;font-size:13px;color:#4a4a4a;">
                      <strong style="color:#31523c;">Sipariş No:</strong> ${esc(orderNumber)}<br />
                      <strong style="color:#31523c;">Sipariş Tarihi:</strong> ${esc(formatOrderDate(new Date()))}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            ${accessToken ? `
            <tr>
              <td style="padding:20px 28px 0 28px;">
                <h2 style="margin:0 0 8px 0;font-size:16px;color:#31523c;">Sipariş durumunuzu takip edin</h2>
                <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#4a4a4a;">
                  Bu bağlantı yalnızca bu siparişi görüntülemeniz için oluşturuldu.
                  Bağlantıyı başkalarıyla paylaşmayın.
                </p>
                <a href="${SITE_URL}/?siparis=${encodeURIComponent(accessToken)}" style="display:inline-block;background-color:#31523c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 22px;border-radius:8px;">Sipariş Detayını Gör</a>
              </td>
            </tr>` : ''}

            <tr>
              <td style="padding:24px 28px 0 28px;">
                <h2 style="margin:0 0 8px 0;font-size:16px;color:#31523c;">Sipariş Özeti</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <th align="left" style="padding:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#7a746b;border-bottom:1px solid #e8e2d9;">Ürün</th>
                    <th align="center" style="padding:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#7a746b;border-bottom:1px solid #e8e2d9;">Adet</th>
                    <th align="right" style="padding:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#7a746b;border-bottom:1px solid #e8e2d9;">Tutar</th>
                  </tr>
                  ${itemRows}
                  <tr>
                    <td colspan="2" align="right" style="padding:10px 0 0 0;font-size:13px;color:#6b665e;">Ara Toplam</td>
                    <td align="right" style="padding:10px 0 0 0;font-size:13px;color:#2b2b2b;white-space:nowrap;">${formatMoney(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" align="right" style="padding:4px 0 0 0;font-size:13px;color:#6b665e;">Kargo</td>
                    <td align="right" style="padding:4px 0 0 0;font-size:13px;color:#2b2b2b;white-space:nowrap;">${order.shipping_fee > 0 ? formatMoney(order.shipping_fee) : 'Ücretsiz'}</td>
                  </tr>
                  <tr>
                    <td colspan="2" align="right" style="padding:10px 0 0 0;font-size:15px;font-weight:bold;color:#31523c;border-top:1px solid #e8e2d9;">Genel Toplam</td>
                    <td align="right" style="padding:10px 0 0 0;font-size:15px;font-weight:bold;color:#31523c;border-top:1px solid #e8e2d9;white-space:nowrap;">${formatMoney(order.total)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 0 28px;">
                <h2 style="margin:0 0 8px 0;font-size:16px;color:#31523c;">Teslimat Bilgileri</h2>
                <p style="margin:0;font-size:14px;line-height:1.65;color:#4a4a4a;">
                  <strong>${esc(order.customer_name)}</strong><br />
                  ${esc(order.customer_phone)}<br />
                  ${esc(order.customer_address)}<br />
                  ${esc(order.customer_district)} / ${esc(order.customer_city)}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 28px 0 28px;">
                <h2 style="margin:0 0 8px 0;font-size:16px;color:#31523c;">Ödeme</h2>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4a4a4a;">
                  ${esc(paymentLabel)}
                  ${order.payment_method === 'cod' ? '<br /><span style="font-size:12px;color:#7a746b;">Tutarı teslimat sırasında kuryeye nakit veya temassız olarak ödeyebilirsiniz.</span>' : ''}
                  ${order.payment_method === 'bank_transfer' ? `
                    <br /><strong>Banka:</strong> ${bankTransfer.bankName ? esc(bankTransfer.bankName) : '<span style="color:#7a746b;">Bilgi yakında eklenecek</span>'}
                    <br /><strong>Hesap Sahibi:</strong> ${bankTransfer.accountName ? esc(bankTransfer.accountName) : '<span style="color:#7a746b;">Bilgi yakında eklenecek</span>'}
                    <br /><strong>IBAN:</strong> ${bankTransfer.iban ? esc(bankTransfer.iban) : '<span style="color:#7a746b;">Bilgi yakında eklenecek</span>'}
                    <br /><span style="font-size:12px;color:#7a746b;">Açıklama alanına <strong>${esc(orderNumber)}</strong> yazarak dekontu satis@tarhanaterapi.com adresine iletebilirsiniz. Biz görünce de hemen işleme alırız :)</span>
                  ` : ''}
                </p>
              </td>
            </tr>

            ${order.delivery_note ? `
            <tr>
              <td style="padding:20px 28px 0 28px;">
                <h2 style="margin:0 0 8px 0;font-size:16px;color:#31523c;">Sipariş Notunuz</h2>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#4a4a4a;">${esc(order.delivery_note)}</p>
              </td>
            </tr>` : ''}

            <tr>
              <td style="padding:24px 28px 0 28px;">
                <p style="margin:0;font-size:14px;line-height:1.65;color:#4a4a4a;">
                  Siparişinizle ilgili bir sorunuz olursa bu e-postayı yanıtlayabilir veya
                  <a href="mailto:satis@tarhanaterapi.com" style="color:#31523c;font-weight:bold;text-decoration:underline;">satis@tarhanaterapi.com</a>
                  adresine yazabilirsiniz.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 28px 28px;">
                <a href="${SITE_URL}" style="display:inline-block;background-color:#31523c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 22px;border-radius:8px;">Alışverişe devam et</a>
              </td>
            </tr>

            <tr>
              <td style="background-color:#faf8f4;padding:18px 28px;border-top:1px solid #e8e2d9;">
                <p style="margin:0;font-size:11px;line-height:1.6;color:#7a746b;">
                  TarhanaTerapi · Muradiye Mh., Orhangazi / Bursa<br />
                  Bu e-posta siparişinizle ilgili otomatik olarak gönderilmiştir. Kişisel verilerinizin
                  işlenmesi hakkında <a href="${SITE_URL}/kvkk" style="color:#31523c;text-decoration:underline;">KVKK Aydınlatma Metni</a>'ni inceleyebilirsiniz.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 5;
  const recent = (RATE_LIMIT.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return true;
  recent.push(now);
  RATE_LIMIT.set(ip, recent);
  return false;
}

async function insertOrder(env, order) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(order),
  });
  const text = await res.text();
  if (!res.ok) {
    const error = new Error(text || `Supabase ${res.status}`);
    error.status = res.status;
    throw error;
  }
  const data = JSON.parse(text);
  return data[0];
}

const isDuplicateOrderNumber = (error) =>
  error?.status === 409 || /23505|duplicate key/i.test(String(error?.message || ''));

async function notifyTelegram(env, summary) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID) return;
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_ADMIN_CHAT_ID, text: summary }),
  });
  if (!res.ok) {
    throw new Error(`Telegram bildirimi başarısız: ${res.status} ${await res.text()}`);
  }
}

async function notifyEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY || !to) return;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'TarhanaTerapi <satis@tarhanaterapi.com>',
      to: [to],
      reply_to: 'satis@tarhanaterapi.com',
      subject,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend gönderimi başarısız: ${res.status} ${await res.text()}`);
  }
}

export async function onRequestPost({ request, env }) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 64 * 1024) {
    return json({ error: 'İstek çok büyük' }, 413);
  }

  let payload;
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const customerName = cleanText(payload.customerName, 120);
  const customerEmail = cleanText(payload.customerEmail, 254).toLowerCase();
  const customerPhone = cleanText(payload.customerPhone, 32);
  const customerCity = cleanText(payload.customerCity, 80);
  const customerDistrict = cleanText(payload.customerDistrict, 80);
  const customerAddress = cleanText(payload.customerAddress, 500);
  const deliveryNote = cleanText(payload.deliveryNote || payload.delivery_note, 500);

  if (
    !customerName ||
    !customerEmail ||
    !customerPhone ||
    !customerCity ||
    !customerDistrict ||
    !customerAddress
  ) {
    return json({ error: 'missing required field' }, 400);
  }
  if (!isValidEmail(customerEmail)) {
    return json({ error: 'Geçerli bir e-posta adresi girin.' }, 400);
  }

  const ip = (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown'
  )
    .split(',')[0]
    .trim();
  const durableLimit = await consumeRateLimit(env, `create-order:${ip}`, 5, 60);
  if (durableLimit === false || (durableLimit === null && rateLimited(ip))) {
    return json({ error: 'Too many requests' }, 429);
  }

  const kvkkConsent =
    payload.kvkkConsent === true ||
    payload.kvkkConsent === 'true' ||
    payload.kvkkConsent === 'on' ||
    payload.kvkkConsent === 1;
  if (!kvkkConsent) {
    return json(
      {
        error: 'Siparişi tamamlamak için KVKK onay kutusunu işaretlemeniz gerekiyor.',
        code: 'KVKK_CONSENT_REQUIRED',
      },
      400
    );
  }

  // Giriş yapmış kullanıcıda siparişi hesaba bağla. Başlık gönderilmiş ama
  // geçersizse sessizce misafir siparişi oluşturmak yerine oturumu reddet.
  let authUser = null;
  if (request.headers.get('authorization')) {
    authUser = await getAuthenticatedUser(request, env);
    if (!authUser) {
      return json(
        {
          error: 'Oturumunuz doğrulanamadı. Lütfen tekrar giriş yapın.',
          code: 'AUTH_INVALID',
        },
        401
      );
    }
  }

  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  if (rawItems.length === 0 || rawItems.length > MAX_ITEMS) {
    return json({ error: 'Sepette 1 ile 10 arasında ürün olmalı' }, 400);
  }

  const normalizedItems = [];
  let subtotal = 0;
  for (const item of rawItems) {
    const productId = String(item?.productId || '');
    const price = Object.prototype.hasOwnProperty.call(PRODUCT_PRICES, productId)
      ? PRODUCT_PRICES[productId]
      : 0;
    const qty = Number(item?.quantity);
    if (!price || !Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY_PER_ITEM) {
      return json({ error: 'Invalid product or quantity' }, 400);
    }
    subtotal += price * qty;
    normalizedItems.push({
      productId,
      name: cleanText(item?.name, 160) || 'Tarhana',
      price,
      quantity: qty,
      weight: cleanText(item?.weight, 40),
      image: cleanText(item?.image, 500),
    });
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  // Kapıda ödeme varsayılan olarak kapalıdır. Yalnızca açıkça etkinleştirilirse kabul edilir.
  const paymentMethod =
    payload.paymentMethod === 'cod' && env.ALLOW_COD === 'true' ? 'cod' : 'bank_transfer';
  const baseOrder = {
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    customer_city: customerCity,
    customer_district: customerDistrict,
    payment_method: paymentMethod,
    delivery_note: deliveryNote || null,
    items: normalizedItems,
    subtotal,
    shipping_fee: shippingFee,
    discount,
    total,
    status: 'Yeni Sipariş',
    ...(authUser ? { auth_user_id: authUser.id } : {}),
  };

  const accessToken = randomAccessToken();
  const accessTokenHash = await sha256Hex(accessToken);
  const accessTokenCreatedAt = new Date();
  const accessTokenExpiresAt = new Date(
    accessTokenCreatedAt.getTime() + ORDER_ACCESS_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  try {
    let created = null;
    let order = null;
    let orderNumber = '';

    // Sıralı numara: aynı anda gelen siparişlerde benzersizlik kısıtına takılırsa
    // bir sonraki numarayla tekrar denenir.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      orderNumber = await nextOrderNumber(env);
      order = {
        order_number: orderNumber,
        ...baseOrder,
        access_token_hash: accessTokenHash,
        access_token_created_at: accessTokenCreatedAt.toISOString(),
        access_token_expires_at: accessTokenExpiresAt.toISOString(),
      };
      try {
        created = await insertOrder(env, order);
        break;
      } catch (err) {
        if (!isDuplicateOrderNumber(err) || attempt === 4) throw err;
      }
    }

    if (!created || !order) {
      throw new Error('Sipariş numarası atanamadı');
    }

    const paymentLabel = paymentMethod === 'bank_transfer' ? 'Havale/EFT' : 'Kapıda Ödeme';
    const summary = `Yeni sipariş ${orderNumber}\n${customerName} - ${customerCity}\nÖdeme: ${paymentLabel}\nToplam: ${total} TL`;

    const notifications = await Promise.allSettled([
      notifyTelegram(env, summary),
      notifyEmail(
        env,
        customerEmail,
        `Siparişiniz alındı: ${orderNumber}`,
        customerOrderHtml(order, orderNumber, bankTransferDetails(env), accessToken)
      ),
    ]);

    notifications.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Sipariş ${orderNumber}: ${index === 0 ? 'Telegram' : 'e-posta'} bildirimi başarısız`,
          result.reason
        );
      }
    });

    return json({ orderNumber, id: created.id });
  } catch (err) {
    console.error('create-order error', err);
    return json({ error: 'Sipariş alınamadı' }, 500);
  }
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
