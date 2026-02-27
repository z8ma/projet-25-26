import { useEffect } from 'react';

interface MetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'profile' | 'article';
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

const SITE_NAME = 'JUNY';
const DEFAULT_IMAGE = 'https://junyia.fr/og-image.png';
const BASE_URL = 'https://junyia.fr';

export function useDocumentMeta({ title, description, image, url, type = 'website' }: MetaOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Trouvez le créatif parfait`;
    const ogImage = image || DEFAULT_IMAGE;
    const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL;

    document.title = fullTitle;

    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', pageUrl);
    setMetaTag('name', 'twitter:url', pageUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary_large_image');
  }, [title, description, image, url, type]);
}
