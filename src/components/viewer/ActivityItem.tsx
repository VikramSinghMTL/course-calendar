/**
 * ActivityItem component for rendering individual calendar activities
 */

import React from 'react';
import type { Activity } from '@/types';
import { formatDue } from '@/utils';

interface ActivityItemProps {
	activity: Activity;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
	const { type, title, link, time, due } = activity;

	// Cancelled activities have different styling
	if (type === 'cancelled') {
		return (
			<li className="vik-cancelled">
				<span>{title}</span>
			</li>
		);
	}

	const content = (
		<>
			<span>{title}</span>
			<span>
				{time && <sup>{time}</sup>}
				{due && time && <sup> • </sup>}
				{due && <sup>{formatDue(due)}</sup>}
			</span>
		</>
	);

	// Render as link if URL provided, otherwise plain item
	if (link) {
		return (
			<li>
				<a href={link} className={`vik-item vik-${type}`}>
					{content}
				</a>
			</li>
		);
	}

	return (
		<li>
			<span className={`vik-item vik-${type}`}>{content}</span>
		</li>
	);
};
