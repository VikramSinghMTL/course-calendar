#!/usr/bin/env bun
import {
	copyFileSync,
	mkdirSync,
	writeFileSync,
	existsSync,
	rmSync,
	readdirSync,
	readFileSync,
} from 'fs';
import { join } from 'path';

const DOCS_DIR = 'docs';
const DIST_DIR = join(DOCS_DIR, 'dist');

type WeekRange = { start: number; end: number };

function parseWeekRange(args: string[]): WeekRange | undefined {
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

function weekNumber(label: string): number | undefined {
	const match = label.match(/^W(\d+)/i);
	return match ? Number(match[1]) : undefined;
}

const weekRange = parseWeekRange(Bun.argv.slice(2));

// Clean previous build
if (existsSync(DOCS_DIR)) {
	rmSync(DOCS_DIR, { recursive: true });
}

// Create docs directory structure
mkdirSync(DIST_DIR, { recursive: true });

console.log('📦 Building React app...');

// Build the React app
const buildResult = await Bun.build({
	entrypoints: ['./src/index.tsx'],
	outdir: DIST_DIR,
	target: 'browser',
	minify: true,
	splitting: true,
	naming: {
		entry: '[name]-[hash].[ext]',
		chunk: 'chunks/[name]-[hash].[ext]',
		asset: 'assets/[name]-[hash].[ext]',
	},
});

if (!buildResult.success) {
	console.error('❌ Build failed:', buildResult.logs);
	process.exit(1);
}

console.log('✓ React app built successfully');

// Copy CSS
console.log('📋 Copying styles...');
mkdirSync(join(DIST_DIR, 'styles'), { recursive: true });
copyFileSync('src/styles/viewer.css', join(DIST_DIR, 'styles/viewer.css'));

// Copy calendar JSON files, optionally retaining only an inclusive week range.
console.log(
	weekRange
		? `📋 Copying calendar data (weeks W${weekRange.start}–W${weekRange.end})...`
		: '📋 Copying calendar data...'
);
const calendarFiles = readdirSync('.')
	.filter((file) => /^calendar-.+\.json$/.test(file))
	.sort();

calendarFiles.forEach((file) => {
	if (!weekRange) {
		copyFileSync(file, join(DOCS_DIR, file));
		return;
	}

	const calendar = JSON.parse(readFileSync(file, 'utf8'));
	if (!Array.isArray(calendar.weeks)) {
		throw new Error(`${file} does not contain a weeks array.`);
	}

	const weeks = calendar.weeks.filter((week: { week?: string }) => {
		const number = typeof week.week === 'string' ? weekNumber(week.week) : undefined;
		return number !== undefined && number >= weekRange.start && number <= weekRange.end;
	});

	writeFileSync(join(DOCS_DIR, file), JSON.stringify({ ...calendar, weeks }, null, '\t'));
	console.log(`   - ${file}: ${weeks.length} weeks`);
});

// Create index.html from viewer.html template
console.log('📝 Generating index.html...');
const buildOutputs = buildResult.outputs;
const jsFile = buildOutputs.find((o) => o.path.endsWith('.js'));
const jsFileName = jsFile ? jsFile.path.split('/').pop() : 'index.js';

const html = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Course Calendar</title>
		<link rel="stylesheet" href="./dist/styles/viewer.css" />
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="./dist/${jsFileName}"></script>
	</body>
</html>`;

writeFileSync(join(DOCS_DIR, 'index.html'), html);

console.log('✅ Build complete! Output in docs/');
console.log('📁 Files generated:');
console.log('   - docs/index.html');
console.log('   - docs/dist/');
console.log('   - docs/calendar-*.json');
