// src/data/exchangeRates.ts
// updated: 30/06/2026, 10:02:57

export const EXCHANGE_RATES_LAST_UPDATED = "2026-06-30T09:02:57.972Z";

export interface CurrencyData {
	rate: number;
	symbol: string;
	name: string;
}
export const currencies: Record<string, CurrencyData> = {
	AUD: { name: "Australian Dollar", rate: 0.043755, symbol: "A$" },
	EUR: { name: "Euro", rate: 0.02643, symbol: "€" },
	GBP: { name: "British Pound", rate: 0.022757, symbol: "£" },
	HKD: { name: "Hong Kong Dollar", rate: 0.236099, symbol: "HK$" },
	SGD: { name: "Singapore Dollar", rate: 0.038984, symbol: "S$" },
	THB: { name: "Thai Baht", rate: 1, symbol: "฿" },
	USD: { name: "US Dollar", rate: 0.030108, symbol: "$" },
};
