import React from 'react';
import {Easing, interpolate, random, spring, useVideoConfig} from 'remotion';
import {colors} from '../brand/brand-tokens';
import {Sfx} from '../audio/sound-effects';
import {SceneActor} from '../components/scene-actor';
import {poseAt, timeScene, wordStart} from '../storyboard/scene-timeline';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s01-hello');
const CENTER = {x: 960, y: 470};
const TRI = 230; // half-size of the assembling triangle outline
const PARTICLES = 36;
const ASSEMBLE_END = 1.9;
const POP_AT = 2.05;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Point `u` (0…1) along the perimeter of an upward triangle centred on CENTER. */
const trianglePoint = (u: number) => {
	const corners = [
		{x: CENTER.x, y: CENTER.y - TRI},
		{x: CENTER.x + TRI * 1.05, y: CENTER.y + TRI * 0.95},
		{x: CENTER.x - TRI * 1.05, y: CENTER.y + TRI * 0.95},
	];
	const seg = Math.floor(u * 3) % 3;
	const k = u * 3 - Math.floor(u * 3);
	const a = corners[seg];
	const b = corners[(seg + 1) % 3];
	return {x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k};
};

export const S01HelloScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);

	const gather = interpolate(t, [0.5, ASSEMBLE_END], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const outlineFade = interpolate(t, [POP_AT - 0.05, POP_AT + 0.25], [1, 0], clamp);
	const flash = interpolate(t, [POP_AT - 0.1, POP_AT, POP_AT + 0.35], [0, 0.9, 0], clamp);
	const pop = spring({frame: (t - POP_AT) * fps, fps, config: {damping: 9, stiffness: 140}});

	const particles = Array.from({length: PARTICLES}, (_, i) => {
		const from = {x: random(`p${i}x`) * 1920, y: random(`p${i}y`) * 1080};
		const to = trianglePoint(i / PARTICLES);
		// Each particle departs slightly later than the last so the outline "draws" itself.
		const g = interpolate(gather, [i / PARTICLES / 3, Math.min(1, i / PARTICLES / 3 + 0.7)], [0, 1], clamp);
		return {x: from.x + (to.x - from.x) * g, y: from.y + (to.y - from.y) * g, g};
	});

	const pose = poseAt(
		'estable',
		[
			{at: 0, action: 'idle'},
			// One celebratory hop on arrival (jump cycle is 1s).
			{at: POP_AT + 0.3, action: 'jump'},
			{at: POP_AT + 1.2, action: 'idle'},
			// Wave lands on "Hi" (4th word: "Psst, over here! Hi, ...").
			{at: wordStart(lines[0], 3) - 0.15, action: 'wave'},
			{at: lines[0].end + 0.2, action: 'idle'},
		],
		lines,
		t,
	);

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.5} glowY={0.45} backgroundReveal={1 - gather * 0.6}>
			<svg width={1920} height={1080} style={{position: 'absolute', opacity: outlineFade}}>
				{particles.map((p, i) => {
					const n = particles[(i + 1) % PARTICLES];
					return <line key={`l${i}`} x1={p.x} y1={p.y} x2={n.x} y2={n.y} stroke={colors.tealBright} strokeWidth={3} strokeOpacity={Math.min(p.g, n.g) ** 3} />;
				})}
				{particles.map((p, i) => (
					<circle key={i} cx={p.x} cy={p.y} r={5 + p.g * 3} fill={colors.tealBright} />
				))}
			</svg>
			<div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(49,196,172,${flash}) 0%, rgba(49,196,172,0) 45%)`}} />
			<Sfx name="whoosh-gather" at={0.45} />
			<Sfx name="pop-appear" at={POP_AT - 0.08} />
			<Sfx name="hop-boing" at={POP_AT + 0.48} volume={0.8} />
			{t >= POP_AT - 0.05 && <SceneActor id="estable" pose={pose} x={CENTER.x} groundY={CENTER.y + TRI + 150} height={440} scale={pop} />}
		</SceneFrame>
	);
};
