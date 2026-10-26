/**
 * API utility functions for the calendar viewer
 */

import type { CalendarData } from '@/types';

/**
 * Fetch calendar data for a given term
 * @param term Term code (e.g., "w26", "f24")
 * @returns Calendar data
 */
export async function fetchCalendar(term: string): Promise<CalendarData> {
	try {
		// Use relative path to work with GitHub Pages subdirectory
		const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
		const response = await fetch(`${basePath}/calendar-${term}.json`, {
			cache: 'no-cache',
		});
		if (!response.ok) {
			throw new Error(`Failed to fetch calendar: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Failed to fetch calendar:', error);
		throw new Error('Failed to load calendar data');
	}
}
