import React from 'react';
import {colors, fontInter} from '../../../brand/brand-tokens';
import {DrawPath} from '../../kit/draw-path';

type Pt = readonly [number, number];

/** The Estable triangle (same w = h proportions as the logo) split into four modular tiles. */
export const triangleTiles = (cx: number, top: number, s: number) => {
	const A: Pt = [cx, top];
	const L: Pt = [cx - s / 2, top + s];
	const R: Pt = [cx + s / 2, top + s];
	const mid = (p: Pt, q: Pt): Pt => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
	const M1 = mid(A, L);
	const M2 = mid(A, R);
	const M3 = mid(L, R);
	return {top: [A, M1, M2], left: [M1, L, M3], right: [M2, M3, R], center: [M1, M3, M2]} as const;
};

export type TileKey = keyof ReturnType<typeof triangleTiles>;

const centroid = (pts: readonly Pt[]): Pt => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];

/** Micro-icons drawn by line (≈ 80px box centred on 0,0). */
export const TILE_ICONS: Record<TileKey, string> = {
	left: 'M 8 -36 L -16 4 L 4 4 L -8 36 L 18 -6 L -2 -6 Z', // bolt: real-time
	right: 'M 0 -34 L 28 -23 L 28 2 C 28 21 14 31 0 37 C -14 31 -28 21 -28 2 L -28 -23 Z M -12 2 L -3 12 L 14 -8', // shield-check: compliance
	top: 'M -24 24 L 22 -22 M -2 -24 L 24 -24 L 24 2', // arrow up-right: fast to market
	center: 'M -30 -12 L 0 -26 L 30 -12 L 0 2 Z M -30 4 L 0 18 L 30 4 M -30 18 L 0 32 L 30 18', // stacked layers: modular
};

/**
 * One tile: flies in (`p` 0→1) from its own direction with a spin for the centre tile,
 * gutter shrink `gap` (1 = separated, 0 = locked into one triangle), icon line-draw `icon`.
 */
export const ValueTile: React.FC<{
	pts: readonly Pt[];
	tile: TileKey;
	p: number;
	gap: number;
	icon: number;
	fill: string;
	lockFill: number;
}> = ({pts, tile, p, gap, icon, fill, lockFill}) => {
	if (p <= 0) return null;
	const [cx, cy] = centroid(pts);
	const shrink = 1 - 0.08 * gap;
	const from = {top: [0, -520], left: [-700, 120], right: [700, 120], center: [0, 0]}[tile];
	const dx = from[0] * (1 - p);
	const dy = from[1] * (1 - p);
	const rot = tile === 'center' ? (1 - p) * 180 : 0;
	const sc = (tile === 'center' ? p : 1) * shrink;
	const d = `M ${pts.map(([x, y]) => `${x - cx} ${y - cy}`).join(' L ')} Z`;
	return (
		<g transform={`translate(${cx + dx} ${cy + dy}) rotate(${rot}) scale(${sc})`}>
			<path d={d} fill={fill} stroke={fill} strokeWidth={16} strokeLinejoin="round" />
			<path d={d} fill={colors.teal} stroke={colors.teal} strokeWidth={16} strokeLinejoin="round" opacity={lockFill} />
			<g transform={`translate(0 ${tile === 'center' ? -12 : 18})`} opacity={1 - lockFill}>
				<DrawPath d={TILE_ICONS[tile]} progress={icon} stroke={colors.white} width={7} />
			</g>
		</g>
	);
};

/** MG audience chip: gradient pill that scales in with an expo-out overshoot. */
export const MgChip: React.FC<{x: number; y: number; label: string; p: number; color?: string}> = ({x, y, label, p, color = colors.arseBlue}) =>
	p <= 0 ? null : (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(${(1 - p) * 60}px, 0) scale(${0.85 + 0.15 * p})`,
				opacity: p,
				padding: '18px 40px',
				borderRadius: 999,
				background: `linear-gradient(135deg, ${color}, ${colors.arseShade})`,
				boxShadow: `0 0 0 3px ${colors.arseSky}55, 0 18px 40px rgba(0,0,0,0.35)`,
				color: colors.white,
				fontFamily: fontInter,
				fontWeight: 800,
				fontSize: 56,
				letterSpacing: '-0.02em',
				whiteSpace: 'nowrap',
			}}
		>
			{label}
		</div>
	);
