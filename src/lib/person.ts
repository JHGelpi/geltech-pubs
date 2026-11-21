import { site } from '../site.config';

// FR-13: generic identity only. Never add worksFor (FR-0a).
export const personJsonLd = (): object => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.tagline,
  url: site.url,
  sameAs: Object.values(site.links).filter(Boolean),
});
