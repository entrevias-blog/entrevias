import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    excerpt: z.string().max(220),
    section: z.enum(['historias', 'lugares', 'en-proceso']),
    date: z.coerce.date(),
    cover: image().optional(),
    gallery: z.array(image()).default([]),
    draft: z.boolean().default(true),
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts };
