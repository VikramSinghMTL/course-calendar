/**
 * Main App component with simple routing
 */

import React from 'react';
import { Calendar } from '@/components/viewer';
import { EditorCalendar } from '@/components/editor';

export const App: React.FC = () => {
	const isEditor =
		window.location.pathname === '/editor' ||
		window.location.pathname === '/editor.html';

	if (isEditor) {
		return (
			<div className="app-container">
				<EditorCalendar />
			</div>
		);
	}

	return (
		<div className="app-container">
			<Calendar />
		</div>
	);
};
