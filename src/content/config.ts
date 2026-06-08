import { defineCollection, z } from 'astro:content';

const creativeUseCases = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    description: z.string(),
    icon: z.string(),
  }),
});

export const collections = { creativeUseCases };
