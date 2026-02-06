/**
 * Date utility functions for calendar
 */

/**
 * Format ISO date string (YYYY-MM-DD) to "MMM DD" format
 * Uses direct string splitting to avoid timezone issues
 * @param dueDate ISO date string
 * @returns Formatted date string like "JAN 26"
 */
export function formatDue(dueDate: string): string {
	if (!dueDate) return '';

	const months = [
		'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
		'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
	];

	const [year, month, day] = dueDate.split('-');
	const monthIndex = parseInt(month, 10) - 1;
	const dayNum = parseInt(day, 10);

	return `${months[monthIndex]} ${dayNum}`;
}

/**
 * Check if a given ISO date falls within the current week
 * @param startDate ISO date string for week start
 * @returns 'current-week' if within current week, empty string otherwise
 */
export function getCurrentWeekId(startDate: string): string {
	if (!startDate) return '';

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const weekStart = new Date(startDate);
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekEnd.getDate() + 6); // Week is 7 days

	if (today >= weekStart && today <= weekEnd) {
		return 'current-week';
	}

	return '';
}

/**
 * Check if any activity in an array is of type "cancelled"
 * @param activities Array of activities
 * @returns true if any activity is cancelled
 */
export function hasAnyCancelled(activities: any[]): boolean {
	return activities?.some(activity => activity?.type === 'cancelled') || false;
}

/**
 * Filter out null/undefined activities from an array
 * @param activities Array that may contain null/undefined entries
 * @returns Filtered array with only valid activities
 */
export function normalizeActivities<T>(activities: (T | null | undefined)[]): T[] {
	return activities.filter((activity): activity is T => activity != null);
}
