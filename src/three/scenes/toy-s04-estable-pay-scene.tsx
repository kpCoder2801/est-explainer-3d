import React from 'react';
import {Easing, interpolate, random, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import type {CoinSymbol} from '../../components/coin-icon';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToyChip, ToyCoin, ToyStableCoin} from '../kit/toy-props';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import type {V3} from '../kit/toy-stage';
import {ToyMascot} from '../mascots/toy-mascot';
import {ToyInvoiceCard} from './parts/toy-s04-invoice-card';
import {SettledDashboard, SettlementRing} from './parts/toy-s04-settlement-ring';

const SCENE = sceneById('s04-pay');
const ESTABLE: V3 = [0, 0, 0.3];
const RING: V3 = [0, 2.9, 0.3];
const STACK: V3 = [2.2, 0, 0];
const STACK_STEP = 0.09;
const RAIN: CoinSymbol[] = ['BTC', 'ETH', 'TRX', 'ETH', 'BTC', 'TRX', 'BTC', 'ETH', 'TRX'];
const STABLE_COINS = 8;
const AMOUNT = 120;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const smooth = {...clamp, easing: Easing.inOut(Easing.cubic)};

/** Camera keyframes [time, position, target]; the shot eases between them. */
const track = (t: number, keys: number[], shots: Array<[V3, V3]>) => {
	const at = (sel: 0 | 1, axis: number) => interpolate(t, keys, shots.map((s) => s[sel][axis]), smooth);
	return {position: [at(0, 0), at(0, 1), at(0, 2)] as V3, target: [at(1, 0), at(1, 1), at(1, 2)] as V3};
};

/** S04 — Estable Pay: invoice slides in, crypto rains into the settlement ring, stable coins stack while the dashboard ticks. */
export const ToyS04EstablePayScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	// Word cues: "send"(4) "customers"(7) "settles"(14) "Instantly."(18).
	const SEND = wordStart(line, 4);
	const PAY = wordStart(line, 7);
	const SETTLE = wordStart(line, 14);
	const INSTANT = wordStart(line, 18);

	const invoiceIn = spring({frame: (t - (SEND - 0.15)) * fps, fps, config: {damping: 13, stiffness: 110}});
	const paid = interpolate(t, [INSTANT + 0.05, INSTANT + 0.25], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const ringIn = spring({frame: (t - (PAY - 0.25)) * fps, fps, config: {damping: 10, stiffness: 150}});
	const ringPulse = Math.max(0, ...RAIN.map((_, i) => 1 - Math.abs(t - (PAY + i * 0.13 + 0.75)) / 0.12));
	const titleIn = spring({frame: (t - 0.25) * fps, fps, config: {damping: 11, stiffness: 160}}) * interpolate(t, [PAY - 0.5, PAY - 0.1], [1, 0], clamp);
	const dashIn = spring({frame: (t - (SETTLE - 0.3)) * fps, fps, config: {damping: 12, stiffness: 140}});
	const settledChip = spring({frame: (t - INSTANT) * fps, fps, config: {damping: 10, stiffness: 170}});
	// Settled counter ticks from 0 to the invoice amount between "settles" and "Instantly".
	const settled = interpolate(t, [SETTLE, INSTANT], [0, AMOUNT], {...clamp, easing: Easing.out(Easing.cubic)});

	const pose = poseAt(
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
	// Turns toward the invoice, faces front under the ring, then toward the stack and dashboard.
	const yaw = interpolate(t, [SEND - 0.3, SEND, PAY - 0.3, PAY, SETTLE - 0.3, SETTLE, INSTANT + 0.9, INSTANT + 1.3], [-0.3, -0.75, -0.75, 0, 0, 0.6, 0.6, 0.25], clamp);

	// Opens on Estable + invoice, sweeps to centre under the ring as coins rain, dollies right for the stack and dashboard.
	const camera = track(
		t,
		[0, SEND + 0.4, PAY + 0.2, SETTLE - 0.2, SETTLE + 0.8, INSTANT + 0.6],
		[
			[[0.1, 2.3, 10.6], [0, 1.75, 0]],
			[[-1.6, 2.4, 11.2], [-1.2, 1.75, 0]],
			[[0, 2.2, 11.4], [0, 1.85, 0]],
			[[0.3, 2.3, 11.6], [0.2, 1.85, 0]],
			[[1.4, 2.4, 11.6], [0.7, 1.8, 0]],
			[[1.1, 2.3, 11], [0.5, 1.75, 0]],
		],
	);

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			overlay={
				<>
					<Sfx name="invoice-print" at={SEND - 0.1} volume={0.8} />
					<Sfx name="coin-rain" at={PAY + 0.3} />
					<Sfx name="coin-rain" at={SETTLE} volume={0.6} />
					<Sfx name="settle-chime" at={INSTANT} />
					<Sfx name="text-stamp" at={INSTANT + 0.05} volume={0.8} />
				</>
			}
		>
			{titleIn > 0.01 && <ToyChip label="Estable Pay" height={0.42} position={[0, 3.75, 0]} scale={titleIn} />}
			{invoiceIn > 0.001 && (
				<ToyInvoiceCard
					paid={paid}
					position={[interpolate(invoiceIn, [0, 1], [-7.5, -3.3]), 2.05 + Math.sin(t * 1.4) * 0.05, -0.2]}
					rotation={[0, interpolate(invoiceIn, [0, 1], [-1.6, 0.32]), interpolate(invoiceIn, [0, 1], [0.5, 0.04])]}
				/>
			)}
			{ringIn > 0.01 && <SettlementRing position={[RING[0], RING[1] + Math.sin(t * 2.2) * 0.04, RING[2]]} scale={ringIn} pulse={ringPulse} />}
			{/* Crypto rains down from above the frame and is swallowed by the ring. */}
			{RAIN.map((sym, i) => {
				const k = interpolate(t, [PAY + i * 0.13, PAY + i * 0.13 + 0.75], [0, 1], clamp);
				if (k <= 0 || k >= 1) return null;
				const fall = Easing.in(Easing.quad)(k);
				const from: V3 = [(random(`rain-x${i}`) - 0.5) * 6, 6.6, -0.6 + random(`rain-z${i}`) * 1.4];
				const to: V3 = [RING[0] + (random(`rain-t${i}`) - 0.5) * 0.5, RING[1], RING[2]];
				const pos = from.map((v, a) => v + (to[a] - v) * fall) as V3;
				const spin = (random(`rain-r${i}`) - 0.5) * 8 * (1 - k);
				return <ToyCoin key={i} symbol={sym} radius={0.3} position={pos} rotation={[spin * 0.4, spin, 0]} scale={interpolate(k, [0, 0.8, 1], [1, 0.9, 0.15])} />;
			})}
			{/* Stable coins drop out under the ring and arc onto a growing stack. */}
			{Array.from({length: STABLE_COINS}, (_, i) => {
				const k = interpolate(t, [SETTLE + i * 0.16, SETTLE + i * 0.16 + 0.6], [0, 1], clamp);
				if (k <= 0) return null;
				const x = interpolate(k, [0, 1], [RING[0] + 0.25, STACK[0]]);
				const y = interpolate(k, [0, 1], [RING[1] - 0.6, STACK[1] + 0.05 + i * STACK_STEP], {easing: Easing.in(Easing.quad)}) + Math.sin(k * Math.PI) * 0.35;
				const z = interpolate(k, [0, 1], [RING[2], STACK[2]]);
				const wobble = (random(`stk${i}`) - 0.5) * 0.5;
				return <ToyStableCoin key={i} radius={0.34} position={[x + (k >= 1 ? wobble * 0.08 : 0), y, z]} rotation={[-Math.PI / 2 + (1 - k) * Math.PI * 2, 0, wobble]} />;
			})}
			{settledChip > 0.01 && <ToyChip label="Settled" color={colors.tealBright} textColor={colors.ink} height={0.36} position={[STACK[0], STACK[1] + STABLE_COINS * STACK_STEP + 0.45, STACK[2]]} scale={settledChip} />}
			{dashIn > 0.01 && (
				<group position={[3.55, 2.75, -0.6]} rotation={[(1 - dashIn) * 1.2, -0.32, 0]} scale={Math.max(0.001, dashIn)}>
					<SettledDashboard amount={settled} target={AMOUNT} />
				</group>
			)}
			<group position={ESTABLE}>
				<ToyMascot id="estable" pose={pose} height={1.75} yaw={yaw} />
			</group>
		</ToySceneFrame>
	);
};
