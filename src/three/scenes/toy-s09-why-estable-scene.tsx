import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import {MascotId} from '../../mascots/mascot';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {Beat, poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToyChip} from '../kit/toy-props';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import {V3} from '../kit/toy-stage';
import {ToyMascot} from '../mascots/toy-mascot';
import {cameraPath} from '../kit/toy-camera-path';
import {BLOCK, landingSquash, ValueBlock3D} from './parts/toy-s09-value-block';
import {ToyEstableLogo} from '../kit/toy-estable-logo';

const SCENE = sceneById('s09-why');
const WALK_IN = 0.75;
const TOSS = 0.45; // seconds a block spends in the air
const CARRY_SCALE = 0.55;
const ARC = 1.5;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Where each mascot stands, walks in from, its size, and the top of its head (to balance a block on). */
const CAST: Record<MascotId, {x: number; from: number; z: number; facing: 1 | -1; height: number; headY: number}> = {
	estable: {x: -4.2, from: -9.5, z: 0.5, facing: 1, height: 1.55, headY: 2.04},
	arse: {x: 3.8, from: 9.5, z: 0.7, facing: -1, height: 1.4, headY: 1.82},
	nandu: {x: 5.75, from: 11, z: 0.2, facing: -1, height: 1.85, headY: 1.9},
};

/** Pyramid slots echoing the Estable triangle: three on the bottom row, two above, the logo on top. */
const PYR_Z = -0.3;
const ROW1_Y = BLOCK.h + 0.02;
const CAP_Y = ROW1_Y * 2;
const STEP = BLOCK.w + 0.12;
const BLOCKS: Array<{label: string; by: MascotId; slot: V3; word: number; delay?: number}> = [
	{label: 'Real-time settlement', by: 'estable', slot: [-STEP, 0, PYR_Z], word: 1},
	{label: 'Compliance-ready', by: 'nandu', slot: [0, 0, PYR_Z], word: 2, delay: 0.25},
	{label: 'Fast to market', by: 'arse', slot: [STEP, 0, PYR_Z], word: 5},
	{label: 'Modular APIs', by: 'estable', slot: [-STEP / 2, ROW1_Y, PYR_Z], word: 7},
	{label: 'End-to-end', by: 'nandu', slot: [STEP / 2, ROW1_Y, PYR_Z], word: 9},
];
const AUDIENCE = [
	{label: 'Fintechs', word: 1, x: -2.4},
	{label: 'Banks', word: 2, x: 0},
	{label: 'PSPs', word: 4, x: 2.4},
];

export const ToyS09WhyEstableScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [estLine, arseLine] = lines;

	const walk = interpolate(t, [0, WALK_IN], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const mascotX = (id: MascotId) => interpolate(walk, [0, 1], [CAST[id].from, CAST[id].x]);

	// Each block lands as Estable names it; tosses never start before the walk-in ends.
	const timed = BLOCKS.map((b) => {
		const land = Math.max(wordStart(estLine, b.word) + (b.delay ?? 0), WALK_IN + TOSS);
		return {...b, land, toss: land - TOSS};
	});
	// A block is held overhead from the thrower's previous landing until its own toss.
	const held = timed.map((b, i) => {
		const prev = timed.slice(0, i).filter((p) => p.by === b.by).at(-1);
		return {...b, holdFrom: prev ? prev.land + 0.1 : -1};
	});
	const LOGO_LAND = estLine.end + 0.05;

	const beatsFor = (id: MascotId): Beat[] => {
		const f = CAST[id].facing;
		const beats: Beat[] = [
			{at: 0, action: 'walk', facing: f},
			{at: WALK_IN, action: 'idle', facing: f, look: f * 0.6},
		];
		timed
			.filter((b) => b.by === id)
			.forEach((b) => beats.push({at: b.toss, action: 'point', facing: f, look: f}, {at: b.land + 0.25, action: 'idle', facing: f, look: f * 0.6}));
		if (id === 'arse') beats.push({at: arseLine.start, action: 'wave', facing: f}, {at: arseLine.start + 1.1, action: 'idle', facing: f});
		beats.push({at: LOGO_LAND, action: 'celebrate', facing: f}, {at: LOGO_LAND + 1.1, action: 'idle', facing: f, look: f * 0.4});
		return beats.sort((a, b) => a.at - b.at);
	};
	// Turn toward the pyramid while throwing; ARSe squares up to camera for its line.
	const yawFor = (id: MascotId) => {
		const f = CAST[id].facing;
		if (timed.some((b) => b.by === id && t >= b.toss - 0.15 && t < b.land + 0.25)) return f * 0.85;
		if (id === 'arse' && t >= arseLine.start - 0.2) return -0.12;
		return undefined;
	};

	const renderBlock = (b: (typeof held)[number], i: number) => {
		if (t < b.holdFrom) return null;
		const c = CAST[b.by];
		const carry: V3 = [mascotX(b.by), c.headY + 0.04, c.z];
		if (t < b.toss) {
			const pop = b.holdFrom < 0 ? 1 : spring({frame: (t - b.holdFrom) * fps, fps, config: {damping: 12}});
			const bob = Math.sin(t * 7 + i) * 0.03;
			return <ValueBlock3D key={b.label} label={b.label} position={[carry[0], carry[1] + bob, carry[2]]} scale={CARRY_SCALE * pop} rotation={[0, c.facing * 0.5, 0]} />;
		}
		// Flight: an arc toward the slot with a full spin, growing from carry size to full size.
		const p = interpolate(t, [b.toss, b.land], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
		const pos: V3 = [
			interpolate(p, [0, 1], [carry[0], b.slot[0]]),
			interpolate(p, [0, 1], [carry[1], b.slot[1]]) + Math.sin(p * Math.PI) * ARC,
			interpolate(p, [0, 1], [carry[2], b.slot[2]]),
		];
		return (
			<ValueBlock3D
				key={b.label}
				label={b.label}
				position={pos}
				scale={interpolate(p, [0, 1], [CARRY_SCALE, 1])}
				rotation={[0, (1 - p) * (c.facing * 0.5 - c.facing * Math.PI * 2), (1 - p) * -0.25 * c.facing]}
				squash={landingSquash(t, b.land)}
			/>
		);
	};

	// Estable-logo capstone drops from the sky once the whole line is said.
	const logoP = interpolate(t, [LOGO_LAND - 0.4, LOGO_LAND], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const logoSquash = landingSquash(t, LOGO_LAND, 1.8);
	const glow = interpolate(t, [LOGO_LAND, LOGO_LAND + 0.3, LOGO_LAND + 1.6], [0, 1, 0.35], clamp);

	// Sweep from the left side across the build, settle front-on for the capstone, then drift toward ARSe.
	const camera = cameraPath(t, [
		{at: 0, position: [-3.2, 2.6, 13.2], target: [-0.4, 1.2, 0]},
		{at: 3.6, position: [2.4, 2.4, 13], target: [0.5, 1.15, 0]},
		{at: 6.4, position: [0.3, 2.3, 13], target: [0.5, 1.2, 0]},
		{at: LOGO_LAND + 0.3, position: [0.4, 2.3, 12.9], target: [0.55, 1.45, 0]},
		{at: arseLine.end + 0.6, position: [0.6, 2.2, 13], target: [0.6, 1.5, 0]},
	]);

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			reveal={1 + glow * 0.6}
			overlay={
				<>
					<Sfx name="footsteps-cartoon" at={0} volume={0.7} />
					{timed.map((b) => (
						<Sfx key={b.label} name="block-thud" at={b.land - 0.03} volume={0.9} />
					))}
					<Sfx name="block-thud" at={LOGO_LAND - 0.03} />
					<Sfx name="magic-swap" at={LOGO_LAND} volume={0.7} />
					{AUDIENCE.map((a) => (
						<Sfx key={a.label} name="chip-pop" at={wordStart(arseLine, a.word)} volume={0.5} />
					))}
				</>
			}
		>
			{held.map(renderBlock)}
			{t >= LOGO_LAND - 0.4 && (
				<group position={[0, interpolate(logoP, [0, 1], [7, CAP_Y]), PYR_Z]} scale={[1 + logoSquash * 0.1, 1 - logoSquash * 0.14, 1]}>
					<ToyEstableLogo size={1.15} />
				</group>
			)}
			{glow > 0 && <pointLight position={[0, CAP_Y + 0.8, 1.4]} color={colors.tealBright} intensity={glow * 14} distance={7} />}
			{(['estable', 'arse', 'nandu'] as MascotId[]).map((id) => (
				<group key={id} position={[mascotX(id), 0, CAST[id].z]}>
					<ToyMascot id={id} pose={poseAt(id, beatsFor(id), lines, t)} height={CAST[id].height} yaw={yawFor(id)} />
				</group>
			))}
			{AUDIENCE.map((a) => {
				const pop = spring({frame: (t - wordStart(arseLine, a.word)) * fps, fps, config: {damping: 10, stiffness: 170}});
				return pop > 0.01 ? <ToyChip key={a.label} label={a.label} color={colors.arseBlue} height={0.42} position={[a.x, 3.05 + (1 - pop) * -0.3, 0.4]} scale={pop} /> : null;
			})}
		</ToySceneFrame>
	);
};
