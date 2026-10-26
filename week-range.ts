/**
 * Inclusive range of published week numbers, shared by the build and check
 */

export type WeekRange = { start: number; end: number };

export function parseWeekRange(args: string[]): WeekRange | undefined {
	const optionIndex = args.findIndex(
		(arg) => arg === '--weeks' || arg.startsWith('--weeks=')
	);
	if (optionIndex === -1) return undefined;

	const value = args[optionIndex].startsWith('--weeks=')
		? args[optionIndex].slice('--weeks='.length)
		: args[optionIndex + 1];
	const match = value?.match(/^(\d+)\s*-\s*(\d+)$/);

	if (!match || Number(match[1]) > Number(match[2])) {
		throw new Error(
			'Invalid --weeks value. Use an inclusive range, e.g. --weeks 3-8.'
		);
	}

	return { start: Number(match[1]), end: Number(match[2]) };
}

export function weekNumber(label: string): number | undefined {
	const match = label.match(/^W(\d+)/i);
	return match ? Number(match[1]) : undefined;
}
