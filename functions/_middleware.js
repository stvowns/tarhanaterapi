const YANDEX_VERIFICATION = `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  </head>
  <body>Verification: 66133422d46f9116</body>
</html>
`;

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Cloudflare Pages .html isteklerini 308 ile temiz URL'e yönlendiriyor.
  // Yandex doğrulama dosyası bu adreste birebir 200 dönmeli.
  if (url.pathname === "/yandex_66133422d46f9116.html") {
    return new Response(YANDEX_VERIFICATION, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }

  // Kanonik alan adı: www -> apex (301)
  if (url.hostname === "www.tarhanaterapi.com") {
    url.hostname = "tarhanaterapi.com";
    url.protocol = "https:";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
