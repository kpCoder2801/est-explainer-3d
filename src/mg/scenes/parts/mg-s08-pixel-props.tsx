import React from 'react';
import {random} from 'remotion';
import {colors} from '../../../brand/brand-tokens';

/** Pixel props for MG S08. Everything moves on 10fps steps to match Nandu. */
export const PX = 26;
export const stepped = (t: number) => Math.floor(t * 10) / 10;

const PHONE = [
	'.gggggggg.',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'gssssssssg',
	'ggggkkgggg',
	'.gggggggg.',
];
const KEY = ['.yyy.....', 'yy.yyyyyy', 'yy.yy.y.y', '.yyy.....'];
const LOCK = ['..www..', '.w...w.', '.w...w.', 'wwwwwww', 'www.www', 'www.www', 'wwwwwww'];
export const PHONE_W = PHONE[0].length * PX;
export const PHONE_H = PHONE.length * PX;

const cells = (rows: string[]) => rows.flatMap((r, y) => [...r].map((c, x) => ({c, x, y})).filter((p) => p.c !== '.'));

/**
 * Pixel-built phone: cells cascade in row by row from `buildAt`, a key drops into the
 * screen at `keyAt`, it becomes a lock at `lockAt` (with a teal wave across the screen),
 * and the whole thing dissolves pixel by pixel from `exitAt`.
 */
export const PixelPhone: React.FC<{left: number; top: number; t: number; buildAt: number; keyAt: number; lockAt: number; exitAt: number}> = ({left, top, t, buildAt, keyAt, lockAt, exitAt}) => {
	const st = stepped(t);
	if (st < buildAt) return null;
	const locked = st >= lockAt;
	const palette: Record<string, string> = {g: colors.nanduGold, k: colors.nanduLight, s: colors.tealDark};
	const gone = (key: string) => st >= exitAt + random(`ph-x-${key}`) * 0.45;
	return (
		<g transform={`translate(${left} ${top})`} style={{shapeRendering: 'crispEdges'}}>
			{cells(PHONE).map(({c, x, y}) => {
				const appear = buildAt + (y + x * 0.25) * 0.035;
				if (st < appear || gone(`${x}-${y}`)) return null;
				const fresh = st - appear < 0.1;
				// After locking, a teal wave sweeps the screen top to bottom.
				const wave = locked && c === 's' && Math.abs(st - lockAt - y * 0.03) < 0.15;
				return <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX + 0.5} height={PX + 0.5} fill={fresh ? colors.white : wave ? colors.teal : palette[c]} />;
			})}
			{st >= keyAt && !locked && !gone('key') && (
				<g transform={`translate(${0.5 * PX} ${Math.min(5, -6 + (st - keyAt) * 30) * PX})`}>
					{cells(KEY).map(({x, y}) => (
						<rect key={`k${x}-${y}`} x={x * PX} y={y * PX} width={PX + 0.5} height={PX + 0.5} fill={colors.nanduLight} />
					))}
				</g>
			)}
			{locked && !gone('lock') && (
				<g transform={`translate(${1.5 * PX} ${3.5 * PX})`}>
					{cells(LOCK).map(({x, y}) => (
						<rect key={`l${x}-${y}`} x={x * PX} y={y * PX} width={PX + 0.5} height={PX + 0.5} fill={colors.tealBright} />
					))}
				</g>
			)}
		</g>
	);
};

/** Square shockwave: pixels fly out from (cx, cy) in 8 directions on stepped time. */
export const PixelBurst: React.FC<{cx: number; cy: number; t: number; at: number; color: string; reach?: number}> = ({cx, cy, t, at, color, reach = 220}) => {
	const k = stepped(t) - at;
	if (k < 0 || k > 0.5) return null;
	const p = k / 0.5;
	return (
		<g style={{shapeRendering: 'crispEdges'}}>
			{Array.from({length: 12}, (_, i) => {
				const a = (i / 12) * Math.PI * 2;
				const r = 40 + p * reach * (0.7 + random(`pb${at}${i}`) * 0.5);
				const s = PX * 0.7 * (1 - p);
				return <rect key={i} x={cx + Math.cos(a) * r - s / 2} y={cy + Math.sin(a) * r - s / 2} width={s} height={s} fill={color} />;
			})}
		</g>
	);
};

/** Pixel trail left behind a runner: squares spawn at the runner's heels and fade on steps. */
export const PixelTrail: React.FC<{t: number; xAt: (t: number) => number; groundY: number; until: number}> = ({t, xAt, groundY, until}) => {
	const st = stepped(t);
	return (
		<g style={{shapeRendering: 'crispEdges'}}>
			{Array.from({length: 14}, (_, i) => {
				const born = i * 0.08;
				const age = st - born;
				if (born > until || age < 0 || age > 0.6) return null;
				const s = PX * (1 - age / 0.6) * (0.6 + random(`tr${i}`) * 0.6);
				const x = xAt(born) + 120 + age * 90;
				const y = groundY - 30 - random(`try${i}`) * 140 - age * 30;
				const fill = [colors.nanduGold, colors.nanduLight, colors.tealBright][i % 3];
				return <rect key={i} x={x} y={y} width={s} height={s} fill={fill} opacity={1 - age / 0.6} />;
			})}
		</g>
	);
};
