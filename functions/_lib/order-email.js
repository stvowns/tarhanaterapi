/**
 * Sipariş e-postaları için ortak, markalı HTML şablonları.
 * Cloudflare Pages Functions içinde Resend'e gönderilir.
 */

const SITE_URL = 'https://tarhanaterapi.com';

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

const formatDate = (value) => {
  const date = value instanceof Date ? value : new Date(value || Date.now());
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

const itemRows = (items) => {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items
    .map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e8e2d9;font-size:14px;color:#2b2b2b;line-height:1.45;">
            <strong>${esc(item.name || 'Ürün')}</strong>
            ${item.weight ? `<br /><span style="font-size:12px;color:#7a746b;">${esc(item.weight)}</span>` : ''}
          </td>
          <td align="center" style="padding:12px 8px;border-bottom:1px solid #e8e2d9;font-size:14px;color:#2b2b2b;">
            ${esc(quantity)}
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #e8e2d9;font-size:14px;color:#2b2b2b;white-space:nowrap;">
            ${formatMoney(price * quantity)}
          </td>
        </tr>`;
    })
    .join('');
};

const timelineStep = (label, state) => {
  const completed = state === 'completed';
  const current = state === 'current';
  const circle = completed
    ? 'background-color:#31523c;color:#ffffff;'
    : current
      ? 'background-color:#ffffff;color:#31523c;border:2px solid #31523c;'
      : 'background-color:#ffffff;color:#b9b2a8;border:2px solid #ddd6cc;';
  const labelColor = completed || current ? '#31523c' : '#9a9389';
  const mark = completed ? '&#10003;' : current ? '&#9679;' : '&#9675;';
  return `
    <td align="center" valign="top" style="width:25%;padding:0 4px;">
      <div style="width:30px;height:30px;line-height:26px;border-radius:15px;font-size:14px;font-weight:bold;${circle}margin:0 auto 8px auto;">
        ${mark}
      </div>
      <div style="font-size:11px;line-height:1.35;font-weight:bold;color:${labelColor};">
        ${esc(label)}
      </div>
    </td>`;
};

/**
 * @param {object} order Supabase `orders` satırı (snake_case alanlar)
 * @param {string} orderNumber
 * @param {Date|string} [shippedAt]
 */
export const orderShippedHtml = (order = {}, orderNumber = '', shippedAt = new Date()) => {
  const number = orderNumber || order.order_number || '';
  const customerName = order.customer_name || 'Müşteri';
  const items = Array.isArray(order.items) ? order.items : [];
  const addressLines = [
    order.customer_address,
    [order.customer_district, order.customer_city].filter(Boolean).join(' / '),
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Siparişiniz kargoda: ${esc(number)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f3ee;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${esc(number)} numaralı siparişiniz kargoya verildi. Afiyetle tüketmeniz dileğiyle.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f3ee;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e2d9;">
            <tr>
              <td style="background-color:#31523c;padding:22px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:0.3px;">
                      TarhanaTerapi
                    </td>
                    <td align="right" style="font-size:10px;font-weight:bold;letter-spacing:1.2px;color:#dbe7d6;text-transform:uppercase;">
                      Sipariş Güncellemesi
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:30px 28px 8px 28px;">
                <span style="display:inline-block;background-color:#f3f7f1;border:1px solid #dbe7d6;color:#31523c;font-size:11px;font-weight:bold;letter-spacing:0.8px;text-transform:uppercase;padding:6px 12px;border-radius:999px;">
                  Kargoda
                </span>
                <h1 style="margin:16px 0 10px 0;font-size:24px;line-height:1.3;color:#31523c;">
                  Siparişiniz yolda!
                </h1>
                <p style="margin:0;font-size:14px;line-height:1.65;color:#4a4a4a;">
                  Merhaba <strong>${esc(customerName)}</strong>,<br />
                  <strong>${esc(number)}</strong> numaralı siparişiniz kargoya verildi.
                  Özenle hazırladığımız ürünlerimizi afiyetle tüketmeniz dileğiyle.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px 0 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f7f1;border:1px solid #dbe7d6;border-radius:10px;">
                  <tr>
                    <td style="padding:14px 16px;font-size:13px;line-height:1.65;color:#4a4a4a;">
                      <strong style="color:#31523c;">Sipariş No:</strong> ${esc(number)}<br />
                      <strong style="color:#31523c;">Kargoya Veriliş:</strong> ${esc(formatDate(shippedAt))}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 0 28px;">
                <h2 style="margin:0 0 14px 0;font-size:16px;color:#31523c;">Sipariş Süreci</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    ${timelineStep('Sipariş Alındı', 'completed')}
                    ${timelineStep('Hazırlandı', 'completed')}
                    ${timelineStep('Kargoda', 'current')}
                    ${timelineStep('Teslimat', 'pending')}
                  </tr>
                </table>
              </td>
            </tr>

            ${items.length > 0 ? `
            <tr>
              <td style="padding:24px 28px 0 28px;">
                <h2 style="margin:0 0 8px 0;font-size:16px;color:#31523c;">Sipariş Özeti</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <th align="left" style="padding:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#7a746b;border-bottom:1px solid #e8e2d9;">Ürün</th>
                    <th align="center" style="padding:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#7a746b;border-bottom:1px solid #e8e2d9;">Adet</th>
                    <th align="right" style="padding:0 0 8px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:#7a746b;border-bottom:1px solid #e8e2d9;">Tutar</th>
                  </tr>
                  ${itemRows(items)}
                  <tr>
                    <td colspan="2" align="right" style="padding:10px 0 0 0;font-size:13px;color:#6b665e;">Ara Toplam</td>
                    <td align="right" style="padding:10px 0 0 0;font-size:13px;color:#2b2b2b;white-space:nowrap;">${formatMoney(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" align="right" style="padding:4px 0 0 0;font-size:13px;color:#6b665e;">Kargo</td>
                    <td align="right" style="padding:4px 0 0 0;font-size:13px;color:#2b2b2b;white-space:nowrap;">${Number(order.shipping_fee) > 0 ? formatMoney(order.shipping_fee) : 'Ücretsiz'}</td>
                  </tr>
                  ${Number(order.discount) > 0 ? `
                  <tr>
                    <td colspan="2" align="right" style="padding:4px 0 0 0;font-size:13px;color:#6b665e;">İndirim</td>
                    <td align="right" style="padding:4px 0 0 0;font-size:13px;color:#31523c;white-space:nowrap;">-${formatMoney(order.discount)}</td>
                  </tr>` : ''}
                  <tr>
                    <td colspan="2" align="right" style="padding:10px 0 0 0;font-size:15px;font-weight:bold;color:#31523c;border-top:1px solid #e8e2d9;">Genel Toplam</td>
                    <td align="right" style="padding:10px 0 0 0;font-size:15px;font-weight:bold;color:#31523c;border-top:1px solid #e8e2d9;white-space:nowrap;">${formatMoney(order.total)}</td>
                  </tr>
                </table>
              </td>
            </tr>` : ''}

            <tr>
              <td style="padding:24px 28px 0 28px;">
                <h2 style="margin:0 0 8px 0;font-size:16px;color:#31523c;">Teslimat Bilgileri</h2>
                <p style="margin:0;font-size:14px;line-height:1.65;color:#4a4a4a;">
                  <strong>${esc(customerName)}</strong>
                  ${order.customer_phone ? `<br />${esc(order.customer_phone)}` : ''}
                  ${addressLines.length ? `<br />${addressLines.map(esc).join('<br />')}` : ''}
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
                  Kargo süreciyle ilgili bir sorunuz olursa bu e-postayı yanıtlayabilir veya
                  <a href="mailto:satis@tarhanaterapi.com" style="color:#31523c;font-weight:bold;text-decoration:underline;">satis@tarhanaterapi.com</a>
                  adresine yazabilirsiniz.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 28px 28px 28px;">
                <a href="${SITE_URL}" style="display:inline-block;background-color:#31523c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 22px;border-radius:8px;">TarhanaTerapi'yi Ziyaret Et</a>
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

export const orderShippedText = (order = {}, orderNumber = '') => {
  const number = orderNumber || order.order_number || '';
  return [
    `Sayın ${order.customer_name || 'Müşteri'},`,
    '',
    `${number} numaralı siparişiniz kargoya verildi.`,
    'Özenle hazırladığımız ürünlerimizi afiyetle tüketmeniz dileğiyle.',
    '',
    'Sorularınız için bu e-postayı yanıtlayabilir veya satis@tarhanaterapi.com adresine yazabilirsiniz.',
    '',
    'Sevgiler,',
    'TarhanaTerapi',
  ].join('\n');
};
