// src/utils/currencyHelper.ts
// 2026-06-10T00:00:00Z

import {
	currencies,
	type CurrencyData as ExchangeRateCurrencyData,
} from "@data/exchangeRates";

/**
 * Extended currency data structure with code
 */
interface CurrencyData extends ExchangeRateCurrencyData {
	code: string;
}

/**
 * Formatting options for currency display
 */
export interface CurrencyFormatOptions {
	showMillions?: boolean;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
	locale?: string;
	rounded?: boolean;
}

/**
 * Available currency codes - dynamically derived from exchangeRates
 */
export type CurrencyCode = keyof typeof currencies;

/**
 * Custom event detail for currency changes
 */
interface CurrencyChangeEvent {
	currency: CurrencyCode;
}

const CURRENCY_STORAGE_KEY = "selectedCurrency";
const DEFAULT_CURRENCY: CurrencyCode = "THB";

/**
 * Get saved currency from localStorage or default to THB
 */
export function getSavedCurrency(): CurrencyCode {
	if (typeof window !== "undefined" && window.localStorage) {
		try {
			const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
			if (saved && isValidCurrency(saved)) {
				return saved;
			}
		} catch (error) {
			console.warn("Could not access localStorage:", error);
		}
	}
	return DEFAULT_CURRENCY;
}

/**
 * Save currency selection to localStorage
 */
export function saveCurrency(currency: CurrencyCode): void {
	if (typeof window !== "undefined" && window.localStorage) {
		try {
			localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
		} catch (error) {
			console.warn("Could not save to localStorage:", error);
		}
	}
}

/**
 * Get currency data for a given currency code
 */
function getCurrencyData(currency: CurrencyCode): CurrencyData | null {
	const currencyData = currencies[currency];
	if (!currencyData) {
		console.error("Currency data not found for:", currency);
		return null;
	}

	const conversionRate = parseFloat(currencyData.rate.toString());
	if (Number.isNaN(conversionRate)) {
		console.error(
			"Invalid conversion rate for currency:",
			currency,
			currencyData,
		);
		return null;
	}

	return {
		rate: conversionRate,
		symbol: currencyData.symbol,
		name: currencyData.name,
		code: currency,
	};
}

/**
 * Convert THB amount to target currency
 */
function convertFromTHB(
	thbAmount: number,
	targetCurrency: CurrencyCode,
): number | null {
	if (Number.isNaN(thbAmount)) {
		console.warn("Invalid THB amount:", thbAmount);
		return null;
	}

	if (targetCurrency === "THB") {
		return thbAmount;
	}

	const currencyData = getCurrencyData(targetCurrency);
	if (!currencyData) {
		return null;
	}

	return thbAmount * currencyData.rate;
}

/**
 * Format amount with currency symbol and proper locale formatting
 */
export function formatCurrency(
	amount: number,
	currency: CurrencyCode,
	options: CurrencyFormatOptions = {},
): string {
	const {
		showMillions = false,
		minimumFractionDigits = 0,
		maximumFractionDigits = 0,
		locale = "en-GB",
		rounded = false,
	} = options;

	const currencyData = getCurrencyData(currency);
	if (!currencyData || Number.isNaN(amount)) {
		return "Invalid";
	}

	let displayAmount = amount;
	let suffix = "";

	// Handle millions display for THB
	if (showMillions && currency === "THB" && amount >= 1000000) {
		displayAmount = amount / 1000000;
		suffix = "m";
		return `${currencyData.symbol}${displayAmount.toLocaleString(locale, {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1,
		})}${suffix}`;
	}

	// Handle rounding for non-THB currencies with showMillions (price-m class)
	if (showMillions && currency !== "THB" && rounded) {
		displayAmount = Math.round(amount / 1000) * 1000;
		return `${currencyData.symbol}${displayAmount.toLocaleString(locale, {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		})}`;
	}

	const formattedAmount = displayAmount.toLocaleString(locale, {
		minimumFractionDigits,
		maximumFractionDigits,
	});

	return `${currencyData.symbol}${formattedAmount}${suffix}`;
}

/**
 * Convert and format THB amount to display currency
 */
function convertAndFormat(
	thbAmount: number,
	targetCurrency: CurrencyCode,
	options: CurrencyFormatOptions = {},
): string {
	const convertedAmount = convertFromTHB(thbAmount, targetCurrency);
	if (convertedAmount === null) {
		return "Invalid";
	}

	return formatCurrency(convertedAmount, targetCurrency, options);
}

/**
 * Update all price elements on the page with new currency
 */
export function updateAllPrices(currency: CurrencyCode): void {
	const prices = document.querySelectorAll(
		".price, .price-m",
	) as NodeListOf<HTMLElement>;

	for (const priceElement of prices) {
		const thbValue = priceElement.dataset.thb;
		if (!thbValue) {
			console.warn(
				"Missing data-thb attribute on price element:",
				priceElement,
			);
			continue;
		}

		const amountInTHB = parseFloat(thbValue);
		if (Number.isNaN(amountInTHB)) {
			console.warn(
				"Invalid data-thb value:",
				thbValue,
				"on element:",
				priceElement,
			);
			continue;
		}

		const isMillion = priceElement.classList.contains("price-m");
		const formattedPrice = convertAndFormat(amountInTHB, currency, {
			showMillions: isMillion,
			rounded: isMillion && currency !== "THB", // Round only for price-m elements in non-THB currencies
		});

		priceElement.textContent = formattedPrice;
	}
}

/**
 * Validate if a string is a valid currency code
 */
function isValidCurrency(currency: string): currency is CurrencyCode {
	return currency in currencies;
}

/**
 * Dispatch currency change event
 */
export function dispatchCurrencyChange(currency: CurrencyCode): void {
	if (typeof window !== "undefined" && window.document) {
		const event = new CustomEvent<CurrencyChangeEvent>("currencyChanged", {
			detail: { currency },
		});
		document.dispatchEvent(event);
	}
}

// Extend the Window interface to include our custom event
declare global {
	interface WindowEventMap {
		currencyChanged: CustomEvent<CurrencyChangeEvent>;
		currencyAutoDetected: CustomEvent<{
			country: string;
			currency: CurrencyCode;
		}>;
	}
}
