#!/usr/bin/env bun
import { copyFileSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const DOCS_DIR = 'docs';
const DIST_DIR = join(DOCS_DIR, 'dist');

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

// Copy calendar JSON files
console.log('📋 Copying calendar data...');
['calendar-f24.json', 'calendar-f25.json', 'calendar-w26.json'].forEach(
	(file) => {
		copyFileSync(file, join(DOCS_DIR, file));
	}
);

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
