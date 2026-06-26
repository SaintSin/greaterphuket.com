import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const galleries = defineCollection({
	loader: glob({ pattern: "*.json", base: "src/content/galleries" }),
	schema: ({ image }) =>
		z.object({
			images: z.array(
				z.object({
					src: image(),
					alt: z.string().optional(),
					title: z.string().optional(),
					description: z.string().optional(),
				}),
			),
		}),
});

export const collections = { galleries };
