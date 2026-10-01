import React from 'react';

const INK = '#0b1416';

/** MG eye: a white pill with a low pupil; blink squashes it, `happy` turns it into a ^ arc. */
export const PillEye: React.FC<{cx: number; cy: number; w: number; h: number; look: number; blink: number; happy: boolean; lash?: -1 | 1}> = ({cx, cy, w, h, look, blink, happy, lash}) => {
	if (happy) {
		return <path d={`M ${cx - w * 0.7} ${cy + h * 0.15} Q ${cx} ${cy - h * 0.55} ${cx + w * 0.7} ${cy + h * 0.15}`} stroke="#fff" strokeWidth={w * 0.42} strokeLinecap="round" fill="none" />;
	}
	const open = 1 - blink * 0.9;
	return (
		<g transform={`translate(${cx} ${cy}) scale(1 ${open})`}>
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w / 2} fill="#fff" />
			<circle cx={look * w * 0.18} cy={h * 0.14} r={w * 0.3} fill={INK} />
			<circle cx={look * w * 0.18 + w * 0.1} cy={h * 0.04} r={w * 0.1} fill="#fff" />
			{lash && <path d={`M ${lash * w * 0.35} ${-h * 0.45} l ${lash * w * 0.35} ${-h * 0.18}`} stroke="#fff" strokeWidth={w * 0.16} strokeLinecap="round" />}
		</g>
	);
};

/** MG mouth: a dark pill that opens with the voice; closed it is a small smile. */
export const PillMouth: React.FC<{cx: number; cy: number; w: number; open: number}> = ({cx, cy, w, open}) => {
	if (open < 0.08) {
		return <path d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + w * 0.45} ${cx + w / 2} ${cy}`} stroke={INK} strokeWidth={w * 0.18} strokeLinecap="round" fill="none" />;
	}
	const h = w * (0.25 + open * 0.55);
	return (
		<g>
			<rect x={cx - w / 2} y={cy - h * 0.35} width={w} height={h} rx={Math.min(w, h) / 2} fill={INK} />
			<ellipse cx={cx} cy={cy - h * 0.35 + h * 0.78} rx={w * 0.26} ry={h * 0.16} fill="#ef6f78" />
		</g>
	);
};
