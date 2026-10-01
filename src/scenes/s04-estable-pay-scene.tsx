import React from 'react';
import {Easing, interpolate, random, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../audio/sound-effects';
import {colors, fontInter} from '../brand/brand-tokens';
import {CoinIcon, CoinSymbol} from '../components/coin-icon';
import {PopChip} from '../components/pop-chip';
import {SceneActor} from '../components/scene-actor';
import {EstableLogoShape} from '../mascots/estable-mascot';
import {InfoCard} from '../props/scene-props';
import {poseAt, timeScene, wordStart} from '../storyboard/scene-timeline';
import {InvoiceCard} from './parts/s04-invoice-card';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s04-pay');
const GROUND = 850;
const ESTABLE_X = 960;
const RING = {x: ESTABLE_X, y: 330, rx: 160, ry: 44};
const STACK = {x: 1480, base: GROUND - 22, step: 28};
const RAIN: CoinSymbol[] = ['BTC', 'ETH', 'TRX', 'ETH', 'BTC', 'TRX', 'BTC', 'ETH', 'TRX'];
const STABLE_COINS = 6;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Generic teal stable coin (Estable triangle on top) — deliberately not any real stablecoin brand. */
const StableCoin: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<ellipse cx={x} cy={y + 12} rx={72} ry={24} fill={colors.tealShade} stroke={colors.outline} strokeWidth={7} />
		<rect x={x - 72} y={y} width={144} height={12} fill={colors.tealShade} />
		<ellipse cx={x} cy={y} rx={72} ry={24} fill={colors.teal} stroke={colors.outline} strokeWidth={7} />
		<g transform={`translate(${x - 14} ${y - 12}) scale(${28 / 1024} ${24 / 1024})`}>
			<EstableLogoShape fill={colors.tealLight} />
		</g>
	</g>
);

/** S04 — Estable Pay: invoice prints, crypto rains into the settlement ring, stable coins stack. */
export const S04EstablePayScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	// Word cues: "send"(4) "customers"(7) "settles"(14) "Instantly."(18).
	const SEND = wordStart(line, 4);
	const PAY = wordStart(line, 7);
	const SETTLE = wordStart(line, 14);
	const INSTANT = wordStart(line, 18);

	const print = interpolate(t, [SEND - 0.1, SEND + 0.9], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const invoiceSlide = interpolate(t, [SEND - 0.1, SEND + 0.25], [-120, 0], {...clamp, easing: Easing.out(Easing.back(1.2))});
	const paid = interpolate(t, [INSTANT + 0.05, INSTANT + 0.25], [0, 1], clamp);
	const ringIn = spring({frame: (t - (PAY - 0.25)) * fps, fps, config: {damping: 10, stiffness: 150}});
	const ringPulse = Math.max(0, ...RAIN.map((_, i) => 1 - Math.abs(t - (PAY + i * 0.13 + 0.7)) / 0.12));

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', facing: -1, look: -0.6},
			{at: SEND - 0.15, action: 'point', facing: -1, look: -1},
			{at: PAY - 0.2, action: 'celebrate', facing: 1, look: 0},
			{at: SETTLE - 0.1, action: 'point', facing: 1, look: 1},
			{at: INSTANT - 0.1, action: 'jump', facing: 1, look: 0.5},
			{at: INSTANT + 0.9, action: 'idle', facing: 1, look: 0.3},
		],
		lines,
		t,
	);

	// Settled counter ticks from 0 to the invoice amount between "settles" and "Instantly".
	const settled = interpolate(t, [SETTLE, INSTANT], [0, 120], {...clamp, easing: Easing.out(Easing.cubic)});

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.5} glowY={0.4}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{print > 0 && (
					<g transform={`translate(${invoiceSlide} 0)`}>
						<InvoiceCard x={190} y={150} w={380} h={600} print={print} paid={paid} />
					</g>
				)}
				{/* Stable coins arc out of the ring and stack up to the right. */}
				{Array.from({length: STABLE_COINS}, (_, i) => {
					const start = SETTLE + i * 0.16;
					const k = interpolate(t, [start, start + 0.55], [0, 1], clamp);
					if (k <= 0) return null;
					const endY = STACK.base - i * STACK.step;
					const x = interpolate(k, [0, 1], [RING.x + RING.rx * 0.6, STACK.x]);
					const y = interpolate(k, [0, 1], [RING.y + 20, endY], {easing: Easing.in(Easing.quad)}) - Math.sin(k * Math.PI) * 120;
					return <StableCoin key={i} x={x} y={y} />;
				})}
			</svg>
			{/* Crypto rains down into the settlement ring and dissolves into it. */}
			{RAIN.map((sym, i) => {
				const start = PAY + i * 0.13;
				const k = interpolate(t, [start, start + 0.7], [0, 1], clamp);
				if (k <= 0 || k >= 1) return null;
				const x0 = RING.x + (random(`rain-x${i}`) - 0.5) * 760;
				const x1 = RING.x + (random(`rain-t${i}`) - 0.5) * RING.rx;
				const x = interpolate(k, [0, 1], [x0, x1], {easing: Easing.in(Easing.quad)});
				const y = interpolate(k, [0, 1], [-120, RING.y], {easing: Easing.in(Easing.quad)});
				const size = interpolate(k, [0, 0.8, 1], [96, 84, 20]);
				return <CoinIcon key={i} symbol={sym} size={size} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, transform: `rotate(${(random(`rain-r${i}`) - 0.5) * 80 * (1 - k)}deg)`}} />;
			})}
			<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
				{ringIn > 0.01 && (
					<g transform={`translate(${RING.x} ${RING.y}) scale(${ringIn})`}>
						<ellipse rx={RING.rx + 30} ry={RING.ry + 18} fill={colors.tealBright} opacity={0.18 + ringPulse * 0.35} />
						<ellipse rx={RING.rx} ry={RING.ry} fill="none" stroke={colors.outline} strokeWidth={30} />
						<ellipse rx={RING.rx} ry={RING.ry} fill="none" stroke={colors.tealBright} strokeWidth={16} />
						<path d={`M ${-RING.rx * 0.7} ${-RING.ry * 0.7} A ${RING.rx} ${RING.ry} 0 0 1 ${-RING.rx * 0.1} ${-RING.ry}`} stroke={colors.white} strokeOpacity={0.7} strokeWidth={6} strokeLinecap="round" fill="none" />
					</g>
				)}
			</svg>
			<SceneActor id="estable" pose={estable} x={ESTABLE_X} groundY={GROUND} height={310} />
			<InfoCard x={1340} y={170} w={440} fontSize={26} accent={colors.tealBright} scale={interpolate(t, [SETTLE - 0.3, SETTLE], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))})}>
				<div style={{opacity: 0.75, fontSize: 22, fontWeight: 700}}>Settled in stablecoins</div>
				<div style={{fontFamily: fontInter, fontSize: 56, color: colors.tealBright, fontVariantNumeric: 'tabular-nums'}}>${settled.toFixed(2)}</div>
			</InfoCard>
			<PopChip at={0.25} x={ESTABLE_X} y={92} label="Estable Pay" size={34} />
			<PopChip at={INSTANT} x={STACK.x} y={STACK.base - STABLE_COINS * STACK.step - 70} label="Settled ✓" color={colors.tealBright} size={30} />
			<Sfx name="invoice-print" at={SEND - 0.1} volume={0.8} />
			<Sfx name="coin-rain" at={PAY + 0.3} />
			<Sfx name="coin-rain" at={SETTLE} volume={0.6} />
			<Sfx name="settle-chime" at={INSTANT} />
			<Sfx name="text-stamp" at={INSTANT + 0.05} volume={0.8} />
		</SceneFrame>
	);
};
