/**
 * Legend component showing activity type colors
 */

import React from 'react';
import type { ActivityType } from '@/types';

const LEGEND_ITEMS: Array<{ type: ActivityType; label: string }> = [
	{
		type: 'lesson',
		label: "Lesson",
	},
	{
		type: 'quiz',
		label: 'Quiz',
	},
	{
		type: 'assignment',
		label: "Assignment",
	},
	{
		type: 'project',
		label: 'Project',
	},
	{
		type: 'exercise',
		label: "Exercise",
	},
	{
		type: 'activity',
		label: 'Activity',
	},
];

export const Legend: React.FC = () => {
	return (
		<ul className="vik-legend">
			{LEGEND_ITEMS.map(({ type, label }) => (
				<li key={type}>
					<span className={`vik-item vik-${type}`}>{label}</span>
				</li>
			))}
		</ul>
	);
};
