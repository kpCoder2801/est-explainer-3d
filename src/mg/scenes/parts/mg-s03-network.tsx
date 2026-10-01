import React from 'react';
import {random} from 'remotion';
import {colors} from '../../../brand/brand-tokens';
import {DrawPath} from '../../kit/draw-path';
import {between, EASE_OUT} from '../../kit/mg-motion';

export type NodeDef = {key: string; label: string; x: number; y: number; glyph: string[]};

/** Bank / Shop / Phone nodes, each a line-drawn glyph inside a drawn ring. */
export const NODES: NodeDef[] = [
	{
		key: 'bank',
		label: 'BANK',
		x: 700,
		y: 360,
		glyph: ['M -44 -14 L 0 -42 L 44 -14 Z', 'M -28 -6 L -28 26 M 0 -6 L 0 26 M 28 -6 L 28 26', 'M -48 36 L 48 36'],
	},
	{
		key: 'shop',
		label: 'SHOP',
		x: 1260,
		y: 330,
		glyph: ['M -48 -32 L 48 -32 L 54 -6 L -54 -6 Z', 'M -40 -6 L -40 38 L 40 38 L 40 -6', 'M -12 38 L -12 12 L 12 12 L 12 38'],
	},
	{
		key: 'phone',
		label: 'PHONE',
		x: 1000,
		y: 660,
		glyph: ['M -24 -44 L 24 -44 Q 32 -44 32 -36 L 32 36 Q 32 44 24 44 L -24 44 Q -32 44 -32 36 L -32 -36 Q -32 -44 -24 -44 Z', 'M -6 30 L 6 30'],
	},
];

export const NetworkNode: React.FC<{node: NodeDef; t: number; at: number; glow: number; shake: number}> = ({node, t, at, glow, shake}) => {
	const p = between(t, at, at + 0.6, 0, 1, EASE_OUT);
	if (p <= 0) return null;
	const jx = (random(`${node.key}x${Math.floor(t * 20)}`) - 0.5) * shake;
	const jy = (random(`${node.key}y${Math.floor(t * 20)}`) - 0.5) * shake;
	const ring = `M ${node.x} ${node.y - 80} A 80 80 0 1 1 ${node.x - 0.01} ${node.y - 80}`;
	return (
		<g transform={`translate(${jx} ${jy})`}>
			<circle cx={node.x} cy={node.y} r={80 + glow * 26} fill={colors.tealBright} opacity={glow * 0.18} />
			<circle cx={node.x} cy={node.y} r={80} fill={colors.tealDark} opacity={0.85 * p} />
			<DrawPath d={ring} progress={p} stroke={glow > 0 ? colors.tealBright : colors.teal} width={5} />
			<g transform={`translate(${node.x} ${node.y})`}>
				{node.glyph.map((d, i) => (
					<DrawPath key={i} d={d} progress={between(t, at + 0.15 + i * 0.1, at + 0.65 + i * 0.1)} stroke={colors.white} width={5} />
				))}
			</g>
			<text x={node.x} y={node.y + 118} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={22} letterSpacing={5} fill={colors.tealLight} opacity={p}>
				{node.label}
			</text>
		</g>
	);
};

/** A knotted, jittering cable between two points (seeded loops + per-frame wobble). */
export const tanglePath = (a: {x: number; y: number}, b: {x: number; y: number}, seed: string, t: number, chaos: number) => {
	const n = 8;
	const pts = Array.from({length: n + 1}, (_, i) => {
		const k = i / n;
		const edge = i === 0 || i === n;
		const nx = -(b.y - a.y);
		const ny = b.x - a.x;
		const len = Math.hypot(nx, ny);
		const off = edge ? 0 : (random(`${seed}${i}`) - 0.5) * 300 + Math.sin(t * 9 + i * 1.7) * 14 * chaos;
		const along = edge ? 0 : (random(`${seed}a${i}`) - 0.5) * 160;
		return {x: a.x + (b.x - a.x) * k + (nx / len) * off + along, y: a.y + (b.y - a.y) * k + (ny / len) * off + Math.cos(t * 11 + i) * 10 * chaos};
	});
	let d = `M ${pts[0].x} ${pts[0].y}`;
	for (let i = 1; i < pts.length - 1; i++) {
		const mx = (pts[i].x + pts[i + 1].x) / 2;
		const my = (pts[i].y + pts[i + 1].y) / 2;
		d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`;
	}
	return d + ` L ${pts[n].x} ${pts[n].y}`;
};
