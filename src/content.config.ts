import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import {languages} from './i18n/ui.ts';

const blogCollection = defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog/" }),
    schema: z.object({
        title: z.string(),
        author: z.string(),
        date: z.date(),
        description: z.string().optional(),
        category: z.array(z.string()).optional(),
        language: z.enum(['en', 'bn']),
    })
});

export const collections = {
    'blog': blogCollection
};
