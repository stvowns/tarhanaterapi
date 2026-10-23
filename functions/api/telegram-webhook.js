/**
 * Cloudflare Pages Function — POST /api/telegram-webhook
 * Telegram botu üzerinden sipariş görüntüleme ve durum güncelleme.
 */

const ALLOWED_STATUSES = ['Yeni Sipariş', 'Hazırlanıyor', 'Kargoya Verildi', 'Tamamlandı'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const text = (body, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

const tg = async (env, method, body) => {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  return res.json();
};

const supabase = async (env, path, options = {}) => {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      ...(options.headers || {}),
    },
  });
  const raw = await res.text();
  try {
    return { ok: res.ok, data: JSON.parse(raw) };
  } catch {
    return { ok: res.ok, data: raw };
  }
};

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

const notifyShippedEmail = async (env, order) => {
  if (!env.RESEND_API_KEY || !order?.customer_email) return;
  const orderNumber = String(order.order_number || '');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: 'TarhanaTerapi <satis@tarhanaterapi.com>',
      to: [order.customer_email],
      subject: `Siparişiniz Kargoya Verildi: ${orderNumber}`,
      html: `<p>Sayın ${esc(order.customer_name || 'Müşteri')},</p>
             <p><strong>${esc(orderNumber)}</strong> numaralı siparişiniz kargoya verildi.</p>
             <p>TarhanaTerapi'yi tercih ettiğiniz için teşekkür ederiz.</p>
             <p>Sevgiler,<br>TarhanaTerapi</p>`,
    }),
  });
  if (!res.ok) {
    console.error('telegram shipped email error', res.status, (await res.text()).slice(0, 500));
  }
};

const toOrder = (r) => ({
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
  paymentStatus: r.payment_status || 'Bekliyor',
  paymentProvider: r.payment_provider || '',
  createdAt: r.created_at,
});

const formatOrder = (o) => {
  const items = (o.items || [])
    .map((it) => `• ${it.quantity}x ${it.name} (${it.weight}) - ${it.price} TL`)
    .join('\n');
  return [
    `📦 ${o.orderNumber}`,
    `Müşteri: ${o.customerName}`,
    `Tel: ${o.customerPhone}`,
    `E-posta: ${o.customerEmail}`,
    `Adres: ${o.customerAddress}, ${o.customerCity}/${o.customerDistrict}`,
    o.deliveryNote ? `Not: ${o.deliveryNote}` : '',
    `Ödeme: ${o.paymentMethod === 'bank_transfer' ? 'Havale/EFT' : o.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Kapıda Ödeme'} (${o.paymentStatus})`,
    `Tutar: ${o.total} TL`,
    `Durum: ${o.status}`,
    `Tarih: ${o.createdAt}`,
    items ? `\nÜrünler:\n${items}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const fetchOrders = async (env) => {
  const r = await supabase(env, 'orders?select=*&order=created_at.desc');
  return r.ok && Array.isArray(r.data) ? r.data.map(toOrder) : [];
};

const summaryText = (orders) => {
  const trMonth = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 7);
  const monthOrders = orders.filter((o) => String(o.createdAt || '').slice(0, 7) === trMonth);
  const revenue = monthOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const active = orders.filter((o) => o.status !== 'Tamamlandı').length;
  return `📊 Bu Ay Özeti\n\nBu ay toplam sipariş: ${monthOrders.length}\nBu ay ciro: ${revenue.toFixed(2)} TL\nAktif sipariş: ${active}\nToplam kayıtlı sipariş: ${orders.length}`;
};

const activeKeyboard = (orders) => ({
  inline_keyboard: [
    ...orders
      .filter((o) => o.status !== 'Tamamlandı')
      .slice(0, 20)
      .map((o) => [{ text: `${o.orderNumber} - ${o.customerName} (${o.status})`, callback_data: `order:${o.id}` }]),
    [{ text: '📊 Bu Ay Özeti', callback_data: 'summary' }],
  ],
});

const orderKeyboard = (o) => ({
  inline_keyboard: [
    [
      { text: 'Hazırlanıyor', callback_data: `status:${o.id}:Hazırlanıyor` },
      { text: 'Kargoya Verildi', callback_data: `status:${o.id}:Kargoya Verildi` },
      { text: 'Tamamlandı', callback_data: `status:${o.id}:Tamamlandı` },
    ],
    [{ text: o.paymentStatus === 'Ödendi' ? 'Ödeme: Ödendi ✅' : 'Ödemeyi Onayla', callback_data: `pay:${o.id}` }],
    [{ text: '⬅ Aktif Siparişler', callback_data: 'orders' }],
  ],
});

const sendActiveOrders = async (env, chatId, messageId = null) => {
  const orders = await fetchOrders(env);
  const active = orders.filter((o) => o.status !== 'Tamamlandı');
  const body = active.length
    ? `Aktif siparişler (${active.length}):\n\n` +
      active.map((o) => `• ${o.orderNumber} - ${o.customerName} - ${o.total} TL - ${o.status}`).join('\n')
    : 'Aktif sipariş bulunmuyor.';
  if (messageId) {
    await tg(env, 'editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: body,
      reply_markup: activeKeyboard(active),
    });
  } else {
    await tg(env, 'sendMessage', { chat_id: chatId, text: body, reply_markup: activeKeyboard(active) });
  }
};

const sendOrderDetail = async (env, chatId, messageId, orderId) => {
  const orders = await fetchOrders(env);
  const o = orders.find((x) => x.id === orderId);
  if (!o) {
    await tg(env, 'editMessageText', { chat_id: chatId, message_id: messageId, text: 'Sipariş bulunamadı.' });
    return;
  }
  await tg(env, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: formatOrder(o),
    reply_markup: orderKeyboard(o),
  });
};

export async function onRequestPost({ request, env }) {
  // Webhook gizli anahtarı tanımlı değilse uç nokta kapalı kalır.
  // Aksi halde herkes sahte Telegram güncellemesi göndererek sipariş durumu değiştirebilir.
  const webhookSecret = env.TELEGRAM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('TELEGRAM_WEBHOOK_SECRET tanımlı değil; webhook isteği reddedildi.');
    return text('webhook secret not configured', 503);
  }
  const got = request.headers.get('x-telegram-bot-api-secret-token');
  if (got !== webhookSecret) return text('unauthorized', 401);

  if (!env.TELEGRAM_ADMIN_CHAT_ID) {
    console.error('TELEGRAM_ADMIN_CHAT_ID tanımlı değil; webhook isteği reddedildi.');
    return text('admin chat not configured', 503);
  }

  let update = {};
  try {
    update = JSON.parse((await request.text()) || '{}');
  } catch {
    return text('bad json', 400);
  }

  const message = update.message;
  const callback = update.callback_query;
  const chatId = message?.chat?.id || callback?.message?.chat?.id;

  if (!chatId) return text('ok');

  if (String(chatId) !== String(env.TELEGRAM_ADMIN_CHAT_ID)) {
    await tg(env, 'sendMessage', {
      chat_id: chatId,
      text: `Yetkisiz sohbet (id:${chatId}). Bu sohbetten /orders kullanılmaz.`,
    });
    return text('ignored');
  }

  try {
    if (message?.text) {
      const cmd = message.text.trim();
      if (cmd === '/start' || cmd === '/orders' || cmd === '/aktif') {
        await sendActiveOrders(env, chatId);
      } else if (cmd === '/help') {
        await tg(env, 'sendMessage', {
          chat_id: chatId,
          text: 'Komutlar: /orders - aktif siparişler. Her sipariş numarasına basarak detay ve durum güncelleyebilirsiniz.',
        });
      }
    }

    if (callback) {
      await tg(env, 'answerCallbackQuery', { callback_query_id: callback.id });
      const messageId = callback.message.message_id;
      const data = callback.data || '';

      if (data === 'orders') {
        await sendActiveOrders(env, chatId, messageId);
        return text('ok');
      }

      if (data === 'summary') {
        const orders = await fetchOrders(env);
        await tg(env, 'editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: summaryText(orders),
          reply_markup: activeKeyboard(orders),
        });
        return text('ok');
      }

      if (data.startsWith('order:')) {
        const orderId = data.slice(6);
        if (!UUID_RE.test(orderId)) return text('invalid order', 400);
        await sendOrderDetail(env, chatId, messageId, orderId);
        return text('ok');
      }

      if (data.startsWith('status:')) {
        const parts = data.split(':');
        const id = parts[1];
        const status = parts.slice(2).join(':');
        if (!UUID_RE.test(id) || !ALLOWED_STATUSES.includes(status)) {
          return text('invalid status', 400);
        }
        const current = await supabase(
          env,
          `orders?id=eq.${id}&select=status,order_number,customer_name,customer_email`
        );
        const patchPath =
          status === 'Kargoya Verildi'
            ? `orders?id=eq.${id}&status=neq.${encodeURIComponent('Kargoya Verildi')}`
            : `orders?id=eq.${id}`;
        const patch = await supabase(env, patchPath, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
        });
        const transitionedToShipped =
          status === 'Kargoya Verildi' &&
          Array.isArray(patch.data) &&
          patch.data.length > 0;
        if (transitionedToShipped) {
          await notifyShippedEmail(env, Array.isArray(current.data) ? current.data[0] : null);
        }
        await sendOrderDetail(env, chatId, messageId, id);
        return text('ok');
      }

      if (data.startsWith('pay:')) {
        const id = data.slice(4);
        if (!UUID_RE.test(id)) return text('invalid order', 400);
        await supabase(env, `orders?id=eq.${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ payment_status: 'Ödendi', updated_at: new Date().toISOString() }),
        });
        await sendOrderDetail(env, chatId, messageId, id);
        return text('ok');
      }
    }
  } catch (err) {
    await tg(env, 'sendMessage', { chat_id: chatId, text: `Hata: ${err.message || err}` });
  }

  return text('ok');
}

export async function onRequestGet() {
  return text('ok');
}
