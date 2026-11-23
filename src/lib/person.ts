import { site } from '../site.config';

// FR-13: name, tagline and links from site.config.ts.
export const personJsonLd = (): object => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.tagline,
  url: site.url,
  sameAs: Object.values(site.links).filter(Boolean),
});

// FR-13: BlogPosting on posts; the author is the same generic Person.
export const blogPostingJsonLd = (post: {
  title: string; description: string; pubDate: Date; updatedDate?: Date; tags: string[]; image: string; url: string;
}): object => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.description,
  datePublished: post.pubDate.toISOString(),
  dateModified: (post.updatedDate ?? post.pubDate).toISOString(),
  url: post.url,
  mainEntityOfPage: post.url,
  image: new URL(post.image, site.url).href,
  keywords: post.tags,
  author: { '@type': 'Person', name: site.name, url: site.url },
});
