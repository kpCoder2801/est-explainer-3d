import React from 'react';
import {Easing, interpolate, random, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import type {CoinSymbol} from '../../components/coin-icon';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToyChip, ToyCoin} from '../kit/toy-props';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import type {V3} from '../kit/toy-stage';
import {ToyMascot} from '../mascots/toy-mascot';
import {chuteWorld, RingBurst, ToyCapsuleDomeMachine} from './parts/toy-s06-capsule-dome-minting-machine';

const SCENE = sceneById('s06-coin');
const MACHINE_AT: V3 = [0.4, 0, 0];
const ESTABLE_AT: V3 = [-2.25, 0, 0.35];
const ARSE_LAND: V3 = [3.35, 0, 0.6];
const ARSE_H = 1.55;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

/** A chain chip with the chain's coin beside it (multi-chain issuance). */
const ChainChip: React.FC<{label: string; coin?: CoinSymbol; at: V3; scale: number}> = ({label, coin, at, scale}) => (
	<group position={at} scale={Math.max(0.001, scale)}>
		<ToyChip label={label} color={colors.tealDark} height={0.34} position={[coin ? 0.22 : 0, 0, 0]} />
		{coin && <ToyCoin symbol={coin} radius={0.2} position={[-0.34 * (0.9 + label.length * 0.32) * 0.5, 0, 0.1]} />}
	</group>
);

/** S06 — Estable Coin: Estable cranks the capsule-dome machine and ARSe shoots out of the chute. */
export const ToyS06CoinMintsArseScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [estLine, arseLine] = lines;

	// "Like this one!" lands at the end of Estable's line: crank, dome rattles, ARSe pops out.
	const CRANK = estLine.end - 1.7;
	const MINT = CRANK + 1.2;
	const LAND = MINT + 0.75;
	const PEG = wordStart(arseLine, 8); // "one to one"
	const RESERVES = wordStart(arseLine, 14); // "reserves"

	const drop = interpolate(t, [0, 0.55], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
	const op = interpolate(t, [CRANK, MINT], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const rattle = interpolate(op, [0, 0.15, 0.9, 1], [0, 1, 1, 0], clamp) + interpolate(t, [MINT, MINT + 0.25], [0.8, 0], clamp);
	// A per-frame jolt as ARSe bursts out (stepped on frames, so still deterministic).
	const jolt = t > MINT && t < MINT + 0.22 ? (random(`jolt${Math.floor(t * fps)}`) - 0.5) * 0.12 : 0;
	const pop = (at: number) => spring({frame: (t - at) * fps, fps, config: {damping: 10, stiffness: 170}});
	// Chain chips clear away when ARSe takes the stage.
	const chainOut = interpolate(t, [arseLine.start - 0.1, arseLine.start + 0.2], [1, 0], clamp);

	// ARSe: out of the chute on an arc, cartwheeling once, landing with a squash.
	const out = interpolate(t, [MINT, LAND], [0, 1], clamp);
	const from = chuteWorld(MACHINE_AT);
	const arsePos: V3 = [
		interpolate(out, [0, 1], [from[0], ARSE_LAND[0]]),
		interpolate(out, [0, 1], [from[1] - 0.3, ARSE_LAND[1]]) + Math.sin(out * Math.PI) * 2.1,
		interpolate(out, [0, 1], [from[2], ARSE_LAND[2]]),
	];
	const grow = interpolate(out, [0, 0.35], [0.2, 1], clamp);
	const since = t - LAND;
	const squash = since > 0 ? Math.cos(since * 15) * Math.exp(-since * 6) * 0.26 : 0;

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', look: 0.6},
			{at: estLine.start + 1.4, action: 'point', look: 1},
			{at: estLine.start + 2.8, action: 'idle', look: 0.4},
			{at: CRANK - 0.15, action: 'point', look: 1},
			{at: MINT + 0.1, action: 'celebrate', look: 1},
			{at: LAND + 0.8, action: 'idle', look: 1},
		],
		lines,
		t,
	);
	const arse = poseAt(
		'arse',
		[
			{at: 0, action: 'celebrate', facing: -1},
			{at: LAND, action: 'idle', facing: -1, look: -0.3},
			{at: arseLine.start, action: 'wave', facing: -1},
			{at: arseLine.start + 1.2, action: 'idle', facing: -1, look: 0},
		],
		lines,
		t,
	);
	// Estable turns to the crank on its right, then back toward ARSe and camera.
	const estableYaw = interpolate(t, [CRANK - 0.4, CRANK, MINT + 0.2, LAND + 0.4], [0.32, 0.95, 0.95, 0.4], {...clamp, easing: ease});
	const arseYaw = interpolate(t, [LAND, LAND + 0.4, arseLine.start + 1.2, arseLine.start + 1.7], [-0.9, -0.55, -0.55, -0.25], {...clamp, easing: ease});

	// Drop-in wide → orbit left to see the crank side → swing right to follow ARSe → slow push on ARSe.
	const keys = [0.6, CRANK - 0.2, MINT, LAND + 0.5, SCENE.lead + 15];
	const camera = {
		position: [
			interpolate(t, keys, [-0.8, -3.3, -1.2, 1.4, 2.0], {...clamp, easing: ease}),
			interpolate(t, keys, [3.1, 2.7, 2.6, 2.5, 2.4], {...clamp, easing: ease}),
			interpolate(t, keys, [12.6, 10.6, 11.6, 11.8, 11.3], {...clamp, easing: ease}),
		] as V3,
		target: [interpolate(t, keys, [0.2, -0.3, 0.6, 1.0, 1.15], {...clamp, easing: ease}), interpolate(t, keys, [1.75, 1.7, 1.7, 1.6, 1.52], {...clamp, easing: ease}), 0] as V3,
	};

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			glowX={0.8}
			overlay={
				<>
					<Sfx name="machine-drop" at={0.15} />
					<Sfx name="crank-rattle" at={CRANK} />
					<Sfx name="coin-pop-out" at={MINT - 0.05} />
					<Sfx name="landing-squash" at={LAND - 0.05} />
					<Sfx name="chip-pop" at={PEG} volume={0.7} />
					<Sfx name="chip-pop" at={RESERVES} volume={0.7} />
				</>
			}
		>
			<group position={[MACHINE_AT[0] + jolt, MACHINE_AT[1] + (1 - drop) * 7 + Math.abs(jolt) * 0.5, MACHINE_AT[2]]}>
				<ToyCapsuleDomeMachine crank={-op * Math.PI * 3} rattle={Math.min(1, rattle)} time={t} />
			</group>
			{/* Multi-chain issuance. Avalanche (named on the site) has no Estable asset, so it folds into "+ more". */}
			{chainOut > 0 && (
				<group position={[MACHINE_AT[0], 4.2, 0]}>
					<ChainChip label="Ethereum" coin="ETH" at={[-1.55, 0, 0]} scale={pop(estLine.start + 2.2) * chainOut} />
					<ChainChip label="Polygon" coin="POL" at={[0.25, 0, 0]} scale={pop(estLine.start + 2.4) * chainOut} />
					<ChainChip label="+ more" at={[1.75, 0, 0]} scale={pop(estLine.start + 2.6) * chainOut} />
				</group>
			)}
			<group position={ESTABLE_AT}>
				<ToyMascot id="estable" pose={estable} height={1.9} yaw={estableYaw} />
			</group>
			<RingBurst p={interpolate(t, [MINT, MINT + 0.6], [0, 1], clamp)} color={colors.arseSky} position={from} />
			{t >= MINT && (
				<group position={arsePos} scale={[grow * (1 + squash * 0.6), grow * (1 - squash), grow * (1 + squash * 0.6)]}>
					{/* Cartwheel about the body centre while airborne. */}
					<group position={[0, ARSE_H * 0.62, 0]} rotation={[0, 0, (1 - out) * Math.PI * 2]}>
						<group position={[0, -ARSE_H * 0.62, 0]}>
							<ToyMascot id="arse" pose={arse} height={ARSE_H} yaw={arseYaw} />
						</group>
					</group>
				</group>
			)}
			<group position={[ARSE_LAND[0] + 0.15, 0, ARSE_LAND[2]]}>
				<ToyChip label="1 ARSe = 1 ARS" color={colors.arseBlue} height={0.44} position={[0, 2.55, 0]} scale={Math.max(0.001, pop(PEG))} />
				<ToyChip label="Verifiable reserves" color={colors.arseSky} textColor={colors.arseNavy} height={0.38} position={[0, 3.15, 0]} scale={Math.max(0.001, pop(RESERVES))} />
			</group>
		</ToySceneFrame>
	);
};
