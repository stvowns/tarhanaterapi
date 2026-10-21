import { useEffect } from 'react';
import { CONTENT_UPDATED, OG_IMAGE, SITE_URL, markdownUrl } from '../lib/site';

interface SeoHeadProps {
  title: string;
  description: string;
  canonical: string;
  jsonLd?: Record<string, unknown>;
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attr, key);
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
}

function setLink(selector: string, rel: string, href: string, type?: string) {
  let node = document.head.querySelector<HTMLLinkElement>(selector);
  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', rel);
    document.head.appendChild(node);
  }
  if (type) node.setAttribute('type', type);
  node.setAttribute('href', href);
}

export function SeoHead({ title, description, canonical, jsonLd }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;
    document.documentElement.lang = 'tr';

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMeta('meta[property="og:image"]', 'property', 'og:image', OG_IMAGE);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', OG_IMAGE);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    setLink(
      'link[rel="alternate"][type="text/markdown"]',
      'alternate',
      markdownUrl(canonical),
      'text/markdown'
    );
    setLink(
      'link[rel="describedby"]',
      'describedby',
      `${SITE_URL}/llms.txt`,
      'text/plain'
    );

    if (jsonLd) {
      let script = document.getElementById('page-jsonld') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'page-jsonld';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
      script.setAttribute('data-updated', CONTENT_UPDATED);
    }
  }, [title, description, canonical, jsonLd]);

  return null;
}
