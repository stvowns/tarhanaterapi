const YANDEX_VERIFICATION = `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  </head>
  <body>Verification: 66133422d46f9116</body>
</html>
`;

const SITE_URL = 'https://tarhanaterapi.com';
const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=yes';
const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';

/**
 * Accept başlığını q değerleriyle birlikte ayrıştırır.
 * Örn: "text/markdown, text/html;q=0.9, *\/*;q=0.8"
 */
function parseAccept(header) {
  const media = new Map();

  for (const part of (header || '').split(',')) {
    const [rawType, ...params] = part.trim().split(';');
    const type = rawType.trim().toLowerCase();
    if (!type) continue;

    let quality = 1;
    for (const param of params) {
      const match = param.trim().match(/^q=([0-9.]+)$/i);
      if (match) quality = Number(match[1]);
    }
    media.set(type, quality);
  }

  return media;
}

function prefersMarkdown(request) {
  const accept = parseAccept(request.headers.get('accept'));
  const markdown = Math.max(
    accept.get('text/markdown') ?? -1,
    accept.get('text/x-markdown') ?? -1
  );

  if (markdown <= 0) return false;

  const html = accept.get('text/html') ?? -1;
  return html <= markdown;
}

function markdownPath(pathname) {
  if (pathname === '/' || pathname === '') return '/index.md';
  if (pathname.endsWith('.md')) return pathname;
  if (pathname.endsWith('.html')) return `${pathname.slice(0, -5)}.md`;
  return `${pathname.replace(/\/+$/, '')}.md`;
}

function htmlPathFromMarkdown(pathname) {
  if (pathname === '/index.md') return '/';
  return pathname.replace(/\.md$/, '');
}

function canonicalFor(pathname) {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return `${SITE_URL}${clean}`;
}

function agentLinkHeader(pathname) {
  const markdownUrl = `${SITE_URL}${markdownPath(pathname)}`;
  return [
    `<${markdownUrl}>; rel="alternate"; type="text/markdown"`,
    `<${SITE_URL}/llms.txt>; rel="describedby"; type="text/plain"`,
    `<${SITE_URL}/sitemap.xml>; rel="describedby"; type="application/xml"`,
  ].join(', ');
}

function ensureVary(headers, value) {
  const current = headers.get('Vary');
  if (!current) {
    headers.set('Vary', value);
    return;
  }

  const parts = current.split(',').map((part) => part.trim().toLowerCase());
  if (!parts.includes(value.toLowerCase())) {
    headers.set('Vary', `${current}, ${value}`);
  }
}

function addAgentHeaders(response, pathname) {
  if (response.status >= 300 && response.status < 400) return response;

  const headers = new Headers(response.headers);
  headers.set('Content-Signal', CONTENT_SIGNAL);
  ensureVary(headers, 'Accept');

  const contentType = headers.get('Content-Type') || '';
  const isHtml = contentType.includes('text/html');
  const isPublicPage =
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/assets/') &&
    !pathname.startsWith('/images/') &&
    !pathname.startsWith('/.well-known/');

  if (response.status === 200 && isHtml && isPublicPage) {
    headers.set('Link', agentLinkHeader(pathname));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function fetchAsset(context, pathname) {
  if (!context.env?.ASSETS) return null;

  try {
    const assetUrl = new URL(pathname, SITE_URL);
    const asset = await context.env.ASSETS.fetch(
      new Request(assetUrl.toString(), {
        method: 'GET',
        headers: { Accept: 'text/markdown, text/plain;q=0.9, */*;q=0.1' },
      })
    );
    return asset.ok ? asset : null;
  } catch {
    return null;
  }
}

async function markdownResponse(asset, pathname, method) {
  const body = await asset.text();
  const canonical = canonicalFor(htmlPathFromMarkdown(pathname));
  const headers = new Headers();

  headers.set('Content-Type', MARKDOWN_CONTENT_TYPE);
  headers.set('Content-Signal', CONTENT_SIGNAL);
  headers.set('Vary', 'Accept');
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('Link', `<${canonical}>; rel="canonical"`);
  headers.set('X-Markdown-Tokens', String(Math.ceil(body.length / 4)));

  if (method === 'HEAD') {
    headers.set('Content-Length', String(new TextEncoder().encode(body).byteLength));
    return new Response(null, { status: 200, headers });
  }

  return new Response(body, { status: 200, headers });
}

async function handleMarkdown(context) {
  const request = context.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' && request.method !== 'HEAD') return null;

  // Doğrudan .md isteği: dosyayı her zaman Markdown olarak sun.
  if (url.pathname.endsWith('.md')) {
    const asset = await fetchAsset(context, url.pathname);
    if (!asset) return null;
    return markdownResponse(asset, url.pathname, request.method);
  }

  if (!prefersMarkdown(request)) return null;

  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/.well-known/')
  ) {
    return null;
  }

  const asset = await fetchAsset(context, markdownPath(url.pathname));
  if (!asset) return null;

  return markdownResponse(asset, markdownPath(url.pathname), request.method);
}

async function serveRobots(context) {
  const asset = await fetchAsset(context, '/robots.txt');
  if (!asset) return null;

  const body = await asset.text();
  const headers = new Headers({
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Signal': CONTENT_SIGNAL,
    'Cache-Control': 'no-store, max-age=0',
    Vary: 'Accept',
  });

  if (context.request.method === 'HEAD') {
    headers.set('Content-Length', String(new TextEncoder().encode(body).byteLength));
    return new Response(null, { status: 200, headers });
  }

  return new Response(body, { status: 200, headers });
}

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

  // robots.txt eski edge cache'ini atlamak için Functions üzerinden taze sunulur.
  if (url.pathname === '/robots.txt') {
    const robots = await serveRobots(context);
    if (robots) return robots;
  }

  // AI ajanları aynı adreste Markdown isterse .md kardeşini sun.
  const markdown = await handleMarkdown(context);
  if (markdown) return markdown;

  const response = await context.next();
  return addAgentHeaders(response, url.pathname);
}
