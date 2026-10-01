import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../audio/sound-effects';
import {colors} from '../brand/brand-tokens';
import {PopChip} from '../components/pop-chip';
import {SceneActor} from '../components/scene-actor';
import {EstableLogoShape} from '../mascots/estable-mascot';
import {MascotId} from '../mascots/mascot';
import {Beat, poseAt, timeScene, wordStart} from '../storyboard/scene-timeline';
import {BLOCK, ValueBlock} from './parts/s09-value-block';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s09-why');
const GROUND = 860;
const WALK_IN = 0.75;
const TOSS = 0.45; // seconds a block spends in the air
const CARRY_SCALE = 0.55;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Where each mascot stands, walks in from, and how high its head is (to balance a block on). */
const CAST: Record<MascotId, {x: number; from: number; facing: 1 | -1; height: number; headY: number}> = {
	estable: {x: 270, from: -260, facing: 1, height: 300, headY: 415},
	arse: {x: 1555, from: 2150, facing: -1, height: 210, headY: 520},
	nandu: {x: 1822, from: 2350, facing: -1, height: 260, headY: 575},
};

/** Pyramid slots echoing the Estable triangle: three on the bottom row, two above. */
const ROW0_Y = GROUND - BLOCK.h / 2 - 4;
const ROW1_Y = ROW0_Y - BLOCK.h - 14;
const LOGO_Y = ROW1_Y - BLOCK.h - 14;
const step = BLOCK.w + 16;
const BLOCKS: Array<{label: string; by: MascotId; x: number; y: number; word: number; delay?: number}> = [
	{label: 'Real-time settlement', by: 'estable', x: 960 - step, y: ROW0_Y, word: 1},
	{label: 'Compliance-ready', by: 'nandu', x: 960, y: ROW0_Y, word: 2, delay: 0.25},
	{label: 'Fast to market', by: 'arse', x: 960 + step, y: ROW0_Y, word: 5},
	{label: 'Modular APIs', by: 'estable', x: 960 - step / 2, y: ROW1_Y, word: 7},
	{label: 'End-to-end', by: 'nandu', x: 960 + step / 2, y: ROW1_Y, word: 9},
];

export const S09WhyEstableScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [estLine, arseLine] = lines;

	const walk = interpolate(t, [0, WALK_IN], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const mascotX = (id: MascotId) => interpolate(walk, [0, 1], [CAST[id].from, CAST[id].x]);

	// Each block lands as Estable names it; tosses never start before the walk-in ends.
	const timed = BLOCKS.map((b) => {
		const cue = wordStart(estLine, b.word) + (b.delay ?? 0);
		const land = Math.max(cue, WALK_IN + TOSS);
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

	const renderBlock = (b: (typeof held)[number], i: number) => {
		if (t < b.holdFrom) return null;
		const c = CAST[b.by];
		const carry = {x: mascotX(b.by), y: c.headY - BLOCK.h * CARRY_SCALE * 0.5 - 6};
		if (t < b.toss) {
			const pop = b.holdFrom < 0 ? 1 : spring({frame: (t - b.holdFrom) * fps, fps, config: {damping: 12}});
			const bob = Math.sin(t * 7 + i) * 4;
			return (
				<ValueBlock key={b.label} x={carry.x} y={carry.y + bob} scale={CARRY_SCALE * pop}>
					{b.label}
				</ValueBlock>
			);
		}
		const p = interpolate(t, [b.toss, b.land], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
		const x = interpolate(p, [0, 1], [carry.x, b.x]);
		const y = interpolate(p, [0, 1], [carry.y, b.y]) - Math.sin(p * Math.PI) * 240;
		const squash = t >= b.land ? Math.sin(Math.min(1, (t - b.land) / 0.3) * Math.PI) * Math.exp(-(t - b.land) * 4) * 1.6 : 0;
		return (
			<ValueBlock key={b.label} x={x} y={y} scale={interpolate(p, [0, 1], [CARRY_SCALE, 1])} rotate={(1 - p) * -14 * c.facing} squash={squash}>
				{b.label}
			</ValueBlock>
		);
	};

	// Estable-logo capstone drops from the sky once the whole line is said.
	const logoP = interpolate(t, [LOGO_LAND - 0.4, LOGO_LAND], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const logoSquash = t >= LOGO_LAND ? Math.sin(Math.min(1, (t - LOGO_LAND) / 0.3) * Math.PI) * Math.exp(-(t - LOGO_LAND) * 4) * 1.8 : 0;
	const glow = interpolate(t, [LOGO_LAND, LOGO_LAND + 0.3, LOGO_LAND + 1.6], [0, 1, 0.35], clamp);

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.5} glowY={0.62}>
			<div style={{position: 'absolute', left: 960 - 300, top: LOGO_Y - 300, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(49,196,172,${0.45 * glow}) 0%, rgba(49,196,172,0) 65%)`}} />
			{held.map(renderBlock)}
			{t >= LOGO_LAND - 0.4 && (
				<ValueBlock x={960} y={interpolate(logoP, [0, 1], [-200, LOGO_Y])} w={210} fill={colors.teal} shade={colors.tealShade} squash={logoSquash}>
					<svg width={64} height={64} viewBox="-20 -20 1064 1064">
						<EstableLogoShape fill={colors.white} />
					</svg>
				</ValueBlock>
			)}
			{(['estable', 'arse', 'nandu'] as MascotId[]).map((id) => (
				<SceneActor key={id} id={id} pose={poseAt(id, beatsFor(id), lines, t)} x={mascotX(id)} groundY={GROUND} height={CAST[id].height} />
			))}
			<PopChip at={wordStart(arseLine, 1)} x={700} y={380} label="Fintechs" color={colors.arseBlue} size={34} />
			<PopChip at={wordStart(arseLine, 2)} x={960} y={330} label="Banks" color={colors.arseBlue} size={34} />
			<PopChip at={wordStart(arseLine, 4)} x={1220} y={380} label="PSPs" color={colors.arseBlue} size={34} />
			<Sfx name="footsteps-cartoon" at={0} volume={0.7} />
			{timed.map((b) => (
				<Sfx key={b.label} name="block-thud" at={b.land - 0.03} volume={0.9} />
			))}
			<Sfx name="block-thud" at={LOGO_LAND - 0.03} />
			<Sfx name="magic-swap" at={LOGO_LAND} volume={0.7} />
		</SceneFrame>
	);
};
