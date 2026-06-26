// netlify/edge-functions/add-country-header.js

export default async (_request, context) => {
	// Get the original response
	const response = await context.next();

	// Only process HTML pages
	const contentType = response.headers.get("content-type");
	if (!contentType?.includes("text/html")) {
		return response;
	}

	// Get country from Netlify's geo context
	const country = context.geo?.country?.code || "TH"; // Default to Thailand

	// console.log("Detected country:", country);

	// Get the HTML content
	const html = await response.text();

	// Inject country as meta tag at the end of head
	const modifiedHtml = html.replace(
		"</head>",
		`  <meta name="x-country" content="${country}">\n</head>`,
	);

	// Return the modified response
	return new Response(modifiedHtml, {
		status: response.status,
		statusText: response.statusText,
		headers: {
			...Object.fromEntries(response.headers),
			"content-length": new TextEncoder()
				.encode(modifiedHtml)
				.length.toString(),
		},
	});
};
