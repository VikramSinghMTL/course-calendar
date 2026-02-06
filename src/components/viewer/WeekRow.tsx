/**
 * WeekRow component for rendering a single week with classes and homework
 */

import React from 'react';
import type { Week } from '@/types';
import { ActivityItem } from './ActivityItem';
import {
	getCurrentWeekId,
	hasAnyCancelled,
	normalizeActivities,
} from '@/utils';

interface WeekRowProps {
	week: Week;
}

export const WeekRow: React.FC<WeekRowProps> = ({ week }) => {
	const { week: label, startDate, class1, class2, homework } = week;

	// Determine if this is the current week
	const rowId = getCurrentWeekId(startDate);

	// Normalize activities to filter out nulls
	const normalizedClass1 = normalizeActivities(class1);
	const normalizedClass2 = normalizeActivities(class2);
	const normalizedHomework = normalizeActivities(homework);

	// Check for cancelled classes
	const class1Cancelled = hasAnyCancelled(normalizedClass1);
	const class2Cancelled = hasAnyCancelled(normalizedClass2);

	return (
		<tr id={rowId}>
			<td className="vik-week">{label}</td>
			<td className={class1Cancelled ? 'vik-cancelled' : ''}>
				<ul>
					{normalizedClass1.map((activity, idx) => (
						<ActivityItem key={idx} activity={activity} />
					))}
				</ul>
			</td>
			<td className={class2Cancelled ? 'vik-cancelled' : ''}>
				<ul>
					{normalizedClass2.map((activity, idx) => (
						<ActivityItem key={idx} activity={activity} />
					))}
				</ul>
			</td>
			<td>
				<ul>
					{normalizedHomework.map((activity, idx) => (
						<ActivityItem key={idx} activity={activity} />
					))}
				</ul>
			</td>
		</tr>
	);
};
