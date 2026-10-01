import React from 'react';
import {interpolate, random, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors, fontInter} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {DrawPath} from '../kit/draw-path';
import {KineticPhrase} from '../kit/kinetic-phrase';
import {MaskReveal} from '../kit/mask-reveal';
import {between, EASE_IN_OUT, EASE_OUT} from '../kit/mg-motion';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {MgActor} from '../mascots/mg-mascot';
import {NetworkNode, NODES, tanglePath} from './parts/mg-s03-network';

const SCENE = sceneById('s03-problem');
const RED = '#ff5a5f';
const PAIRS: Array<[number, number]> = [
	[0, 1],
	[1, 2],
	[2, 0],
];

/** Glitchy kinetic word: RGB-split jitter for its first beats, then flickers while chaos lasts. */
const GlitchWord: React.FC<{text: string; at: number; exitAt: number; x: number; y: number; t: number; rotate: number}> = ({text, at, exitAt, x, y, t, rotate}) => {
	const age = t - at;
	const tick = Math.floor(t * 24);
	const burst = age >= 0 && (age < 0.3 || random(`${text}${tick}`) > 0.86);
	const dx = burst ? (random(`${text}dx${tick}`) - 0.5) * 22 : 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				fontFamily: fontInter,
				fontWeight: 800,
				fontSize: 92,
				letterSpacing: '-0.02em',
				color: RED,
				transform: `translateX(${dx}px) rotate(${rotate}deg)`,
				textShadow: burst ? `${dx * 0.5 + 5}px 0 #00ffd5, ${-dx * 0.5 - 5}px 0 #ff2d55` : 'none',
			}}
		>
			<MaskReveal at={at - 0.04} exitAt={exitAt} dur={0.2}>
				{text}
			</MaskReveal>
		</div>
	);
};

/**
 * MG S03 — "The tangle". Three line-drawn nodes get wired by knotted, jittering red
 * cables while COMPLEX / FRAGMENTED / SLOW glitch in on the words. On "Let's fix that."
 * Estable pops in and everything snaps into a clean teal triangle with data flowing.
 */
export const MgS03PaymentTangleScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;
	const w = (i: number) => wordStart(line, i);

	const introOut = w(9) - 0.1;
	const chaosAt = w(10);
	const lets = w(14);
	const snap = w(16);

	const tangleDraw = between(t, 0.5, 1.8, 0, 1, EASE_OUT);
	const chaos = between(t, chaosAt - 0.3, chaosAt + 0.3) * (1 - between(t, snap - 0.1, snap + 0.1));
	const tangleOpacity = 1 - between(t, snap - 0.05, snap + 0.15);
	const clean = between(t, snap, snap + 0.4, 0, 1, EASE_OUT);
	const flash = interpolate(t, [snap, snap + 0.05, snap + 0.5], [0, 0.22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const flick = chaos > 0.2 && random(`fl${Math.floor(t * 14)}`) > 0.45;
	const tangleColor = chaos > 0.2 ? (flick ? RED : '#8a4448') : '#5d6b6b';
	const pop = spring({frame: (t - lets) * fps, fps, config: {damping: 11, stiffness: 170}});
	// Camera: slow push into the mess, then settle back as it resolves.
	const cam = between(t, 0, snap, 1, 1.07, EASE_IN_OUT) - between(t, snap, snap + 0.6, 0, 0.07, EASE_IN_OUT);

	const pose = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', look: 1},
			{at: w(15) - 0.1, action: 'point', look: 1},
			{at: snap + 0.2, action: 'celebrate'},
		],
		lines,
		t,
	);

	return (
		<MgSceneFrame sceneId={SCENE.id} accent={chaos > 0.2 ? RED : colors.arseBlue} orbA={[0.52, 0.45]}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${cam})`, transformOrigin: '52% 48%'}}>
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					<g opacity={tangleOpacity}>
						{PAIRS.map(([a, b], i) => (
							<DrawPath key={i} d={tanglePath(NODES[a], NODES[b], `tg${i}`, t, chaos)} progress={tangleDraw} stroke={tangleColor} width={6} />
						))}
						<DrawPath d={tanglePath({x: 760, y: 420}, {x: 1200, y: 560}, 'knot', t, chaos)} progress={tangleDraw} stroke={tangleColor} width={6} />
					</g>
					{PAIRS.map(([a, b], i) => (
						<g key={`c${i}`}>
							<DrawPath d={`M ${NODES[a].x} ${NODES[a].y} L ${NODES[b].x} ${NODES[b].y}`} progress={clean} stroke={colors.tealBright} width={7} />
							{clean >= 1 &&
								[0, 0.5].map((o) => {
									const u = ((t - snap - 0.4) * 0.8 + o + i * 0.2) % 1;
									return <circle key={o} cx={NODES[a].x + (NODES[b].x - NODES[a].x) * u} cy={NODES[a].y + (NODES[b].y - NODES[a].y) * u} r={10} fill={colors.white} />;
								})}
						</g>
					))}
					{NODES.map((n, i) => (
						<NetworkNode key={n.key} node={n} t={t} at={0.15 + i * 0.12} glow={clean} shake={chaos * 10} />
					))}
				</svg>
				<KineticPhrase line={line} from={0} to={2} x={960} y={60} size={78} accent={['evolving,']} exitAt={introOut} />
				<KineticPhrase line={line} from={3} to={8} x={960} y={160} size={46} weight={700} color={colors.tealLight} exitAt={introOut} />
				<GlitchWord text="COMPLEX" at={w(10)} exitAt={lets - 0.4} x={140} y={130} t={t} rotate={-4} />
				<GlitchWord text="FRAGMENTED" at={w(11)} exitAt={lets - 0.4} x={1140} y={110} t={t} rotate={3} />
				<GlitchWord text="SLOW" at={w(13)} exitAt={lets - 0.4} x={1340} y={560} t={t} rotate={-3} />
				<KineticPhrase line={line} from={14} to={16} x={960} y={90} size={112} accent={['fix']} />
			</div>
			<div style={{position: 'absolute', inset: 0, background: colors.tealBright, opacity: flash, mixBlendMode: 'screen'}} />
			{t >= lets - 0.05 && <MgActor id="estable" pose={pose} x={330} groundY={830} height={300} scale={pop} />}
			<Sfx name="mg-tick" at={0.15} volume={0.6} />
			<Sfx name="mg-type" at={0.5} volume={0.4} />
			<Sfx name="mg-glitch" at={w(10)} />
			<Sfx name="mg-glitch" at={w(11)} />
			<Sfx name="mg-glitch" at={w(13)} />
			<Sfx name="mg-pop" at={lets} />
			<Sfx name="mg-impact" at={snap} />
			<Sfx name="mg-confirm" at={snap + 0.35} volume={0.7} />
		</MgSceneFrame>
	);
};
