/**
 * Main App component
 */

import React from 'react';
import { Calendar } from '@/components/viewer';

export const App: React.FC = () => {
	return (
		<div className="app-container">
			<Calendar />
		</div>
	);
};
