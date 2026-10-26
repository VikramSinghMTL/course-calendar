/**
 * Activity types that determine styling and behavior
 */
export type ActivityType =
	| 'lesson'
	| 'quiz'
	| 'assignment'
	| 'project'
	| 'exercise'
	| 'activity'
	| 'cancelled';

/**
 * Individual calendar activity/item
 */
export interface Activity {
	type: ActivityType;
	title: string;
	link?: string;
	time?: string; // e.g., "30m", "1h"
	due?: string; // ISO date string (YYYY-MM-DD)
}

/**
 * Calendar week containing class sessions and homework
 */
export interface Week {
	week: string; // Display label, e.g., "W01 - JAN 26"
	startDate: string; // ISO date string (YYYY-MM-DD) for current week detection
	class1: Activity[];
	class2: Activity[];
	homework: Activity[];
}

/**
 * Full calendar data structure
 */
export interface CalendarData {
	weeks: Week[];
}
