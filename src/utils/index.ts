/**
 * Central export for all utility functions
 */

export {
	formatDue,
	getCurrentWeekId,
	hasAnyCancelled,
	normalizeActivities,
} from './dateUtils';

export {
	fetchCalendar,
	fetchTerms,
	saveCalendar,
} from './api';
