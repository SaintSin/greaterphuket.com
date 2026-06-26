// scripts/generate-exchange-rates.ts
// Fetches exchange rates from apilayer.net and writes src/data/exchangeRates.ts
// By default only fetches once per day. Use --force to override.

import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "./debug-logger.ts";

const log = createLogger("exchange-rates");

// Load .env file manually for build scripts
async function loadEnv(): Promise<void> {
	try {
		const envPath = join(dirname(fileURLToPath(import.meta.url)), "../.env");
		const envContent = await fs.readFile(envPath, "utf-8");
		for (const line of envContent.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const [key, ...valueParts] = trimmed.split("=");
			if (key) {
				process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
			}
		}
	} catch {
		log.warn("Could not load .env file, relying on environment variables");
	}
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_PATH = join(__dirname, "../src/data/exchangeRates.ts");

const CURRENCY_META: Record<string, { name: string; symbol: string }> = {
	AUD: { name: "Australian Dollar", symbol: "A$" },
	EUR: { name: "Euro", symbol: "€" },
	GBP: { name: "British Pound", symbol: "£" },
	HKD: { name: "Hong Kong Dollar", symbol: "HK$" },
	SGD: { name: "Singapore Dollar", symbol: "S$" },
	THB: { name: "Thai Baht", symbol: "฿" },
	USD: { name: "US Dollar", symbol: "$" },
};

const CURRENCY_CODES = Object.keys(CURRENCY_META)
	.filter((c) => c !== "THB")
	.join(",");

async function isAlreadyUpdatedToday(): Promise<boolean> {
	try {
		const content = await fs.readFile(OUTPUT_PATH, "utf-8");
		const match = content.match(/EXCHANGE_RATES_LAST_UPDATED\s*=\s*"([^"]+)"/);
		if (!match) return false;
		const lastUpdated = new Date(match[1]);
		const today = new Date();
		return lastUpdated.toDateString() === today.toDateString();
	} catch {
		return false;
	}
}

interface ApiResponse {
	success: boolean;
	quotes: Record<string, number>;
	error?: { info: string };
}

async function fetchRates(): Promise<Record<string, number>> {
	const apiKey = process.env.EXCHANGE_RATES_API_KEY;
	if (!apiKey) {
		throw new Error("EXCHANGE_RATES_API_KEY not set in environment variables");
	}

	const url = `https://apilayer.net/api/live?access_key=${apiKey}&currencies=${CURRENCY_CODES}&source=THB&format=1`;
	const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
	const data: ApiResponse = await response.json();

	if (!data.success) {
		throw new Error(`API error: ${data.error?.info || "Unknown error"}`);
	}

	const rates: Record<string, number> = { THB: 1 };
	for (const [key, value] of Object.entries(data.quotes)) {
		// Keys are like "THBUSD", "THBGBP" etc.
		const code = key.replace("THB", "");
		rates[code] = value;
	}
	return rates;
}

async function writeOutput(
	rates: Record<string, number>,
	timestamp: string,
): Promise<void> {
	const sorted = Object.keys(CURRENCY_META).sort();
	const entries = sorted
		.map((code) => {
			const meta = CURRENCY_META[code];
			const rate = rates[code] ?? 1;
			return `\t${code}: { name: "${meta.name}", rate: ${rate}, symbol: "${meta.symbol}" },`;
		})
		.join("\n");

	const content = `// src/data/exchangeRates.ts
// updated: ${new Date(timestamp).toLocaleString("en-GB")}

export const EXCHANGE_RATES_LAST_UPDATED = "${timestamp}";

export interface CurrencyData {
\trate: number;
\tsymbol: string;
\tname: string;
}
export const currencies: Record<string, CurrencyData> = {
${entries}
};
`;

	await fs.writeFile(OUTPUT_PATH, content, "utf-8");
}

async function main(): Promise<void> {
	await loadEnv();
	const force = process.argv.includes("--force");

	if (!force && (await isAlreadyUpdatedToday())) {
		log.log(
			"Exchange rates already updated today, skipping. Use --force to override.",
		);
		return;
	}

	log.log("Fetching exchange rates...");
	const rates = await fetchRates();
	const timestamp = new Date().toISOString();
	await writeOutput(rates, timestamp);
	log.log("Exchange rates updated successfully.");
}

main().catch((err) => {
	log.error("Failed to update exchange rates:", err.message);
	process.exit(1);
});
