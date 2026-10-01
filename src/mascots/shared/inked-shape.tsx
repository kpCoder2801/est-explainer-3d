import React, {useId} from 'react';
import {colors} from '../../brand/brand-tokens';

/**
 * Sticker-style cel shading for a flat shape: a dark outline behind it, a shadow
 * crescent on the lower-right (the shape shifted toward the light, clipped by itself),
 * and optional gloss marks drawn inside the clip.
 *
 * `draw(fill, grow)` must render the silhouette in `fill`, expanded by `grow` units
 * on every side (e.g. via a same-colour stroke) so the outline can sit behind it.
 */
export const InkedShape: React.FC<{
	draw: (fill: string, grow: number) => React.ReactNode;
	base: string;
	shade: string;
	outline: number;
	/** Light direction offset: how far the lit copy shifts up-left, leaving shade. */
	shadeShift: {x: number; y: number};
	children?: React.ReactNode;
}> = ({draw, base, shade, outline, shadeShift, children}) => {
	const clipId = `ink${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	return (
		<g>
			{draw(colors.outline, outline)}
			{/* A mask (not clipPath): clipPath ignores <g> children, and silhouettes are groups. */}
			<mask id={clipId} maskUnits="userSpaceOnUse" x={-1e4} y={-1e4} width={2e4} height={2e4}>
				{draw('#fff', 0)}
			</mask>
			{draw(shade, 0)}
			<g mask={`url(#${clipId})`}>
				<g transform={`translate(${-shadeShift.x} ${-shadeShift.y})`}>{draw(base, 0)}</g>
				{children}
			</g>
		</g>
	);
};

/** Rounded gloss stroke used for highlights. */
export const Gloss: React.FC<{d: string; width: number; color: string; opacity?: number}> = ({d, width, color, opacity = 0.85}) => (
	<path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" opacity={opacity} />
);
