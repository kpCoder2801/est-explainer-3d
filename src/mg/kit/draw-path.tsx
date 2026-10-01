import React from 'react';

/** Line-draw reveal for an SVG path: `progress` 0…1 draws it along its length. */
export const DrawPath: React.FC<{d: string; progress: number; stroke: string; width: number; fill?: string; opacity?: number}> = ({d, progress, stroke, width, fill = 'none', opacity = 1}) => (
	<path
		d={d}
		pathLength={1}
		strokeDasharray={1}
		strokeDashoffset={1 - Math.max(0, Math.min(1, progress))}
		stroke={stroke}
		strokeWidth={width}
		strokeLinecap="round"
		strokeLinejoin="round"
		fill={fill}
		opacity={opacity}
	/>
);
