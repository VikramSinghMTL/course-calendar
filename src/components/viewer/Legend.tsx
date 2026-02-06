/**
 * Legend component showing activity type colors
 */

import React from 'react';
import type { ActivityType } from '@/types';

const LEGEND_ITEMS: Array<{ type: ActivityType; label: string }> = [
	{
		type: 'lesson',
		label: "Lessons will be a mix of lectures, demonstrations, and hands-on activities designed to help you understand the material and apply it in practical ways. At the end of each week, it is in your best interest to review the previous week's lesson on the course notes website to prepare for the next quiz. ",
	},
	{
		type: 'quiz',
		label: 'Each quiz is worth 4% and your lowest one is automatically dropped. You must be physically in the classroom to take the quiz. They will be two-stage which means one part is individual and the other part is collaborative.',
	},
	{
		type: 'assignment',
		label: "Each assignment is worth 6% with 1% coming from the exercises of the prior week, effectively making the assignment worth 5% on its own. Assignment weeks are up to you to manage your time, I'll be in the lab during class time as usual. Since all the apps you build must work on both iOS and Android, you will need to come in at least once to test.",
	},
	{
		type: 'project',
		label: 'The project is being decided upon by Michael and myself, so stay tuned later in the semester for details on specifics.',
	},
	{
		type: 'exercise',
		label: "Each week's worth of exercises all combine to make 1/6 per cent of the following week's assignment grade. Exercises are designed to be completed in class, but you can submit by the end of the day Friday.",
	},
	{
		type: 'activity',
		label: 'Each assignment will have a peer assessment component. You will test the apps of three peers per assignment and provide feedback.',
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
