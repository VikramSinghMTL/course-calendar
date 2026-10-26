const DEFAULT_PORT = 3000;
const requestedPort = Number(Bun.env.PORT) || DEFAULT_PORT;

const serverOptions = {
	hostname: '127.0.0.1',
	async fetch(req) {
		const url = new URL(req.url);
		const { pathname } = url;

		// Serve static files
		const filePath = pathname === '/' ? './viewer.html' : `.${pathname}`;

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

		return new Response('Not Found', { status: 404 });
	},
};

// Bind specifically to localhost so an existing localhost service is detected
// instead of being shadowed by a wildcard listener.
let server;
let port = requestedPort;
while (port <= 65535) {
	try {
		server = Bun.serve({ ...serverOptions, port });
		break;
	} catch (error) {
		if (error?.code !== 'EADDRINUSE') throw error;
		console.warn(`Port ${port} is in use; trying ${port + 1}...`);
		port += 1;
	}
}

if (!server) {
	throw new Error(`No available port found starting at ${requestedPort}`);
}

console.log(`\n📅 Course Calendar: http://localhost:${port}/\n`);
