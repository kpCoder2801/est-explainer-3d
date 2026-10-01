import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import {colors, fontInter} from '../../../brand/brand-tokens';
import {CoinSymbol} from '../../../components/coin-icon';
import {EstableLogoShape} from '../../../mascots/estable-mascot';
import {DrawPath} from '../../kit/draw-path';
import {between, DUR, EASE_IN_OUT, EASE_OUT, enter, STAGGER} from '../../kit/mg-motion';

/** Rounded-rectangle path, so UI cards can line-draw before they fill. */
export const roundedRect = (x: number, y: number, w: number, h: number, r: number) =>
	`M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

/** Flat MG coin: the real Estable currency asset with no sticker outline. */
export const FlatCoin: React.FC<{symbol: CoinSymbol; size: number}> = ({symbol, size}) => (
	<Img src={staticFile(`ccy/${symbol}.svg`)} style={{width: size, height: size, display: 'block', borderRadius: '50%'}} />
);

const CARD = {w: 400, h: 500};

/**
 * Invoice UI card that builds itself: outline draws, fill fades up, rows stagger in.
 * `paid` 0→1 flips the status pill from PENDING to PAID.
 */
export const InvoiceCard: React.FC<{t: number; buildAt: number; paid: number}> = ({t, buildAt, paid}) => {
	const draw = between(t, buildAt, buildAt + 0.55);
	const fill = enter(t, buildAt + 0.45, DUR.std);
	const row = (i: number) => enter(t, buildAt + 0.55 + i * STAGGER * 1.6, DUR.std);
	const rows: Array<[string, string]> = [
		['Merchant', 'Estable Pay'],
		['Amount', '$120.00'],
		['Network', 'Any crypto'],
	];
	return (
		<div style={{position: 'absolute', inset: 0, fontFamily: fontInter}}>
			<svg width={CARD.w + 20} height={CARD.h + 20} style={{position: 'absolute', left: -10, top: -10, overflow: 'visible'}}>
				<defs>
					<linearGradient id="mg-s04-card" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#1f3d3a" />
						<stop offset="1" stopColor="#122523" />
					</linearGradient>
				</defs>
				<path d={roundedRect(10, 10, CARD.w, CARD.h, 32)} fill="url(#mg-s04-card)" opacity={fill} />
				<DrawPath d={roundedRect(10, 10, CARD.w, CARD.h, 32)} progress={draw} stroke={colors.tealBright} width={3} opacity={1 - fill * 0.6} />
			</svg>
			<div style={{position: 'absolute', left: 36, top: 34, right: 36, opacity: row(0), transform: `translateY(${(1 - row(0)) * 20}px)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<div style={{fontSize: 18, fontWeight: 800, letterSpacing: 3, color: colors.tealBright}}>INVOICE</div>
				<div style={{fontSize: 18, fontWeight: 600, color: colors.tealLight, opacity: 0.6}}>#0042</div>
			</div>
			<div style={{position: 'absolute', left: 36, top: 76, opacity: row(1), transform: `translateY(${(1 - row(1)) * 20}px)`, fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em', color: colors.white}}>$120.00</div>
			{rows.map(([k, v], i) => (
				<div
					key={k}
					style={{
						position: 'absolute',
						left: 36,
						right: 36,
						top: 176 + i * 52,
						opacity: row(i + 2),
						transform: `translateX(${(1 - row(i + 2)) * -30}px)`,
						display: 'flex',
						justifyContent: 'space-between',
						fontSize: 22,
						borderBottom: '1px solid rgba(230,249,246,0.12)',
						paddingBottom: 12,
					}}
				>
					<span style={{color: colors.tealLight, opacity: 0.6, fontWeight: 600}}>{k}</span>
					<span style={{color: colors.white, fontWeight: 700}}>{v}</span>
				</div>
			))}
			{/* Mini QR built from a seeded grid, scales in last. */}
			<div style={{position: 'absolute', left: 36, top: 352, opacity: row(5), transform: `scale(${0.8 + row(5) * 0.2})`, transformOrigin: '0 50%'}}>
				<svg width={110} height={110}>
					<rect width={110} height={110} rx={14} fill={colors.white} />
					{Array.from({length: 49}, (_, i) => {
						const x = i % 7;
						const y = Math.floor(i / 7);
						const finder = (x < 2 && y < 2) || (x > 4 && y < 2) || (x < 2 && y > 4);
						const on = finder || (x * 7 + y * 3 + x * y) % 3 === 0;
						return on ? <rect key={i} x={10 + x * 13} y={10 + y * 13} width={12} height={12} rx={2} fill={colors.bgDeep} /> : null;
					})}
				</svg>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 170,
					top: 388,
					opacity: row(5),
					padding: '10px 20px',
					borderRadius: 999,
					fontSize: 20,
					fontWeight: 800,
					letterSpacing: 2,
					background: paid > 0.5 ? colors.tealBright : 'rgba(212,162,78,0.18)',
					color: paid > 0.5 ? colors.bgDeep : colors.nanduLight,
					transform: `scale(${1 + Math.sin(Math.min(1, paid) * Math.PI) * 0.18})`,
				}}
			>
				{paid > 0.5 ? 'PAID ✓' : 'PENDING'}
			</div>
		</div>
	);
};

/** Glowing conversion node: counter-rotating dashed rings around a gradient core with the Estable mark. */
export const ConversionNode: React.FC<{t: number; appear: number; pulse: number}> = ({t, appear, pulse}) => {
	const s = appear * (1 + pulse * 0.12);
	return (
		<svg width={360} height={360} viewBox="-180 -180 360 360" style={{overflow: 'visible', transform: `scale(${s})`}}>
			<defs>
				<radialGradient id="mg-s04-core" cx="0.4" cy="0.35" r="0.7">
					<stop offset="0" stopColor={colors.tealBright} />
					<stop offset="0.6" stopColor={colors.teal} />
					<stop offset="1" stopColor={colors.tealShade} />
				</radialGradient>
				<radialGradient id="mg-s04-glow">
					<stop offset="0" stopColor={colors.tealBright} stopOpacity={0.55} />
					<stop offset="1" stopColor={colors.tealBright} stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle r={170} fill="url(#mg-s04-glow)" opacity={0.6 + pulse * 0.4} />
			<circle r={128} fill="none" stroke={colors.tealBright} strokeOpacity={0.5} strokeWidth={3} strokeDasharray="4 14" transform={`rotate(${t * 40})`} />
			<circle r={100} fill="none" stroke={colors.arseSky} strokeOpacity={0.55} strokeWidth={4} strokeDasharray="30 18" transform={`rotate(${-t * 70})`} />
			<circle r={70} fill="url(#mg-s04-core)" />
			<g transform="translate(-30 -32) scale(0.06)">
				<EstableLogoShape fill={colors.white} />
			</g>
		</svg>
	);
};

/** Point on a quadratic Bézier. */
const quad = (a: number, c: number, b: number, k: number) => (1 - k) * (1 - k) * a + 2 * (1 - k) * k * c + k * k * b;

/**
 * A real coin flying a curved path into the node, with a fading motion trail.
 * Returns null before launch and after it is absorbed.
 */
export const FlyingCoin: React.FC<{
	t: number;
	at: number;
	symbol: CoinSymbol;
	from: [number, number];
	ctrl: [number, number];
	to: [number, number];
	size?: number;
}> = ({t, at, symbol, from, ctrl, to, size = 88}) => {
	const FLIGHT = 0.62;
	if (t < at || t > at + FLIGHT + 0.12) return null;
	const pos = (time: number) => {
		const k = EASE_IN_OUT(Math.max(0, Math.min(1, (time - at) / FLIGHT)));
		return {x: quad(from[0], ctrl[0], to[0], k), y: quad(from[1], ctrl[1], to[1], k), k};
	};
	const absorb = interpolate(t, [at + FLIGHT - 0.08, at + FLIGHT + 0.1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_OUT});
	return (
		<>
			{[5, 4, 3, 2, 1].map((g) => {
				const p = pos(t - g * 0.035);
				return <div key={g} style={{position: 'absolute', left: p.x - (size * 0.5 * (1 - g * 0.12)), top: p.y - (size * 0.5 * (1 - g * 0.12)), width: size * (1 - g * 0.12), height: size * (1 - g * 0.12), borderRadius: '50%', background: colors.tealBright, opacity: (0.22 - g * 0.035) * absorb}} />;
			})}
			{(() => {
				const p = pos(t);
				return (
					<div style={{position: 'absolute', left: p.x - size / 2, top: p.y - size / 2, transform: `scale(${absorb}) rotate(${p.k * 360}deg)`, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'}}>
						<FlatCoin symbol={symbol} size={size} />
					</div>
				);
			})()}
		</>
	);
};

/** Settlement card: amount counter rolls up in stable value. */
export const SettleCard: React.FC<{t: number; at: number; countTo: number}> = ({t, at, countTo}) => {
	const p = enter(t, at, DUR.slow);
	const value = 120 * EASE_OUT(Math.max(0, Math.min(1, (t - at) / Math.max(0.1, countTo - at))));
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				borderRadius: 28,
				background: `linear-gradient(135deg, ${colors.teal}, ${colors.tealShade})`,
				opacity: p,
				transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + p * 0.1})`,
				fontFamily: fontInter,
				padding: '26px 30px',
				boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
			}}
		>
			<div style={{fontSize: 16, fontWeight: 800, letterSpacing: 3, color: colors.tealLight, opacity: 0.85}}>SETTLED IN STABLECOINS</div>
			<div style={{fontSize: 70, fontWeight: 800, letterSpacing: '-0.03em', color: colors.white, marginTop: 8, fontVariantNumeric: 'tabular-nums'}}>${value.toFixed(2)}</div>
			<div style={{fontSize: 18, fontWeight: 600, color: colors.tealLight, opacity: 0.75, marginTop: 4}}>No volatility · real-time</div>
		</div>
	);
};
