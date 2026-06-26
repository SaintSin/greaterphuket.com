// src/utils/geoHelper.ts
// Shared geolocation helper for Netlify edge function country detection

/**
 * ISO 3166-1 alpha-2 country code
 */
export type CountryCode = string;

/**
 * Get country code from Netlify edge function meta tag
 */
export function getCountryFromNetlify(): CountryCode | null {
	if (typeof document === "undefined") return null;

	// Check for Netlify country header in different possible formats
	const headers = [
		"x-country",
		"cf-ipcountry", // Cloudflare format
		"x-nf-country", // Alternative Netlify format
	];

	for (const header of headers) {
		const country = document
			.querySelector(`meta[name="${header}"]`)
			?.getAttribute("content");
		if (country) {
			return country.toUpperCase() as CountryCode;
		}
	}

	// Check if passed via URL parameter (for testing)
	const urlParams = new URLSearchParams(window.location.search);
	const testCountry = urlParams.get("country");
	if (testCountry) {
		return testCountry.toUpperCase() as CountryCode;
	}

	return null;
}
