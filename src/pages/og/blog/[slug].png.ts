// Per-post share image, rendered at build time (no runtime code). Published posts only, so drafts get none.
import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { site } from '../../../site.config';
import { getPublishedPosts } from '../../../lib/content';
import { postOgSvg } from '../../../lib/og';

export const getStaticPaths = (async () =>
  (await getPublishedPosts()).map((post) => ({ params: { slug: post.id }, props: { title: post.data.title, description: post.data.description } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await sharp(Buffer.from(postOgSvg(props.title, props.description, site.name, new URL(site.url).host))).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
