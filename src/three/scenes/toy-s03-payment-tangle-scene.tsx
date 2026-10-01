import React from 'react';
import {Easing, interpolate, random, spring, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import type {V3} from '../kit/toy-stage';
import {ToyMascot} from '../mascots/toy-mascot';
import {PaymentNode, PaymentNodeKind} from './parts/toy-s03-payment-nodes';
import {estableRightHand} from '../mascots/toy-estable-mascot';
import {CablePlug, cablePoints, CableTube, knotLoop} from './parts/toy-s03-tangle-cables';

const SCENE = sceneById('s03-problem');
const KNOT: V3 = [1.55, 2.3, -0.3];
const ESTABLE: V3 = [-3.1, 0, 0.2];
const ESTABLE_H = 1.7;
const ESTABLE_YAW = 0.5;
/** Where the loose end lies on the floor before Estable picks it up. */
const LOOSE_REST = new THREE.Vector3(-1.9, 0.1, 0.8);
const CABLE_GREY = '#6f8d89';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const NODES: Array<{kind: PaymentNodeKind; at: V3; yaw: number}> = [
	{kind: 'bank', at: [-0.55, 3.05, -1.3], yaw: 0.25},
	{kind: 'shop', at: [3.75, 2.95, -1.0], yaw: -0.3},
	{kind: 'phone', at: [1.65, 1.5, 0.7], yaw: 0},
];
/** Each cable links one node to the next, all through the same knot. */
const LOOPS = [knotLoop('k1', 5), knotLoop('k2', 5), knotLoop('k3', 6)];

export const ToyS03PaymentTangleScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	const MESSY = wordStart(line, 9); // "It's complex, fragmented, and slow."
	const PULL = wordStart(line, 14); // "Let's fix that."
	const SNAP = Math.min(wordStart(line, 16) + 0.35, line.end + 0.15);

	const pull = interpolate(t, [PULL + 0.2, SNAP], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
	const messy = interpolate(t, [MESSY - 0.2, MESSY + 0.3], [0, 1], clamp) * (1 - pull);
	const snap = t < SNAP ? 0 : spring({frame: (t - SNAP) * fps, fps, config: {damping: 8, stiffness: 150}});
	const flash = interpolate(t, [SNAP, SNAP + 0.08, SNAP + 0.6], [0, 1, 0], clamp);
	const grab = interpolate(t, [PULL, PULL + 0.3], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const retract = interpolate(t, [SNAP - 0.02, SNAP + 0.18], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});

	// Wobbles harder while it's "complex, fragmented, and slow", tightens as Estable pulls.
	const knotOpts = {snap, tighten: 1 - pull * 0.7, wobble: 0.05 + messy * 0.14, t};
	const cables = NODES.map((n, i) => cablePoints(n.at, NODES[(i + 1) % NODES.length].at, KNOT, LOOPS[i], knotOpts));
	const flicker = messy > 0.05 && random(`f${Math.floor(t * 9)}`) > 0.45;
	const cableColor = t >= SNAP ? colors.tealBright : messy > 0.05 ? (flicker ? '#ff6b6b' : '#c0464e') : CABLE_GREY;

	const pose = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', look: 0.8},
			{at: MESSY + 0.6, action: 'idle', look: 1},
			{at: PULL, action: 'point', look: 1},
			{at: SNAP + 0.15, action: 'celebrate', look: 0.6},
		],
		lines,
		t,
	);

	// Loose end: leaves the knot, sags to the floor, jumps to Estable's glove on "Let's", whips back on the snap.
	const hand = estableRightHand(pose, [ESTABLE[0] - pull * 0.25, 0, ESTABLE[2]], ESTABLE_H, ESTABLE_YAW);
	const knotExit = cables[2][3];
	const tip = LOOSE_REST.clone().lerp(hand, grab).lerp(knotExit, retract);
	const sag = (1 - grab * 0.6) * (1 - pull);
	const mid = knotExit.clone().lerp(tip, 0.55).setY(Math.max(0.15, Math.min(knotExit.y, tip.y) - 0.9 * sag));
	const loose = [knotExit, knotExit.clone().lerp(mid, 0.5).setY(knotExit.y - 0.4 * sag), mid, tip];

	const nodeIn = (i: number) => spring({frame: (t - 0.1 - i * 0.15) * fps, fps, config: {damping: 11, stiffness: 150}});
	const bounce = 1 + Math.sin(interpolate(t, [SNAP, SNAP + 0.5], [0, Math.PI], clamp)) * 0.12;


	// Slow orbit; pushes in on the knot while it's messy, pulls back wide for the clean snap.
	const tense = interpolate(t, [MESSY - 0.5, MESSY + 1.5], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const release = interpolate(t, [PULL, SNAP + 0.8], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const close = tense * (1 - release);
	const camera = {
		position: [-0.6 + Math.sin(t * 0.3) * 0.9 + release * 0.6, 2.75 + close * 0.15, 12 - close * 0.9 + release * 0.2] as V3,
		target: [0.35 + close * 0.15, 1.7 + close * 0.15, 0] as V3,
	};

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			glowX={0.8}
			glow={messy > 0.05 && t < SNAP ? '#c0464e' : colors.tealBright}
			overlay={
				<>
					{NODES.map((_, i) => (
						<Sfx key={i} name="block-thud" at={0.1 + i * 0.15} volume={0.6} />
					))}
					<Sfx name="cable-tangle" at={MESSY - 0.1} volume={0.8} />
					<Sfx name="cable-snap-clean" at={SNAP - 0.25} />
				</>
			}
		>
			{NODES.map((n, i) => (
				<group key={n.kind} position={n.at} rotation={[0, n.yaw, 0]} scale={Math.max(0.001, nodeIn(i)) * (t >= SNAP ? bounce : 1)}>
					<PaymentNode kind={n.kind} glow={snap} />
				</group>
			))}
			{cables.map((pts, i) => (
				<CableTube key={i} points={pts} color={cableColor} />
			))}
			{retract < 1 && (
				<group>
					<CableTube points={loose} color={cableColor} segments={60} />
					<CablePlug at={tip} color={cableColor} />
				</group>
			)}
			{flicker && <pointLight position={KNOT} color="#ff4d5a" intensity={14 * messy} distance={6} />}
			{flash > 0 && (
				<group position={KNOT}>
					<pointLight color={colors.tealBright} intensity={flash * 50} distance={9} />
					<mesh scale={0.3 + (1 - flash) * 2.6}>
						<torusGeometry args={[1, 0.04, 8, 64]} />
						<meshBasicMaterial color={colors.tealBright} transparent opacity={flash} toneMapped={false} />
					</mesh>
				</group>
			)}
			<group position={[ESTABLE[0] - pull * 0.25, 0, ESTABLE[2]]}>
				<ToyMascot id="estable" pose={pose} height={ESTABLE_H} yaw={ESTABLE_YAW} />
			</group>
		</ToySceneFrame>
	);
};
