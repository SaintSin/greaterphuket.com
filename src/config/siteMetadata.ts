/**
 * Site Metadata & JSON-LD Configuration
 *
 * Customize these values to match your site's information.
 * Site URL is configured in astro.config.mjs and used as the source of truth.
 * These are used for SEO, JSON-LD schemas, and other meta tags.
 */

export interface SiteMetadata {
	name: string;
	description: string;
	logo?: string;
	contactEmail?: string;
	searchRoute?: string;
	gaId?: string;
}

export const siteMetadata: SiteMetadata = {
	name: "Greater Phuket",
	description: "Exploring Phuket and beyond",
	logo: "/logo.svg",
	contactEmail: "info@example.com",
	gaId: "G-RVF7T5XNLY",
};
