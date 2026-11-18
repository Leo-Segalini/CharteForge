import { useEffect } from 'react';
import {
  buildStructuredDataGraph,
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  ROUTE_SEO_META,
  type SeoRouteKey,
} from '../shared/seoConfig.ts';

interface SeoHeadProps {
  routeKey: SeoRouteKey;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function SeoHead({ routeKey }: SeoHeadProps) {
  useEffect(() => {
    const meta = ROUTE_SEO_META[routeKey] ?? ROUTE_SEO_META.landing;
    const origin = window.location.origin.replace(/\/$/, '');
    const canonicalUrl = `${origin}${meta.path}`;
    const ogImageUrl = `${origin}${OG_IMAGE_PATH}`;

    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', meta.robots);
    upsertLink('canonical', canonicalUrl);

    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', ogImageUrl);
    upsertMeta('property', 'og:image:alt', OG_IMAGE_ALT);

    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', ogImageUrl);
    upsertMeta('name', 'twitter:image:alt', OG_IMAGE_ALT);

    let jsonLdScript = document.getElementById(
      'charteforge-jsonld'
    ) as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'charteforge-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(buildStructuredDataGraph(origin));
  }, [routeKey]);

  return null;
}
