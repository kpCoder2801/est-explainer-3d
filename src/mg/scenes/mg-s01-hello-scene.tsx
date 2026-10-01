import React from 'react';
import {interpolate} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {DrawPath} from '../kit/draw-path';
import {KineticPhrase} from '../kit/kinetic-phrase';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {between, DUR, EASE_IN_OUT, enter} from '../kit/mg-motion';
import {MgActor} from '../mascots/mg-mascot';

const SCENE = sceneById('s01-hello');
const H = 420; // Estable body height in px
const GROUND = 720;

/**
 * MG S01 — "Hello". A single point becomes a construction grid, the grid draws the
 * Estable triangle, the triangle fills into the logo, and the logo morphs into the
 * character, which slides aside for the kinetic "Hi, I'm Estable."
 */
export const MgS01HelloScene: React.FC = () => {
	const t = useSceneTime();
	const {lines} = timeScene(SCENE);
	const [line] = lines;
	const hiAt = wordStart(line, 3);

	const DOT = 0.2;
	const DRAW = 0.6;
	const FILL = 1.55;
	const MORPH = 2.0;

	// Estable glides left on "Hi", making room for the type.
	const cx = interpolate(between(t, hiAt - 0.35, hiAt + 0.25, 0, 1, EASE_IN_OUT), [0, 1], [960, 600]);
	const top = GROUND - H;
	const tri = `M ${cx} ${top} L ${cx + H / 2} ${GROUND} L ${cx - H / 2} ${GROUND} Z`;
	const fill = enter(t, FILL, DUR.std);
	const morph = 1 - enter(t, MORPH, DUR.slow);
	const guides = enter(t, DOT, DUR.slow) * (1 - enter(t, FILL + 0.1, DUR.std));
	const dotR = interpolate(t, [DOT, DOT + 0.2, DRAW, DRAW + 0.2], [0, 18, 18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const ring = enter(t, DOT + 0.1, DUR.slow);

	const pose = poseAt(
		'estable',
		[
			{at: 0, action: 'idle'},
			{at: MORPH + 0.3, action: 'jump'},
			{at: MORPH + 1.15, action: 'idle', look: -0.3},
			{at: hiAt - 0.1, action: 'wave', look: 0.6},
			{at: line.end + 0.2, action: 'idle', look: 0.5},
		],
		lines,
		t,
	);

	return (
		<MgSceneFrame sceneId={SCENE.id} orbA={[0.5, 0.45]} orbB={[0.8, 0.75]}>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{/* Construction guides: crosshair + measuring ring, like a designer's artboard. */}
				<g opacity={guides}>
					<line x1={960 - 900 * guides} y1={GROUND - H / 2} x2={960 + 900 * guides} y2={GROUND - H / 2} stroke={colors.tealBright} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 10" />
					<line x1={960} y1={GROUND - H / 2 - 480 * guides} x2={960} y2={GROUND - H / 2 + 480 * guides} stroke={colors.tealBright} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 10" />
					<circle cx={960} cy={GROUND - H / 2} r={300 * ring} fill="none" stroke={colors.tealBright} strokeOpacity={0.3} strokeWidth={2} />
					{[0, 1, 2].map((i) => {
						const a = (-90 + i * 120) * (Math.PI / 180);
						return <circle key={i} cx={960 + Math.cos(a) * 300 * ring} cy={GROUND - H / 2 + Math.sin(a) * 300 * ring} r={6} fill={colors.tealBright} />;
					})}
				</g>
				<circle cx={960} cy={GROUND - H / 2} r={dotR} fill={colors.tealBright} />
				{t < FILL + 0.3 && <DrawPath d={tri} progress={between(t, DRAW, FILL, 0, 1)} stroke={colors.tealBright} width={10} opacity={1 - fill} />}
			</svg>
			{t >= FILL && <MgActor id="estable" pose={pose} x={cx} groundY={GROUND} height={H} scale={interpolate(fill, [0, 1], [0.92, 1])} opacity={fill} morph={morph} />}
			<KineticPhrase line={line} from={0} to={2} x={960} y={130} size={64} weight={700} color={colors.tealLight} />
			<KineticPhrase line={line} from={3} to={5} x={940} y={400} size={170} width={900} align="left" accent={['estable.']} />
			<Sfx name="mg-tick" at={DOT} />
			<Sfx name="mg-riser" at={DRAW - 0.1} volume={0.7} />
			<Sfx name="mg-impact" at={FILL} />
			<Sfx name="mg-sparkle" at={MORPH} volume={0.7} />
			<Sfx name="mg-whoosh" at={hiAt - 0.35} volume={0.8} />
		</MgSceneFrame>
	);
};
