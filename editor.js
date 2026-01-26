let calendarData = null;
let currentTerm = 'w26';
let saveTimeout = null;
const AUTOSAVE_DELAY = 1000; // 1 second debounce

// Activity type options
const ACTIVITY_TYPES = [
	'lesson',
	'quiz',
	'assignment',
	'project',
	'exercise',
	'activity',
	'cancelled',
];

// Initialize
async function init() {
	// Load term from localStorage or default
	currentTerm = localStorage.getItem('currentTerm') || 'w26';
	document.getElementById('term-selector').value = currentTerm;

	// Load calendar
	await loadCalendar(currentTerm);

	// Set up event listeners
	document
		.getElementById('term-selector')
		.addEventListener('change', handleTermChange);
	document.getElementById('add-week-btn').addEventListener('click', addWeek);
}

// Load calendar from server
async function loadCalendar(term) {
	try {
		setSaveStatus('loading', '⏳ Loading...');
		const response = await fetch(`/api/calendar/${term}`);
		calendarData = await response.json();
		currentTerm = term;
		localStorage.setItem('currentTerm', term);
		renderCalendar();
		setSaveStatus('saved', '✓ Loaded');
	} catch (error) {
		setSaveStatus('error', '✗ Failed to load');
		console.error('Failed to load calendar:', error);
	}
}

// Save calendar to server (debounced)
function scheduleSave() {
	setSaveStatus('saving', '💾 Saving...');

	// Clear existing timeout
	if (saveTimeout) {
		clearTimeout(saveTimeout);
	}

	// Schedule save
	saveTimeout = setTimeout(async () => {
		try {
			const response = await fetch(`/api/calendar/${currentTerm}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(calendarData),
			});

			if (response.ok) {
				setSaveStatus('saved', '✓ Saved');
			} else {
				setSaveStatus('error', '✗ Save failed');
			}
		} catch (error) {
			setSaveStatus('error', '✗ Save failed');
			console.error('Save failed:', error);
		}
	}, AUTOSAVE_DELAY);
}

// Set save status indicator
function setSaveStatus(status, text) {
	const statusEl = document.getElementById('save-status');
	statusEl.className = `save-status ${status}`;
	statusEl.textContent = text;
}

// Handle term change
async function handleTermChange(e) {
	const newTerm = e.target.value;
	await loadCalendar(newTerm);
}

// Render calendar table
function renderCalendar() {
	const container = document.getElementById('calendar-container');

	let html = '<table class="vik-table"><thead><tr>';
	html +=
		'<th>Week</th><th>Class 1 (M)</th><th>Class 2 (F)</th><th>Homework</th>';
	html += '</tr></thead><tbody>';

	calendarData.weeks.forEach((week, weekIndex) => {
		html += `<tr data-week-index="${weekIndex}">`;

		// Week column
		html += '<td class="vik-week">';
		html += `<div contenteditable="true" class="editable-week" data-week-index="${weekIndex}" data-field="week">${week.week}</div>`;
		html += `<div contenteditable="true" class="editable-date" data-week-index="${weekIndex}" data-field="startDate" style="font-size: 0.7rem; margin-top: 4px;">${week.startDate}</div>`;
		html += `<div class="week-controls" style="margin-top: 8px;">`;
		html += `<button class="edit-btn delete-btn" onclick="deleteWeek(${weekIndex})">Delete Week</button>`;
		html += `</div>`;
		html += '</td>';

		// Class 1, Class 2, Homework columns
		['class1', 'class2', 'homework'].forEach((column) => {
			html += `<td><ul class="dnd-list" data-week="${weekIndex}" data-column="${column}">`;

			// Filter out null/undefined activities before rendering
			const validActivities = week[column].filter((a) => a != null);
			validActivities.forEach((activity, activityIndex) => {
				html += renderActivity(
					activity,
					weekIndex,
					column,
					activityIndex
				);
			});

			html += `<li class="edit-controls">`;
			html += `<button class="edit-btn add-btn" onclick="addActivity(${weekIndex}, '${column}')">+ Add</button>`;
			html += `</li>`;
			html += '</ul></td>';
		});

		html += '</tr>';
	});

	html += '</tbody></table>';
	container.innerHTML = html;

	// Attach event listeners for contenteditable fields
	attachEditListeners();

	// Attach drag-and-drop listeners
	attachDnDListeners();
}

// Render a single activity
function renderActivity(activity, weekIndex, column, activityIndex) {
	const isCancelled = activity.type === 'cancelled';

	let html = `<li class="vik-item vik-${activity.type} dnd-activity" draggable="true" data-week="${weekIndex}" data-column="${column}" data-activity-index="${activityIndex}">`;

	// Type selector
	html += `<select class="type-selector" data-week="${weekIndex}" data-column="${column}" data-activity="${activityIndex}" onchange="changeActivityType(this)">`;
	ACTIVITY_TYPES.forEach((type) => {
		html += `<option value="${type}" ${activity.type === type ? 'selected' : ''}>${type}</option>`;
	});
	html += `</select>`;

	// Title (editable)
	html += `<div contenteditable="true" class="editable-title" data-week="${weekIndex}" data-column="${column}" data-activity="${activityIndex}" data-field="title" style="flex: 1; margin-left: 8px;">${activity.title || ''}</div>`;

	if (!isCancelled) {
		// Link (editable)
		html += `<div contenteditable="true" class="editable-link" data-week="${weekIndex}" data-column="${column}" data-activity="${activityIndex}" data-field="link" style="flex: 1; margin-left: 8px; font-size: 0.8rem; color: rgba(255,255,255,0.8);">${activity.link || '(no link)'}</div>`;

		// Time (editable)
		html += `<span contenteditable="true" class="editable-time vik-time" data-week="${weekIndex}" data-column="${column}" data-activity="${activityIndex}" data-field="time">${activity.time || ''}</span>`;

		// Due date (date picker)
		html += `<input type="date" class="editable-due" data-week="${weekIndex}" data-column="${column}" data-activity="${activityIndex}" value="${activity.due || ''}" />`;
	}

	// Delete button
	html += `<button class="edit-btn" style="margin-left: 8px;" onclick="duplicateActivity(${weekIndex}, '${column}', ${activityIndex})">Copy</button>`;
	html += `<button class="edit-btn delete-btn" style="margin-left: 4px;" onclick="deleteActivity(${weekIndex}, '${column}', ${activityIndex})">×</button>`;

	html += '</li>';
	return html;
}

// Attach event listeners to contenteditable fields
function attachEditListeners() {
	// Week/date fields
	document
		.querySelectorAll('.editable-week, .editable-date')
		.forEach((el) => {
			el.addEventListener('blur', handleWeekFieldEdit);
			el.addEventListener('keydown', handleEnterKey);
		});

	// Activity fields
	document
		.querySelectorAll('.editable-title, .editable-link, .editable-time')
		.forEach((el) => {
			el.addEventListener('blur', handleActivityFieldEdit);
			el.addEventListener('keydown', handleEnterKey);
		});

	// Due date picker
	document.querySelectorAll('.editable-due').forEach((el) => {
		el.addEventListener('change', handleDueChange);
	});
}

// Drag & Drop: attach listeners to items and lists
function attachDnDListeners() {
	// Draggable items
	document.querySelectorAll('.dnd-activity').forEach((item) => {
		item.addEventListener('dragstart', onDragStart);
		item.addEventListener('dragend', onDragEnd);
		item.addEventListener('dragover', onDragOverItem);
		item.addEventListener('drop', onDropOnItem);
		item.addEventListener('dragleave', onDragLeaveItem);
	});

	// Lists (for dropping to end/empty space)
	document.querySelectorAll('.dnd-list').forEach((list) => {
		list.addEventListener('dragover', onDragOverList);
		list.addEventListener('drop', onDropOnList);
		list.addEventListener('dragleave', onDragLeaveList);
	});
}

function onDragStart(e) {
	// If the drag originated from an editable/input/select, allow normal text/input interaction
	if (e.target.closest('[contenteditable], input, select')) {
		e.preventDefault();
		return;
	}

	const el = e.currentTarget;
	el.classList.add('dragging');
	const payload = {
		weekIndex: parseInt(el.dataset.week),
		column: el.dataset.column,
		activityIndex: parseInt(el.dataset.activityIndex),
	};
	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.setData('application/json', JSON.stringify(payload));
}

function onDragEnd(e) {
	e.currentTarget.classList.remove('dragging');
	// Clean drop indicators
	document
		.querySelectorAll('.dnd-drop-indicator, .drag-over')
		.forEach((el) =>
			el.classList.remove('dnd-drop-indicator', 'drag-over')
		);
}

function onDragOverItem(e) {
	e.preventDefault();
	e.dataTransfer.dropEffect = 'move';
	// Clear other indicators then show on target
	document
		.querySelectorAll('.dnd-drop-indicator')
		.forEach((el) => el.classList.remove('dnd-drop-indicator'));
	// Visual indicator (line above target)
	e.currentTarget.classList.add('dnd-drop-indicator');
}

function onDropOnItem(e) {
	e.preventDefault();
	const targetEl = e.currentTarget;
	const targetWeek = parseInt(targetEl.dataset.week);
	const targetColumn = targetEl.dataset.column;
	const targetIndex = parseInt(targetEl.dataset.activityIndex);

	const src = JSON.parse(e.dataTransfer.getData('application/json'));
	const sameList =
		src.weekIndex === targetWeek && src.column === targetColumn;

	// Extract the activity from source
	const srcArr = calendarData.weeks[src.weekIndex][src.column];
	const [moved] = srcArr.splice(src.activityIndex, 1);

	// Adjust insert index if removing from same list and source index < target index
	let insertIndex = targetIndex;
	if (sameList && src.activityIndex < targetIndex) {
		insertIndex = Math.max(0, targetIndex - 1);
	}

	// Insert into destination
	const destArr = calendarData.weeks[targetWeek][targetColumn];
	destArr.splice(insertIndex, 0, moved);

	// Persist and re-render
	scheduleSave();
	renderCalendar();
}

function onDragLeaveItem(e) {
	e.currentTarget.classList.remove('dnd-drop-indicator');
}

function onDragOverList(e) {
	e.preventDefault();
	e.currentTarget.classList.add('drag-over');
}

function onDropOnList(e) {
	e.preventDefault();
	const listEl = e.currentTarget;
	const destWeek = parseInt(listEl.dataset.week);
	const destColumn = listEl.dataset.column;

	const src = JSON.parse(e.dataTransfer.getData('application/json'));

	const srcArr = calendarData.weeks[src.weekIndex][src.column];
	const [moved] = srcArr.splice(src.activityIndex, 1);

	const destArr = calendarData.weeks[destWeek][destColumn];
	destArr.push(moved);

	// Cleanup class
	listEl.classList.remove('drag-over');

	// Persist and re-render
	scheduleSave();
	renderCalendar();
}

function onDragLeaveList(e) {
	e.currentTarget.classList.remove('drag-over');
}

// Handle week field edits
function handleWeekFieldEdit(e) {
	const weekIndex = parseInt(e.target.dataset.weekIndex);
	const field = e.target.dataset.field;
	const value = e.target.textContent.trim();

	calendarData.weeks[weekIndex][field] = value;
	scheduleSave();
}

// Handle activity field edits
function handleActivityFieldEdit(e) {
	const weekIndex = parseInt(e.target.dataset.week);
	const column = e.target.dataset.column;
	const activityIndex = parseInt(e.target.dataset.activity);
	const field = e.target.dataset.field;
	const value = e.target.textContent.trim();

	const activity = calendarData.weeks[weekIndex][column][activityIndex];

	if (field === 'link' && value === '(no link)') {
		delete activity[field];
	} else {
		activity[field] = value;
	}

	scheduleSave();
}

// Handle Enter key (blur to save)
function handleEnterKey(e) {
	if (e.key === 'Enter') {
		e.preventDefault();
		e.target.blur();
	}
}

// Change activity type
function changeActivityType(selectEl) {
	const weekIndex = parseInt(selectEl.dataset.week);
	const column = selectEl.dataset.column;
	const activityIndex = parseInt(selectEl.dataset.activity);
	const newType = selectEl.value;

	calendarData.weeks[weekIndex][column][activityIndex].type = newType;
	scheduleSave();
	renderCalendar(); // Re-render to update styling
}

// Add new activity
function addActivity(weekIndex, column) {
	const newActivity = {
		type: 'lesson',
		title: 'New Activity',
		time: '30m',
	};

	calendarData.weeks[weekIndex][column].push(newActivity);
	scheduleSave();
	renderCalendar();
}

// Delete activity
function deleteActivity(weekIndex, column, activityIndex) {
	if (confirm('Delete this activity?')) {
		calendarData.weeks[weekIndex][column].splice(activityIndex, 1);
		scheduleSave();
		renderCalendar();
	}
}

// Duplicate activity (inserted after current)
function duplicateActivity(weekIndex, column, activityIndex) {
	const srcArr = calendarData.weeks[weekIndex][column];
	const original = srcArr[activityIndex];
	// Deep clone to avoid shared references
	const clone = JSON.parse(JSON.stringify(original));
	srcArr.splice(activityIndex + 1, 0, clone);
	scheduleSave();
	renderCalendar();
}

// Handle due date change
function handleDueChange(e) {
	const weekIndex = parseInt(e.target.dataset.week);
	const column = e.target.dataset.column;
	const activityIndex = parseInt(e.target.dataset.activity);
	const value = e.target.value;

	calendarData.weeks[weekIndex][column][activityIndex].due = value;
	scheduleSave();
}

// Add new week
function addWeek() {
	const lastWeek = calendarData.weeks[calendarData.weeks.length - 1];
	const lastDate = new Date(lastWeek.startDate);
	const nextDate = new Date(lastDate);
	nextDate.setDate(nextDate.getDate() + 7);

	const newWeek = {
		week: `W${calendarData.weeks.length.toString().padStart(2, '0')} - ${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`,
		startDate: nextDate.toISOString().split('T')[0],
		class1: [],
		class2: [],
		homework: [],
	};

	calendarData.weeks.push(newWeek);
	scheduleSave();
	renderCalendar();
}

// Delete week
function deleteWeek(weekIndex) {
	if (confirm('Delete this entire week?')) {
		calendarData.weeks.splice(weekIndex, 1);
		scheduleSave();
		renderCalendar();
	}
}

// Start the editor
init();
