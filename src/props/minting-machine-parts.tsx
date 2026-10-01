import React from 'react';
import {colors, fontInter} from '../brand/brand-tokens';

/**
 * Shared sticker-style building blocks for the minting machines, matching the
 * mascots: dark outline, flat fill, a darker band along the bottom, a gloss mark.
 * Machines are drawn in a 600×700 local box with the ground at y = 680.
 */
export const LINE = 8;
export const GROUND = 680;

/** Progress of one machine cycle. `op` = operating (lever/crank/belt), `out` = coin ejecting. */
export type MachineState = {op: number; out: number; time: number};

export const Box: React.FC<{x: number; y: number; w: number; h: number; r?: number; fill: string; shade?: string; gloss?: boolean}> = ({
	x,
	y,
	w,
	h,
	r = 18,
	fill,
	shade,
	gloss = true,
}) => (
	<g>
		<rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={colors.outline} strokeWidth={LINE} />
		{shade && h > 40 && <rect x={x + LINE / 2} y={y + h - Math.min(h * 0.2, 40)} width={w - LINE} height={Math.min(h * 0.2, 40) - LINE / 2} rx={Math.max(0, r - 6)} fill={shade} />}
		{gloss && w > 60 && h > 40 && (
			<path d={`M ${x + 18} ${y + Math.min(h * 0.5, 50)} L ${x + 18} ${y + 20} L ${x + Math.min(w * 0.3, 70)} ${y + 20}`} stroke={colors.white} strokeOpacity={0.45} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
		)}
	</g>
);

export const LabelPlate: React.FC<{x: number; y: number; w: number; h: number; text: string; size?: number}> = ({x, y, w, h, text, size = 40}) => (
	<g>
		<rect x={x} y={y} width={w} height={h} rx={14} fill={colors.tealDark} stroke={colors.outline} strokeWidth={LINE} />
		<text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={size} letterSpacing={2} fill={colors.white}>
			{text}
		</text>
	</g>
);
