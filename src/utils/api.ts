/**
 * API utility functions for calendar editor and viewer
 */

import axios from 'axios';
import type { CalendarData, TermCode } from '@/types';

const API_BASE_URL = 'http://localhost:3000/api';

// Detect if we're in production (GitHub Pages) or development
// Check if running on localhost - if not, we're in production
const isProduction =
	!window.location.hostname.includes('localhost') &&
	window.location.hostname !== '127.0.0.1';

/**
 * Fetch calendar data for a given term
 * @param term Term code (e.g., "w26", "f24")
 * @returns Calendar data
 */
export async function fetchCalendar(term: TermCode): Promise<CalendarData> {
	try {
		if (isProduction) {
			// In production, fetch directly from JSON files
			const response = await fetch(`/calendar-${term}.json`);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch calendar: ${response.statusText}`
				);
			}
			return await response.json();
		} else {
			// In development, use the API server
			const response = await axios.get(
				`${API_BASE_URL}/calendar/${term}`,
				{
					headers: {
						'Cache-Control': 'no-cache',
						Pragma: 'no-cache',
					},
				}
			);
			return response.data;
		}
	} catch (error) {
		console.error('Failed to fetch calendar:', error);
		throw new Error('Failed to load calendar data');
	}
}

/**
 * Save calendar data for a given term
 * @param term Term code
 * @param data Calendar data to save
 */
export async function saveCalendar(
	term: TermCode,
	data: CalendarData
): Promise<void> {
	try {
		await axios.post(`${API_BASE_URL}/calendar/${term}`, data, {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Failed to save calendar:', error);
		throw new Error('Failed to save calendar data');
	}
}

/**
 * Fetch available term codes
 * @returns Array of term codes
 */
export async function fetchTerms(): Promise<string[]> {
	try {
		const response = await axios.get(`${API_BASE_URL}/terms`);
		return response.data;
	} catch (error) {
		console.error('Failed to fetch terms:', error);
		return ['w26', 'f25', 'f24']; // Fallback to known terms
	}
}
