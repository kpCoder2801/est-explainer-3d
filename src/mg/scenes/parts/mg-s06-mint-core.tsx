import React from 'react';
import {colors, fontInter} from '../../../brand/brand-tokens';
import {CoinIcon, CoinSymbol} from '../../../components/coin-icon';
import {DrawPath} from '../../kit/draw-path';

/** Circle as a path (so it can line-draw), starting at 12 o'clock, clockwise. */
const circlePath = (cx: number, cy: number, r: number) => `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;

/** Regular hexagon path, pointy-top. */
const hexPath = (cx: number, cy: number, r: number) =>
	Array.from({length: 6}, (_, i) => {
		const a = ((-90 + i * 60) * Math.PI) / 180;
		return `${i ? 'L' : 'M'} ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`;
	}).join(' ') + ' Z';

/**
 * The "Estable Coin" mint: three concentric rings line-draw in, tick marks spin,
 * a hexagonal core draws then fills with the brand gradient, and on mint a radial
 * burst fires. All inputs are 0…1 progress values driven by the scene.
 */
export const MintCore: React.FC<{
	cx: number;
	cy: number;
	rings: number;
	hex: number;
	fill: number;
	charge: number;
	burst: number;
	spin: number;
	fade: number;
}> = ({cx, cy, rings, hex, fill, charge, burst, spin, fade}) => {
	const pulse = 1 + charge * 0.08;
	return (
		<svg width={1920} height={1080} style={{position: 'absolute', opacity: fade, overflow: 'visible'}}>
			<defs>
				<linearGradient id="mgs06-core" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor={colors.tealBright} />
					<stop offset="0.6" stopColor={colors.teal} />
					<stop offset="1" stopColor={colors.tealShade} />
				</linearGradient>
				<radialGradient id="mgs06-glow">
					<stop offset="0" stopColor={colors.tealBright} stopOpacity={0.55} />
					<stop offset="1" stopColor={colors.tealBright} stopOpacity={0} />
				</radialGradient>
			</defs>
			<circle cx={cx} cy={cy} r={300 * (0.6 + charge * 0.5)} fill="url(#mgs06-glow)" opacity={0.35 + charge * 0.65} />
			{[250, 195, 140].map((r, i) => (
				<DrawPath key={r} d={circlePath(cx, cy, r * pulse)} progress={rings * 1.4 - i * 0.2} stroke={i === 1 ? colors.arseSky : colors.tealBright} width={i === 0 ? 3 : 2} opacity={0.6 - i * 0.12} />
			))}
			{/* Spinning ticks on the outer ring. */}
			<g transform={`rotate(${spin} ${cx} ${cy})`} opacity={rings}>
				{Array.from({length: 36}, (_, i) => {
					const a = (i * 10 * Math.PI) / 180;
					const r1 = 262 * pulse;
					const r2 = r1 + (i % 3 === 0 ? 18 : 8);
					return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} stroke={colors.tealBright} strokeOpacity={0.55} strokeWidth={2} />;
				})}
			</g>
			<g transform={`translate(${cx} ${cy}) scale(${pulse * (1 + burst * 0.15)}) translate(${-cx} ${-cy})`}>
				<path d={hexPath(cx, cy, 105)} fill="url(#mgs06-core)" opacity={fill} />
				<DrawPath d={hexPath(cx, cy, 105)} progress={hex} stroke={colors.tealLight} width={5} />
				<path d={hexPath(cx, cy, 70)} fill="none" stroke={colors.white} strokeOpacity={0.35 * fill} strokeWidth={3} />
			</g>
			{/* Radial burst lines on mint. */}
			{burst > 0 &&
				burst < 1 &&
				Array.from({length: 16}, (_, i) => {
					const a = (i * 22.5 * Math.PI) / 180;
					const r1 = 140 + burst * 260;
					const r2 = r1 + 90 * (1 - burst);
					return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} stroke={i % 2 ? colors.arseSky : colors.tealLight} strokeWidth={8 * (1 - burst)} strokeLinecap="round" />;
				})}
			{burst > 0 && burst < 1 && <circle cx={cx} cy={cy} r={120 + burst * 420} fill="none" stroke={colors.arseSky} strokeWidth={14 * (1 - burst)} />}
		</svg>
	);
};

/** Chain label pill (HTML) orbiting the core. */
export const ChainPill: React.FC<{x: number; y: number; label: string; coin?: CoinSymbol; p: number}> = ({x, y, label, coin, p}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			transform: `translate(-50%, -50%) scale(${0.6 + p * 0.4})`,
			opacity: p,
			display: 'flex',
			alignItems: 'center',
			gap: 12,
			padding: coin ? '10px 22px 10px 10px' : '12px 24px',
			borderRadius: 999,
			background: 'linear-gradient(135deg, rgba(26,51,49,0.95), rgba(14,42,56,0.95))',
			boxShadow: `inset 0 0 0 2px ${colors.tealBright}66, 0 12px 30px rgba(0,0,0,0.45)`,
			fontFamily: fontInter,
			fontWeight: 800,
			fontSize: 26,
			color: colors.white,
			whiteSpace: 'nowrap',
		}}
	>
		{coin && <CoinIcon symbol={coin} size={38} />}
		{label}
	</div>
);
