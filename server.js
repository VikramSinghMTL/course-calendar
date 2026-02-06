import fs from 'fs';

const PORT = 3000;

Bun.serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		const { pathname } = url;

		// CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		// Handle preflight requests
		if (req.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// API: Get calendar data
		if (pathname.startsWith('/api/calendar/') && req.method === 'GET') {
			const term = pathname.split('/api/calendar/')[1];
			const filename = `./calendar-${term}.json`;

			try {
				// Use fs.readFileSync to avoid Bun's file caching
				const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
				console.log(
					`📖 Loaded calendar-${term}.json (${data.weeks?.length || 0} weeks)`
				);
				if (data.weeks?.[0]?.class1?.[0]) {
					console.log(
						'   First activity:',
						data.weeks[0].class1[0].title
					);
				}
				return Response.json(data, { headers: corsHeaders });
			} catch (error) {
				return Response.json(
					{ error: 'Calendar not found' },
					{ status: 404, headers: corsHeaders }
				);
			}
		}

		// API: Save calendar data
		if (pathname.startsWith('/api/calendar/') && req.method === 'POST') {
			const term = pathname.split('/api/calendar/')[1];
			const filename = `./calendar-${term}.json`;

			try {
				const body = await req.json();
				console.log(
					`💾 Saving calendar-${term}.json (${body.weeks?.length || 0} weeks)`
				);

				// Log first activity of first week for debugging
				if (body.weeks?.[0]?.class1?.[0]) {
					console.log(
						'   First activity:',
						body.weeks[0].class1[0].title
					);
				}

				// Use fs.writeFileSync for immediate write without caching
				fs.writeFileSync(filename, JSON.stringify(body, null, '\t'));
				console.log(`✓ Saved calendar-${term}.json to disk`);
				return Response.json(
					{ success: true, timestamp: new Date().toISOString() },
					{ headers: corsHeaders }
				);
			} catch (error) {
				console.error('Save failed:', error);
				return Response.json(
					{ error: 'Failed to save calendar' },
					{ status: 500, headers: corsHeaders }
				);
			}
		}

		// API: List available terms
		if (pathname === '/api/terms' && req.method === 'GET') {
			const files = fs
				.readdirSync('.')
				.filter((f) => f.startsWith('calendar-') && f.endsWith('.json'))
				.map((f) => f.replace('calendar-', '').replace('.json', ''));
			return Response.json(files, { headers: corsHeaders });
		}

		// Serve static files
		const filePath = pathname === '/' ? './index.html' : `.${pathname}`;

		// Handle TypeScript/JSX files - transpile them
		if (
			filePath.endsWith('.tsx') ||
			filePath.endsWith('.ts') ||
			filePath.endsWith('.jsx') ||
			filePath.endsWith('.js')
		) {
			const file = Bun.file(filePath);

			if (await file.exists()) {
				try {
					const build = await Bun.build({
						entrypoints: [filePath],
						target: 'browser',
						format: 'esm',
						splitting: false,
						minify: false,
						sourcemap: 'none',
					});

					if (build.outputs.length > 0) {
						const output = await build.outputs[0].text();
						return new Response(output, {
							headers: {
								'Content-Type':
									'application/javascript; charset=utf-8',
								'Cache-Control': 'no-cache',
							},
						});
					} else {
						console.error(
							'Build produced no output for:',
							filePath
						);
						return new Response('Build failed: no output', {
							status: 500,
							headers: { 'Content-Type': 'text/plain' },
						});
					}
				} catch (error) {
					console.error('Transpile error:', error);
					return new Response(`Error transpiling: ${error.message}`, {
						status: 500,
						headers: { 'Content-Type': 'text/plain' },
					});
				}
			}
		}

		const file = Bun.file(filePath);
		if (await file.exists()) {
			return new Response(file);
		}

		// Fallback to index.html for client-side routing
		if (!pathname.startsWith('/api')) {
			return new Response(Bun.file('./index.html'));
		}

		return new Response('Not Found', { status: 404 });
	},
});

console.log(`\n📅 Course Calendar Editor`);
console.log(`   Viewer: http://localhost:${PORT}/`);
console.log(`   Editor: http://localhost:${PORT}/editor`);
console.log(`\n   Auto-save enabled ✓\n`);
