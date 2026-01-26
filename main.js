const currentCourse = 'w26';

Handlebars.registerHelper('anyCancelled', function (items) {
	return items.some((item) => item.type === 'cancelled');
});

Handlebars.registerHelper('eq', function (a, b) {
	return a === b;
});

// Register a helper to check if a given date is the current week
Handlebars.registerHelper('currentWeekId', function (startDate) {
	const today = new Date();
	const weekStartDate = new Date(startDate);
	const weekEndDate = new Date(weekStartDate);
	weekEndDate.setDate(weekEndDate.getDate() + 6); // Calculate end of week by adding 6 days

	// Return 'current-week' if today's date is within the start and end of the week
	if (today >= weekStartDate && today <= weekEndDate) {
		return 'current-week';
	}
	return ''; // Return an empty string if it's not the current week
});

// Format due date as "MMM DD" (e.g., "FEB 01", "MAR 20")
Handlebars.registerHelper('formatDue', function (dueDate) {
	if (!dueDate) return '';
	// Parse ISO date string directly to avoid timezone issues
	const [year, month, day] = dueDate.split('-');
	const monthNames = [
		'JAN',
		'FEB',
		'MAR',
		'APR',
		'MAY',
		'JUN',
		'JUL',
		'AUG',
		'SEP',
		'OCT',
		'NOV',
		'DEC',
	];
	const monthIndex = parseInt(month) - 1;
	const dayPadded = String(day).padStart(2, '0');
	return `⏰ ${monthNames[monthIndex]} ${dayPadded}`;
});

// Load JSON and render template
async function loadCalendar() {
	// Fetch the JSON data
	const response = await fetch(`calendar-${currentCourse}.json`);
	const calendarData = await response.json();

	// Compile the Handlebars template
	const source = document.getElementById('calendar-template').innerHTML;
	const template = Handlebars.compile(source);

	// Generate HTML with the template and JSON data
	const calendarHTML = template(calendarData);

	// Insert the generated HTML into the DOM
	document.getElementById('calendar-container').innerHTML = calendarHTML;

	document
		.getElementById('current-week')
		.scrollIntoView({ behavior: 'auto', block: 'center' });
}

// Call the function to load and display the calendar
loadCalendar();
