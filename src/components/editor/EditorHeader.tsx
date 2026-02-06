/**
 * EditorHeader component with term selector and save status
 */

import React from 'react';
import type { SaveStatus, TermCode } from '@/types';

interface EditorHeaderProps {
	currentTerm: TermCode;
	availableTerms: TermCode[];
	saveStatus: SaveStatus;
	onTermChange: (term: TermCode) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
	currentTerm,
	availableTerms,
	saveStatus,
	onTermChange,
}) => {
	const saveStatusText = {
		saved: '✓ Saved',
		saving: '💾 Saving...',
		error: '✗ Error saving',
	};

	const saveStatusColor = {
		saved: '#40a02b',
		saving: '#df8e1d',
		error: '#d20f39',
	};

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				padding: '1rem',
				backgroundColor: 'var(--accent-color)',
				color: 'white',
				fontFamily: 'monospace',
			}}
		>
			<div>
				<h1 style={{ margin: 0, fontSize: '1.5rem' }}>
					📅 Course Calendar Editor
				</h1>
			</div>

			<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
				<div>
					<label
						htmlFor="term-selector"
						style={{ marginRight: '0.5rem' }}
					>
						Term:
					</label>
					<select
						id="term-selector"
						value={currentTerm}
						onChange={(e) => onTermChange(e.target.value)}
						style={{
							padding: '0.5rem',
							fontSize: '1rem',
							fontFamily: 'monospace',
						}}
					>
						{availableTerms.map((term) => (
							<option key={term} value={term}>
								{term.toUpperCase()}
							</option>
						))}
					</select>
				</div>

				<div
					style={{
						color: saveStatusColor[saveStatus],
						fontWeight: 'bold',
					}}
				>
					{saveStatusText[saveStatus]}
				</div>
			</div>
		</div>
	);
};
