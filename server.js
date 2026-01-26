const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Get calendar data for a specific term
app.get('/api/calendar/:term', (req, res) => {
	const term = req.params.term;
	const filename = path.join(__dirname, `calendar-${term}.json`);

	try {
		const data = fs.readFileSync(filename, 'utf8');
		res.json(JSON.parse(data));
	} catch (error) {
		res.status(404).json({ error: 'Calendar not found' });
	}
});

// Save calendar data (auto-save endpoint)
app.post('/api/calendar/:term', (req, res) => {
	const term = req.params.term;
	const filename = path.join(__dirname, `calendar-${term}.json`);

	try {
		// Write with tabs for readability
		fs.writeFileSync(filename, JSON.stringify(req.body, null, '\t'));
		console.log(`✓ Saved calendar-${term}.json`);
		res.json({ success: true, timestamp: new Date().toISOString() });
	} catch (error) {
		console.error('Save failed:', error);
		res.status(500).json({ error: 'Failed to save calendar' });
	}
});

// List available terms
app.get('/api/terms', (req, res) => {
	const files = fs
		.readdirSync(__dirname)
		.filter((f) => f.startsWith('calendar-') && f.endsWith('.json'))
		.map((f) => f.replace('calendar-', '').replace('.json', ''));
	res.json(files);
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`\n📅 Course Calendar Editor`);
	console.log(`   Editor: http://localhost:${PORT}/editor.html`);
	console.log(`   Viewer: http://localhost:${PORT}/index.html`);
	console.log(`\n   Auto-save enabled ✓\n`);
});
