/**
 * Hook for auto-saving calendar data with debouncing
 */

import { useEffect, useRef, useState } from 'react';
import type { CalendarData, SaveStatus, TermCode } from '@/types';
import { saveCalendar } from '@/utils';

const AUTOSAVE_DELAY = 1000; // 1 second debounce

interface UseAutoSaveResult {
	saveStatus: SaveStatus;
	scheduleSave: () => void;
}

export function useAutoSave(
	term: TermCode,
	calendarData: CalendarData | null
): UseAutoSaveResult {
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isInitialMount = useRef(true);

	const scheduleSave = () => {
		// Clear any pending save
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		setSaveStatus('saving');

		// Schedule new save after debounce delay
		saveTimeoutRef.current = setTimeout(async () => {
			if (!calendarData) return;

			try {
				console.log('Saving calendar data for term:', term);
				await saveCalendar(term, calendarData);
				console.log('✓ Calendar saved successfully');
				setSaveStatus('saved');
			} catch (error) {
				console.error('Auto-save failed:', error);
				setSaveStatus('error');
			}
		}, AUTOSAVE_DELAY);
	};

	// Auto-save when calendar data changes (except initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		if (calendarData) {
			console.log('Auto-save triggered for term:', term);
			scheduleSave();
		}
	}, [calendarData]);

	// Also trigger save when term changes
	useEffect(() => {
		if (!isInitialMount.current && calendarData) {
			console.log('Term changed, scheduling save');
			scheduleSave();
		}
	}, [term]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

	return {
		saveStatus,
		scheduleSave,
	};
}
