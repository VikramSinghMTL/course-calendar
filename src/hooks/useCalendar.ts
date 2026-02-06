/**
 * Hook for loading and managing calendar data
 */

import { useState, useEffect } from 'react';
import type { CalendarData, TermCode } from '@/types';
import { fetchCalendar } from '@/utils';

interface UseCalendarResult {
	calendarData: CalendarData | null;
	loading: boolean;
	error: string | null;
	setCalendarData: React.Dispatch<React.SetStateAction<CalendarData | null>>;
	reload: () => Promise<void>;
}

export function useCalendar(term: TermCode): UseCalendarResult {
	const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadCalendar = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await fetchCalendar(term);
			setCalendarData(data);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to load calendar'
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadCalendar();
	}, [term]);

	return {
		calendarData,
		loading,
		error,
		setCalendarData,
		reload: loadCalendar,
	};
}
