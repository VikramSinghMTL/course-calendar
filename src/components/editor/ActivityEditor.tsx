/**
 * ActivityEditor component for editing individual activities
 */

import React, { useRef, useEffect } from 'react';
import type { Activity, ActivityType } from '@/types';

interface ActivityEditorProps {
	activity: Activity;
	onUpdate: (updates: Partial<Activity>) => void;
	onDelete: () => void;
	onDuplicate: () => void;
}

const ACTIVITY_TYPES: ActivityType[] = [
	'lesson',
	'quiz',
	'assignment',
	'project',
	'exercise',
	'activity',
	'cancelled',
];

export const ActivityEditor: React.FC<ActivityEditorProps> = ({
	activity,
	onUpdate,
	onDelete,
	onDuplicate,
}) => {
	const titleRef = useRef<HTMLSpanElement>(null);
	const linkRef = useRef<HTMLInputElement>(null);
	const timeRef = useRef<HTMLInputElement>(null);
	const dueRef = useRef<HTMLInputElement>(null);

	// Update contenteditable text on activity change
	useEffect(() => {
		if (
			titleRef.current &&
			titleRef.current.textContent !== activity.title
		) {
			titleRef.current.textContent = activity.title;
		}
	}, [activity.title]);

	const handleTitleBlur = () => {
		if (titleRef.current) {
			onUpdate({ title: titleRef.current.textContent || '' });
		}
	};

	if (activity.type === 'cancelled') {
		return (
			<li
				className="vik-cancelled"
				style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
			>
				<span
					ref={titleRef}
					contentEditable
					suppressContentEditableWarning
					onBlur={handleTitleBlur}
					style={{ flex: 1 }}
				>
					{activity.title}
				</span>
				<button
					onClick={onDelete}
					style={{ padding: '0.25rem 0.5rem' }}
				>
					🗑️
				</button>
			</li>
		);
	}

	return (
		<li style={{ marginBottom: '0.5rem' }}>
			<div
				className={`vik-item vik-${activity.type}`}
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '0.5rem',
				}}
			>
				<div
					style={{
						display: 'flex',
						gap: '0.5rem',
						alignItems: 'center',
					}}
				>
					<select
						value={activity.type}
						onChange={(e) =>
							onUpdate({ type: e.target.value as ActivityType })
						}
						style={{ padding: '0.25rem', fontFamily: 'monospace' }}
					>
						{ACTIVITY_TYPES.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>

					<span
						ref={titleRef}
						contentEditable
						suppressContentEditableWarning
						onBlur={handleTitleBlur}
						style={{ flex: 1, outline: 'none' }}
					>
						{activity.title}
					</span>

					<button
						onClick={onDuplicate}
						style={{ padding: '0.25rem 0.5rem' }}
					>
						📋
					</button>
					<button
						onClick={onDelete}
						style={{ padding: '0.25rem 0.5rem' }}
					>
						🗑️
					</button>
				</div>

				<div
					style={{
						display: 'flex',
						gap: '0.5rem',
						fontSize: '0.9rem',
					}}
				>
					<input
						ref={linkRef}
						type="url"
						placeholder="Link (optional)"
						value={activity.link || ''}
						onChange={(e) => onUpdate({ link: e.target.value })}
						style={{
							flex: 1,
							padding: '0.25rem',
							fontFamily: 'monospace',
						}}
					/>
					<input
						ref={timeRef}
						type="text"
						placeholder="Time"
						value={activity.time || ''}
						onChange={(e) => onUpdate({ time: e.target.value })}
						style={{
							width: '5rem',
							padding: '0.25rem',
							fontFamily: 'monospace',
						}}
					/>
					<input
						ref={dueRef}
						type="date"
						value={activity.due || ''}
						onChange={(e) => onUpdate({ due: e.target.value })}
						style={{ padding: '0.25rem', fontFamily: 'monospace' }}
					/>
				</div>
			</div>
		</li>
	);
};
