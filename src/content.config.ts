import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { frontmatterIssues } from './lib/posts';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    canonicalUrl: z.url().optional(),
  }).superRefine((data, ctx) => {
    for (const issue of frontmatterIssues(data, new Date())) ctx.addIssue({ code: 'custom', path: [issue.path], message: issue.message });
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string(),
    summary: z.string().max(160),
    url: z.url(),
    status: z.enum(['live', 'beta', 'archived']),
    repo: z.url().optional(),
    screenshot: z.string().optional(),
    order: z.number().default(0),
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({ title: z.string() }),
});

export const collections = { blog, projects, pages };
