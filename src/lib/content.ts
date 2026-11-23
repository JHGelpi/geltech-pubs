import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished, byNewest } from './posts';

/** The only way pages, feeds and routes get posts, so drafts can't leak into production. */
export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  // SHOW_DRAFTS=1 is for builds that never deploy (Lighthouse in CI); astro.config.ts blocks it on deploy builds.
  const prod = import.meta.env.PROD && process.env.SHOW_DRAFTS !== '1';
  const posts = await getCollection('blog', (p) => isPublished(p.data, prod));
  return posts.sort(byNewest);
}

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}
