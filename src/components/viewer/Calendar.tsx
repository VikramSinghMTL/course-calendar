/**
 * Calendar component - main viewer container
 */

import React, { useEffect, useState } from 'react';
import type { CalendarData } from '@/types';
import { Legend } from './Legend';
import { WeekRow } from './WeekRow';
import { fetchCalendar } from '@/utils';

// Current term code - update this to switch semesters
const CURRENT_TERM = 'f26';

export const Calendar: React.FC = () => {
	const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadCalendar = async () => {
			try {
				setLoading(true);
				const data = await fetchCalendar(CURRENT_TERM);
				setCalendarData(data);
				setError(null);

				// Scroll to current week after data loads
				setTimeout(() => {
					const currentWeek = document.getElementById('current-week');
					if (currentWeek) {
						currentWeek.scrollIntoView({
							behavior: 'smooth',
							block: 'center',
						});
					}
				}, 100);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load calendar'
				);
			} finally {
				setLoading(false);
			}
		};

		loadCalendar();
	}, []);

	if (loading) {
		return <div>Loading calendar...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!calendarData?.weeks) {
		return <div>No calendar data available</div>;
	}

	return (
		<div>
			<Legend />

			<table className="vik-table">
				<thead>
					<tr>
						<th>Week</th>
						<th>Class 1</th>
						<th>Class 2</th>
						<th>Homework</th>
					</tr>
				</thead>
				<tbody>
					{calendarData.weeks.map((week, idx) => (
						<WeekRow key={idx} week={week} />
					))}
				</tbody>
			</table>
		</div>
	);
};
