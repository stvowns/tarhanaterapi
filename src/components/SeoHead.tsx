import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  canonical: string;
  jsonLd?: Record<string, unknown>;
}

export function SeoHead({ title, description, canonical, jsonLd }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    const id = 'page-jsonld';
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const node = document.getElementById(id);
      if (node) node.remove();
    };
  }, [title, description, canonical, jsonLd]);

  return null;
}