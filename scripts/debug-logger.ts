/**
 * Debug logger utility
 * Control logging with DEBUG environment variable:
 * - DEBUG=* → all logs
 * - DEBUG=locations → only location logs
 * - DEBUG=pricing → only pricing logs
 * - (not set) → minimal logging (warnings/errors only)
 */

const DEBUG = process.env.DEBUG || "";
const debugAll = DEBUG === "*";

interface LoggerConfig {
	module: string;
}

export class DebugLogger {
	private module: string;
	private enabled: boolean;

	constructor(config: LoggerConfig) {
		this.module = config.module;
		this.enabled = debugAll || DEBUG.includes(this.module);
	}

	log(...args: unknown[]): void {
		if (this.enabled) {
			console.log(`[${this.module}]`, ...args);
		}
	}

	warn(...args: unknown[]): void {
		// Always show warnings
		console.warn(`⚠️  [${this.module}]`, ...args);
	}

	error(...args: unknown[]): void {
		// Always show errors
		console.error(`❌ [${this.module}]`, ...args);
	}

	info(...args: unknown[]): void {
		if (this.enabled) {
			console.info(`ℹ️  [${this.module}]`, ...args);
		}
	}

	isEnabled(): boolean {
		return this.enabled;
	}
}

/**
 * Create a logger instance
 * Usage: const log = createLogger("locations");
 */
export function createLogger(module: string): DebugLogger {
	return new DebugLogger({ module });
}
