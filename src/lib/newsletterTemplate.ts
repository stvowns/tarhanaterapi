export interface NewsletterFields {
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  highlights: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote: string;
}

const UNSUBSCRIBE_MAILTO =
  'mailto:satis@tarhanaterapi.com?subject=Abonelikten%20%C3%A7%C4%B1k%C4%B1%C5%9F';

export const DEFAULT_NEWSLETTER: NewsletterFields = {
  subject: 'Şifa Bülteni: Mevsimlik tarifler ve 8 tariflik e-kitap',
  preheader:
    'Mevsimlik çorba reçeteleri, tarhana pişirme püf noktaları ve yeni sezon tarhanamız.',
  heading: 'Mevsim döndü, sofranız şifalandı',
  body: `Merhaba,

Sonbaharın ilk soğuklarıyla birlikte mutfağımızda yeni harmanlar hazırlanıyor. Bu ay sizin için mevsimlik çorba reçeteleri, tarhana pişirme püf noktaları ve saklama önerilerinden bir seçki hazırladık.

Yeni e-kitabımız “Kadim Çorba Ritüelleri ve Şifalı Tarifler”de 8 tarhana tarifi, pişirme rehberi ve saklama önerileri yer alıyor.

Sofranıza şifa, evinize sıcaklık getiren geleneksel tarhanamızı keşfedin.`,
  highlights: `8 mevsimlik tarhana tarifi
Tarhana pişirme ve saklama rehberi
Mevsimlik çorba reçeteleri`,
  ctaLabel: '8 Tariflik E-Kitabı İndir',
  ctaUrl: 'https://tarhanaterapi.com/kadim-corba-rituelleri-ve-sifali-tarifler.pdf',
  footerNote:
    'Bu e-postayı TarhanaTerapi Şifa Bülteni aboneliğiniz için alıyorsunuz.',
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const normalizeUrl = (value: string) => {
  const url = value.trim();
  if (!url) return 'https://tarhanaterapi.com';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://tarhanaterapi.com${url.startsWith('/') ? '' : '/'}${url}`;
};

const paragraphs = (value: string) =>
  value
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#3d3a32;">${escapeHtml(
          paragraph
        ).replace(/\n/g, '<br />')}</p>`
    )
    .join('');

const highlightItems = (value: string) =>
  value
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;font-size:14px;line-height:1.6;color:#3d3a32;"><span style="color:#7a8b5a;font-weight:700;">&#10003;</span>&nbsp;&nbsp;${escapeHtml(
          item
        )}</td></tr>`
    )
    .join('');

export const buildNewsletterHtml = (fields: NewsletterFields) => {
  const ctaUrl = normalizeUrl(fields.ctaUrl);
  const highlights = highlightItems(fields.highlights);

  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(fields.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4efe5;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(
      fields.preheader
    )}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4efe5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#fffdf8;border-radius:18px;overflow:hidden;border:1px solid #e7dfd0;">
            <tr>
              <td style="padding:26px 32px 18px;background:#3f4a32;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.2;color:#fffdf8;letter-spacing:.2px;">TarhanaTerapi</div>
                <div style="margin-top:6px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#d9e2c8;">Anadolu’nun geleneksel çorba kültürü</div>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 32px 8px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#b45f3c;margin-bottom:12px;">Şifa Bülteni</div>
                <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.25;color:#2d2424;font-weight:normal;">${escapeHtml(
                  fields.heading
                )}</h1>
                ${paragraphs(fields.body)}
              </td>
            </tr>
            ${
              highlights
                ? `<tr>
              <td style="padding:8px 32px 4px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f3e9;border:1px solid #e7dfd0;border-radius:12px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <div style="margin-bottom:8px;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#7a8b5a;">Bu bültende</div>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${highlights}</table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
                : ''
            }
            <tr>
              <td style="padding:26px 32px 34px;">
                <a href="${escapeHtml(
                  ctaUrl
                )}" style="display:inline-block;background:#b45f3c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 24px;border-radius:10px;">${escapeHtml(
                  fields.ctaLabel
                )}</a>
                <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6b6458;">Ya da <a href="https://tarhanaterapi.com/urunler/tarhana-classic" style="color:#3f4a32;font-weight:700;text-decoration:underline;">geleneksel tarhanamızı keşfedin</a>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 28px;background:#f7f3e9;border-top:1px solid #e7dfd0;">
                <p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:#6b6458;">${escapeHtml(
                  fields.footerNote
                )}</p>
                <p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:#6b6458;">TarhanaTerapi · Orhangazi / Bursa · <a href="mailto:satis@tarhanaterapi.com" style="color:#3f4a32;">satis@tarhanaterapi.com</a></p>
                <p style="margin:0;font-size:12px;line-height:1.7;color:#6b6458;">Abonelikten çıkmak için <a href="${UNSUBSCRIBE_MAILTO}" style="color:#3f4a32;text-decoration:underline;">buraya tıklayın</a>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
