import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished, byNewest } from './posts';

/** The only way pages, feeds and routes get posts, so drafts can't leak into production. */
export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', (p) => isPublished(p.data, import.meta.env.PROD));
  return posts.sort(byNewest);
}

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}
