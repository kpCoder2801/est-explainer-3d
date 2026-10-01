import React from 'react';
import {interpolate} from 'remotion';
import {colors, fontInter} from '../../../brand/brand-tokens';
import {DrawPath} from '../../kit/draw-path';
import {EASE_OUT} from '../../kit/mg-motion';

const W = 560;
const H = 300;
const BARS = [0.62, 0.74, 0.7, 0.86, 1];

/**
 * "Reserves you can verify": a glass card whose reserve bars grow in sequence, a trend
 * line draws across them, and a 1:1 backing counter climbs to 100%. `p` 0…1 drives it.
 */
export const ReservePanel: React.FC<{x: number; y: number; p: number; appear: number}> = ({x, y, p, appear}) => {
	const pct = Math.round(interpolate(p, [0.2, 0.9], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	const barW = 64;
	const gap = (W - 80 - BARS.length * barW) / (BARS.length - 1);
	const baseY = H - 40;
	const pts = BARS.map((v, i) => [40 + i * (barW + gap) + barW / 2, baseY - v * 170 - 14] as const);
	const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'} ${px} ${py}`).join(' ');
	return (
		<div
			style={{
				position: 'absolute',
				left: x - W / 2,
				top: y,
				width: W,
				height: H,
				borderRadius: 28,
				background: 'linear-gradient(160deg, rgba(14,42,56,0.92), rgba(20,22,22,0.92))',
				boxShadow: `inset 0 0 0 2px ${colors.arseSky}55, 0 24px 60px rgba(0,0,0,0.5)`,
				opacity: appear,
				transform: `translateY(${(1 - appear) * 40}px) scale(${0.94 + appear * 0.06})`,
				overflow: 'hidden',
			}}
		>
			<svg width={W} height={H} style={{position: 'absolute'}}>
				<line x1={30} y1={baseY} x2={W - 30} y2={baseY} stroke={colors.arseSky} strokeOpacity={0.35} strokeWidth={2} />
				{BARS.map((v, i) => {
					const k = EASE_OUT(interpolate(p, [i * 0.1, i * 0.1 + 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
					const h = v * 170 * k;
					return <rect key={i} x={40 + i * (barW + gap)} y={baseY - h} width={barW} height={h} rx={10} fill={i === BARS.length - 1 ? colors.arseSky : colors.arseBlue} opacity={0.55 + i * 0.1} />;
				})}
				<DrawPath d={line} progress={interpolate(p, [0.35, 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} stroke={colors.white} width={5} />
				{pts.map(([px, py], i) => (
					<circle key={i} cx={px} cy={py} r={7} fill={colors.white} opacity={p > 0.4 + i * 0.1 ? 1 : 0} />
				))}
			</svg>
			<div style={{position: 'absolute', right: 28, top: 22, textAlign: 'right', fontFamily: fontInter}}>
				<div style={{fontSize: 54, fontWeight: 800, color: colors.white, lineHeight: 1}}>{pct}%</div>
				<div style={{fontSize: 16, fontWeight: 700, letterSpacing: 3, color: colors.arseSky, marginTop: 4}}>BACKED 1:1</div>
			</div>
		</div>
	);
};
