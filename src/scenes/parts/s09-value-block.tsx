import React from 'react';
import {colors, fontInter} from '../../brand/brand-tokens';

export const BLOCK = {w: 330, h: 110};

/**
 * Sticker-style value block: outlined tile with a darker shade band along the bottom
 * and a gloss mark top-left. `children` (label or logo) sits centred on top.
 */
export const ValueBlock: React.FC<{
	x: number;
	y: number;
	w?: number;
	h?: number;
	scale?: number;
	squash?: number;
	rotate?: number;
	fill?: string;
	shade?: string;
	children: React.ReactNode;
}> = ({x, y, w = BLOCK.w, h = BLOCK.h, scale = 1, squash = 0, rotate = 0, fill = colors.tealDark, shade = '#11221f', children}) => (
	<div
		style={{
			position: 'absolute',
			left: x - w / 2,
			top: y - h / 2,
			width: w,
			height: h,
			// Squash anchors at the bottom edge so landings read as weight settling.
			transform: `rotate(${rotate}deg) scale(${scale * (1 + squash * 0.12)}, ${scale * (1 - squash * 0.16)})`,
			transformOrigin: '50% 100%',
			borderRadius: 22,
			background: fill,
			border: `6px solid ${colors.outline}`,
			boxShadow: `inset 0 -${h * 0.18}px 0 ${shade}, inset 0 0 0 3px ${colors.teal}`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: fontInter,
			fontWeight: 800,
			fontSize: 32,
			color: colors.white,
			textAlign: 'center',
			lineHeight: 1.1,
			padding: '0 18px',
			boxSizing: 'border-box',
		}}
	>
		<div style={{position: 'absolute', left: 16, top: 12, width: 46, height: 9, borderRadius: 9, background: colors.white, opacity: 0.5}} />
		<div style={{position: 'absolute', left: 16, top: 12, width: 9, height: 32, borderRadius: 9, background: colors.white, opacity: 0.5}} />
		{children}
	</div>
);
