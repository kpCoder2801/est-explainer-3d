import React from 'react';
import {colors} from '../../../brand/brand-tokens';
import {DrawPath} from '../../kit/draw-path';
import {between, EASE_OUT} from '../../kit/mg-motion';

export type Rail = {y: number; amp: number; phase: number; color: string; speed: number; dots: number};

/** Four "money rails" sweeping across the frame on gentle sine curves. */
export const RAILS: Rail[] = [
	{y: 420, amp: 40, phase: 0, color: colors.teal, speed: 0.42, dots: 3},
	{y: 510, amp: 55, phase: 1.3, color: colors.tealBright, speed: 0.55, dots: 4},
	{y: 600, amp: 35, phase: 2.6, color: colors.arseBlue, speed: 0.36, dots: 3},
	{y: 690, amp: 50, phase: 4, color: colors.nanduGold, speed: 0.48, dots: 2},
];

const X0 = -120;
const X1 = 2040;
const railY = (r: Rail, x: number) => r.y + Math.sin(x * 0.0035 + r.phase) * r.amp;

const railPath = (r: Rail) => {
	const pts: string[] = [];
	for (let x = X0; x <= X1; x += 40) pts.push(`${pts.length ? 'L' : 'M'} ${x} ${railY(r, x).toFixed(1)}`);
	return pts.join(' ');
};

/** One rail: the track draws on left→right, then coins ride along it with a glow. */
export const RailTrack: React.FC<{rail: Rail; t: number; at: number}> = ({rail, t, at}) => {
	const draw = between(t, at, at + 0.7, 0, 1, EASE_OUT);
	if (draw <= 0) return null;
	const ride = Math.max(0, t - at - 0.35);
	return (
		<g>
			<DrawPath d={railPath(rail)} progress={draw} stroke={rail.color} width={16} opacity={0.18} />
			<DrawPath d={railPath(rail)} progress={draw} stroke={rail.color} width={4} />
			{Array.from({length: rail.dots}, (_, i) => {
				const u = (ride * rail.speed + i / rail.dots) % 1;
				const x = X0 + u * (X1 - X0);
				if (ride <= 0 || x > X0 + draw * (X1 - X0)) return null;
				const y = railY(rail, x);
				return (
					<g key={i}>
						<circle cx={x} cy={y} r={26} fill={rail.color} opacity={0.25} />
						<circle cx={x} cy={y} r={15} fill={rail.color} />
						<circle cx={x - 4} cy={y - 4} r={5} fill={colors.white} opacity={0.7} />
					</g>
				);
			})}
		</g>
	);
};
