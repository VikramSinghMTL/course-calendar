/**
 * Editor-specific types
 */

/**
 * Save status for auto-save indicator
 */
export type SaveStatus = 'saved' | 'saving' | 'error';

/**
 * Term code format (e.g., "w26", "f24", "f25")
 */
export type TermCode = string;

/**
 * Available term options
 */
export interface TermOption {
	code: TermCode;
	label: string;
}

/**
 * API response for calendar endpoints
 */
export interface CalendarApiResponse {
	success: boolean;
	data?: any;
	error?: string;
}
