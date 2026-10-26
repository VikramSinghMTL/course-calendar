#!/usr/bin/env bun
/**
 * Check the current term's calendar for mistakes students would see.
 *
 * Problems in published weeks (--weeks range) are errors and fail the check;
 * problems in later, unpublished weeks are reported as warnings.
 */
import { readdirSync, readFileSync } from 'fs';
import { CURRENT_TERM } from './src/config';
import { ACTIVITY_TYPES } from './src/types/calendar';
import { parseWeekRange, weekNumber } from './week-range';

const COLUMNS = ['class1', 'class2', 'homework'] as const;
const ACTIVITY_KEYS = ['type', 'title', 'link', 'time', 'due', 'note'];
const MONTHS = [
	'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
	'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const file = `calendar-${CURRENT_TERM}.json`;
const weekRange = parseWeekRange(Bun.argv.slice(2));
const calendar = JSON.parse(readFileSync(file, 'utf8'));

const errors: string[] = [];
const warnings: string[] = [];

function parseIsoDate(value: unknown): Date | undefined {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return undefined;
	}
	const date = new Date(`${value}T00:00:00Z`);
	return date.toISOString().startsWith(value) ? date : undefined;
}

function moodleId(link: string): string | undefined {
	const url = new URL(link);
	return url.hostname === 'moodle.johnabbott.qc.ca'
		? (url.searchParams.get('id') ?? undefined)
		: undefined;
}

// Moodle IDs are unique per course offering, so one that appears in another
// term's file is almost certainly a stale copy-paste.
const otherTermMoodleIds = new Map<string, string>();
for (const other of readdirSync('.')) {
	if (!/^calendar-.+\.json$/.test(other) || other === file) continue;
	for (const match of readFileSync(other, 'utf8').matchAll(
		/moodle\.johnabbott\.qc\.ca\/[^"]*[?&]id=(\d+)/g
	)) {
		otherTermMoodleIds.set(match[1], other);
	}
}

function checkActivity(activity: any, weekStart: Date | undefined): string[] {
	const problems: string[] = [];

	for (const key of Object.keys(activity)) {
		if (!ACTIVITY_KEYS.includes(key)) {
			problems.push(`unknown field "${key}"`);
		}
	}

	if (!ACTIVITY_TYPES.includes(activity.type)) {
		problems.push(
			`type "${activity.type}" is not one of ${ACTIVITY_TYPES.join(', ')}`
		);
	}

	if (typeof activity.title !== 'string' || !activity.title.trim()) {
		problems.push('missing title');
	}

	if (
		activity.time !== undefined &&
		!/^(?=\d)(\d+h)?(\d+m)?$/.test(activity.time)
	) {
		problems.push(`time "${activity.time}" should look like 30m, 1h or 1h30m`);
	}

	if (activity.due !== undefined) {
		const due = parseIsoDate(activity.due);
		if (!due) {
			problems.push(`due "${activity.due}" is not a YYYY-MM-DD date`);
		} else if (weekStart && due < weekStart) {
			problems.push(`due ${activity.due} is before this week starts`);
		}
	}

	if (activity.link !== undefined) {
		let id: string | undefined;
		try {
			id = moodleId(activity.link);
		} catch {
			problems.push(`link "${activity.link}" is not a valid URL`);
		}
		if (id && otherTermMoodleIds.has(id)) {
			problems.push(
				`Moodle link id=${id} is from ${otherTermMoodleIds.get(id)}`
			);
		}
	}

	return problems;
}

for (const week of calendar.weeks ?? []) {
	const label = typeof week.week === 'string' ? week.week : '(no label)';
	const number = weekNumber(label);
	const published =
		!weekRange ||
		(number !== undefined &&
			number >= weekRange.start &&
			number <= weekRange.end);
	const report = (message: string) =>
		(published ? errors : warnings).push(`${label}: ${message}`);

	const start = parseIsoDate(week.startDate);
	const labelMatch = label.match(/^W\d{2} - ([A-Z]{3}) (\d{2})$/);
	if (!labelMatch) {
		report('label should look like "W08 - OCT 19"');
	}
	if (!start) {
		report(`startDate "${week.startDate}" is not a YYYY-MM-DD date`);
	} else {
		const expected = `${MONTHS[start.getUTCMonth()]} ${String(start.getUTCDate()).padStart(2, '0')}`;
		if (labelMatch && `${labelMatch[1]} ${labelMatch[2]}` !== expected) {
			report(`label date does not match startDate ${week.startDate}`);
		}
		if (start.getUTCDay() !== 1) {
			warnings.push(`${label}: startDate ${week.startDate} is not a Monday`);
		}
	}

	for (const column of COLUMNS) {
		if (!Array.isArray(week[column])) {
			report(`${column} is not a list`);
			continue;
		}
		for (const activity of week[column]) {
			const title = activity?.title ?? activity?.type ?? '(empty)';
			for (const problem of checkActivity(activity ?? {}, start)) {
				report(`${column} "${title}": ${problem}`);
			}
		}
	}
}

for (const warning of warnings) console.warn(`⚠️  ${warning}`);
for (const error of errors) console.error(`❌ ${error}`);

if (errors.length) {
	console.error(`\n${file}: ${errors.length} error(s) in published weeks.`);
	process.exit(1);
}
console.log(
	`✓ ${file} OK${warnings.length ? ` (${warnings.length} warning(s))` : ''}`
);
