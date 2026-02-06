/**
 * EditorCalendar component - main editor container with ReactSortable
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Activity, ColumnType, TermCode, CalendarData } from '@/types';
import { useCalendar, useAutoSave } from '@/hooks';
import { fetchTerms } from '@/utils';
import { EditorHeader } from './EditorHeader';
import { WeekEditor } from './WeekEditor';

const CURRENT_TERM = 'w26';

// Simple ID generator for activities
const generateId = () =>
	`activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Ensure all activities have IDs
const ensureActivityIds = (activity: Activity): Activity => {
	if (!activity.id) {
		return { ...activity, id: generateId() };
	}
	return activity;
};

export const EditorCalendar: React.FC = () => {
	const [currentTerm, setCurrentTerm] = useState<TermCode>(CURRENT_TERM);
	const [availableTerms, setAvailableTerms] = useState<TermCode[]>([
		CURRENT_TERM,
	]);

	const { calendarData, loading, error, setCalendarData } =
		useCalendar(currentTerm);
	const { saveStatus, scheduleSave } = useAutoSave(currentTerm, calendarData);

	// Fetch available terms
	useEffect(() => {
		const loadTerms = async () => {
			const terms = await fetchTerms();
			setAvailableTerms(terms);
		};
		loadTerms();
	}, []);

	// Ensure all activities have IDs when data loads
	useEffect(() => {
		if (!calendarData?.weeks) return;

		let needsUpdate = false;
		const updatedWeeks = calendarData.weeks.map((week) => {
			const class1 = week.class1.map((activity) => {
				if (!activity.id) {
					needsUpdate = true;
					return ensureActivityIds(activity);
				}
				return activity;
			});
			const class2 = week.class2.map((activity) => {
				if (!activity.id) {
					needsUpdate = true;
					return ensureActivityIds(activity);
				}
				return activity;
			});
			const homework = week.homework.map((activity) => {
				if (!activity.id) {
					needsUpdate = true;
					return ensureActivityIds(activity);
				}
				return activity;
			});

			return { ...week, class1, class2, homework };
		});

		if (needsUpdate) {
			setCalendarData({ weeks: updatedWeeks });
		}
	}, [calendarData?.weeks]);

	const handleUpdateColumn = useCallback(
		(weekIndex: number, columnType: ColumnType, newList: Activity[]) => {
			setCalendarData(
				(currentData: CalendarData | null): CalendarData | null => {
					if (!currentData?.weeks) return currentData;

					const weeks = [...currentData.weeks];
					const week = { ...weeks[weekIndex] };

					week[columnType] = newList;
					weeks[weekIndex] = week;

					return { ...currentData, weeks };
				}
			);
		},
		[setCalendarData]
	);

	const handleUpdateActivity = useCallback(
		(
			weekIndex: number,
			columnType: ColumnType,
			activityIndex: number,
			updates: Partial<Activity>
		) => {
			setCalendarData(
				(currentData: CalendarData | null): CalendarData | null => {
					if (!currentData?.weeks) return currentData;

					const weeks = [...currentData.weeks];
					const week = { ...weeks[weekIndex] };
					const activities = [...week[columnType]];

					activities[activityIndex] = {
						...activities[activityIndex],
						...updates,
					};
					week[columnType] = activities;
					weeks[weekIndex] = week;

					return { ...currentData, weeks };
				}
			);
		},
		[setCalendarData]
	);

	const handleDeleteActivity = useCallback(
		(weekIndex: number, columnType: ColumnType, activityIndex: number) => {
			setCalendarData(
				(currentData: CalendarData | null): CalendarData | null => {
					if (!currentData?.weeks) return currentData;

					const weeks = [...currentData.weeks];
					const week = { ...weeks[weekIndex] };
					const activities = [...week[columnType]];

					activities.splice(activityIndex, 1);
					week[columnType] = activities;
					weeks[weekIndex] = week;

					return { ...currentData, weeks };
				}
			);
		},
		[setCalendarData]
	);

	const handleDuplicateActivity = useCallback(
		(weekIndex: number, columnType: ColumnType, activityIndex: number) => {
			setCalendarData(
				(currentData: CalendarData | null): CalendarData | null => {
					if (!currentData?.weeks) return currentData;

					const weeks = [...currentData.weeks];
					const week = { ...weeks[weekIndex] };
					const activities = [...week[columnType]];

					const duplicate = {
						...activities[activityIndex],
						id: generateId(),
					};
					activities.splice(activityIndex + 1, 0, duplicate);
					week[columnType] = activities;
					weeks[weekIndex] = week;

					return { ...currentData, weeks };
				}
			);
		},
		[setCalendarData]
	);

	const handleAddActivity = useCallback(
		(weekIndex: number, columnType: ColumnType) => {
			setCalendarData(
				(currentData: CalendarData | null): CalendarData | null => {
					if (!currentData?.weeks) return currentData;

					const weeks = [...currentData.weeks];
					const week = { ...weeks[weekIndex] };
					const activities = [...week[columnType]];

					activities.push({
						id: generateId(),
						type: 'lesson',
						title: 'New Activity',
					});

					week[columnType] = activities;
					weeks[weekIndex] = week;

					return { ...currentData, weeks };
				}
			);
		},
		[setCalendarData]
	);

	const handleDeleteWeek = useCallback(
		(weekIndex: number) => {
			if (!confirm('Delete this week?')) return;

			setCalendarData(
				(currentData: CalendarData | null): CalendarData | null => {
					if (!currentData?.weeks) return currentData;

					const weeks = [...currentData.weeks];
					weeks.splice(weekIndex, 1);

					return { ...currentData, weeks };
				}
			);
		},
		[setCalendarData]
	);

	const handleAddWeek = useCallback(() => {
		setCalendarData(
			(currentData: CalendarData | null): CalendarData | null => {
				if (!currentData?.weeks) return currentData;

				const weeks = [...currentData.weeks];

				weeks.push({
					week: `W${weeks.length.toString().padStart(2, '0')}`,
					startDate: new Date().toISOString().split('T')[0],
					class1: [],
					class2: [],
					homework: [],
				});

				return { ...currentData, weeks };
			}
		);
	}, [setCalendarData]);

	if (loading) {
		return <div style={{ padding: '2rem' }}>Loading calendar...</div>;
	}

	if (error) {
		return (
			<div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>
		);
	}

	if (!calendarData?.weeks) {
		return (
			<div style={{ padding: '2rem' }}>No calendar data available</div>
		);
	}

	return (
		<div>
			<EditorHeader
				currentTerm={currentTerm}
				availableTerms={availableTerms}
				saveStatus={saveStatus}
				onTermChange={setCurrentTerm}
			/>

			<div style={{ padding: '1rem' }}>
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
						{calendarData.weeks.map((week, weekIndex) => (
							<WeekEditor
								key={weekIndex}
								week={week}
								weekIndex={weekIndex}
								onUpdateColumn={(col, newList) =>
									handleUpdateColumn(weekIndex, col, newList)
								}
								onUpdateActivity={(col, idx, updates) =>
									handleUpdateActivity(
										weekIndex,
										col,
										idx,
										updates
									)
								}
								onDeleteActivity={(col, idx) =>
									handleDeleteActivity(weekIndex, col, idx)
								}
								onDuplicateActivity={(col, idx) =>
									handleDuplicateActivity(weekIndex, col, idx)
								}
								onAddActivity={(col) =>
									handleAddActivity(weekIndex, col)
								}
								onDeleteWeek={() => handleDeleteWeek(weekIndex)}
							/>
						))}
					</tbody>
				</table>

				<button
					onClick={handleAddWeek}
					style={{
						marginTop: '1rem',
						padding: '1rem',
						width: '100%',
						fontFamily: 'monospace',
						fontSize: '1rem',
						backgroundColor: 'var(--accent-color)',
						color: 'white',
						border: 'none',
						borderRadius: '5px',
						cursor: 'pointer',
					}}
				>
					+ Add Week
				</button>
			</div>
		</div>
	);
};
