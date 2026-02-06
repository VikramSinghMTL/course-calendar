/**
 * WeekEditor component for managing activities in a single week
 */

import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import type { Week, Activity, ColumnType } from '@/types';
import { ActivityEditor } from './ActivityEditor';

interface WeekEditorProps {
	week: Week;
	weekIndex: number;
	onUpdateActivity: (
		columnType: ColumnType,
		activityIndex: number,
		updates: Partial<Activity>
	) => void;
	onDeleteActivity: (columnType: ColumnType, activityIndex: number) => void;
	onDuplicateActivity: (
		columnType: ColumnType,
		activityIndex: number
	) => void;
	onAddActivity: (columnType: ColumnType) => void;
	onDeleteWeek: () => void;
	onUpdateColumn: (columnType: ColumnType, newList: Activity[]) => void;
}

export const WeekEditor: React.FC<WeekEditorProps> = ({
	week,
	weekIndex,
	onUpdateActivity,
	onDeleteActivity,
	onDuplicateActivity,
	onAddActivity,
	onDeleteWeek,
	onUpdateColumn,
}) => {
	const renderColumn = (columnType: ColumnType, activities: Activity[]) => (
		<td>
			<ReactSortable
				list={activities as any[]}
				setList={(newList) =>
					onUpdateColumn(columnType, newList as Activity[])
				}
				group="activities"
				animation={150}
				className={`sortable-list ${columnType}`}
				tag="ul"
			>
				{activities.map((activity, activityIndex) => (
					<ActivityEditor
						key={activity.id || activityIndex}
						activity={activity}
						onUpdate={(updates) =>
							onUpdateActivity(columnType, activityIndex, updates)
						}
						onDelete={() =>
							onDeleteActivity(columnType, activityIndex)
						}
						onDuplicate={() =>
							onDuplicateActivity(columnType, activityIndex)
						}
					/>
				))}
			</ReactSortable>
			<button
				onClick={() => onAddActivity(columnType)}
				style={{
					marginTop: '0.5rem',
					padding: '0.5rem',
					width: '100%',
					fontFamily: 'monospace',
				}}
			>
				+ Add Activity
			</button>
		</td>
	);

	return (
		<tr>
			<td className="vik-week">
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '0.5rem',
						alignItems: 'center',
					}}
				>
					<span>{week.week}</span>
					<button
						onClick={onDeleteWeek}
						style={{
							padding: '0.25rem 0.5rem',
							fontSize: '0.8rem',
						}}
						title="Delete week"
					>
						🗑️
					</button>
				</div>
			</td>
			{renderColumn('class1', week.class1)}
			{renderColumn('class2', week.class2)}
			{renderColumn('homework', week.homework)}
		</tr>
	);
};
