// @ts-check

import netlify from "@astrojs/netlify";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import { defineConfig, svgoOptimizer } from "astro/config";

import icon from "astro-icon";
import llmsTxt from "astro-llms-md";
import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
	experimental: {
		svgOptimizer: svgoOptimizer(),
	
	},
	image: {
		responsiveStyles: true,
	},
	integrations: [
		sitemap(),
		icon(),
		partytown({ config: { forward: ['dataLayer.push'] } }),
		llmsTxt({
			generateIndividualMd: true,
		}),
		robotsTxt({
			policy: [
				// AI training crawlers — block
				{ userAgent: 'CCBot', disallow: '/' },
				{ userAgent: 'cohere-ai', disallow: '/' },
				// AI search/retrieval crawlers — allow
				{ userAgent: 'GPTBot', allow: '/' },
				{ userAgent: 'Google-Extended', allow: '/' },
				{ userAgent: 'Applebot-Extended', allow: '/' },
				{ userAgent: 'ClaudeBot', allow: '/' },
				{ userAgent: 'anthropic-ai', allow: '/' },
				{ userAgent: 'OAI-SearchBot', allow: '/' },
				{ userAgent: 'ChatGPT-User', allow: '/' },
				{ userAgent: 'PerplexityBot', allow: '/' },
				// Everyone else
				{ userAgent: '*', allow: '/' },
			],
			transform: (content) =>
				content.replace(
					/(User-agent: \*\n(?:Allow|Disallow): \/)/,
					'$1\nContent-Signal: search=yes, ai-input=yes, ai-train=no',
				),
		}),
	],
	site: "https://greaterphuket.com/",
	adapter: netlify(),
});
