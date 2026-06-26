// src/data/exchangeRates.ts
// updated: 26/06/2026, 14:36:22

export const EXCHANGE_RATES_LAST_UPDATED = "2026-06-26T13:36:22.590Z";

export interface CurrencyData {
	rate: number;
	symbol: string;
	name: string;
}
export const currencies: Record<string, CurrencyData> = {
	AUD: { name: "Australian Dollar", rate: 0.04338, symbol: "A$" },
	EUR: { name: "Euro", rate: 0.026221, symbol: "€" },
	GBP: { name: "British Pound", rate: 0.022661, symbol: "£" },
	HKD: { name: "Hong Kong Dollar", rate: 0.234887, symbol: "HK$" },
	SGD: { name: "Singapore Dollar", rate: 0.038743, symbol: "S$" },
	THB: { name: "Thai Baht", rate: 1, symbol: "฿" },
	USD: { name: "US Dollar", rate: 0.029952, symbol: "$" },
};
