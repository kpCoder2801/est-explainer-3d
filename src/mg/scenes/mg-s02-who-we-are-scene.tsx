import React from 'react';
import {interpolate} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors, fontInter} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {DrawPath} from '../kit/draw-path';
import {KineticPhrase} from '../kit/kinetic-phrase';
import {MaskReveal} from '../kit/mask-reveal';
import {between, DUR, EASE_IN_OUT, enter, exit, STAGGER} from '../kit/mg-motion';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {MgActor} from '../mascots/mg-mascot';
import {RAILS, RailTrack} from './parts/mg-s02-rails';

const SCENE = sceneById('s02-who');
const GLOBE = {x: 1250, y: 430, r: 230};
const PING = {x: 1170, y: 488}; // El Salvador-ish on the line globe
const GROUND = 770;

/** Line-drawn globe: outline, meridians and latitudes draw on in a stagger. */
const LineGlobe: React.FC<{t: number; at: number}> = ({t, at}) => {
	const {x, y, r} = GLOBE;
	const parts = [
		`M ${x} ${y - r} A ${r} ${r} 0 1 1 ${x - 0.01} ${y - r}`,
		`M ${x} ${y - r} A ${r * 0.45} ${r} 0 1 1 ${x - 0.01} ${y - r}`,
		`M ${x} ${y - r} A ${r * 0.8} ${r} 0 1 0 ${x + 0.01} ${y - r}`,
		`M ${x - r} ${y} L ${x + r} ${y}`,
		`M ${x - r * 0.87} ${y - r * 0.5} L ${x + r * 0.87} ${y - r * 0.5}`,
		`M ${x - r * 0.87} ${y + r * 0.5} L ${x + r * 0.87} ${y + r * 0.5}`,
	];
	return (
		<g>
			<circle cx={x} cy={y} r={r} fill={colors.tealDark} opacity={0.55 * enter(t, at, DUR.slow)} />
			{parts.map((d, i) => (
				<DrawPath key={i} d={d} progress={between(t, at + i * STAGGER * 2, at + i * STAGGER * 2 + 0.9)} stroke={i === 0 ? colors.tealBright : colors.teal} width={i === 0 ? 5 : 3} opacity={i === 0 ? 1 : 0.7} />
			))}
		</g>
	);
};

/**
 * MG S02 — "Who we are". Estable hosts beside a line-drawn globe; kinetic facts stack
 * in on the spoken words, a location ping lands on "El Salvador", then the camera
 * pulls back as rails shoot across the frame on "We build the rails for digital money".
 */
export const MgS02WhoWeAreScene: React.FC = () => {
	const t = useSceneTime();
	const {lines} = timeScene(SCENE);
	const [line] = lines;
	const w = (i: number) => wordStart(line, i);

	const elSalvador = w(6);
	const founded = w(8);
	const railsAt = w(16);
	const factsOut = railsAt - 0.3;

	// Camera: gentle push-in during the facts, then a pull-back reveal for the rails.
	const push = between(t, 0, factsOut, 1, 1.05, EASE_IN_OUT);
	const pull = between(t, factsOut, railsAt + 0.6, 0, 1, EASE_IN_OUT);
	const camScale = push - pull * 0.12;
	const camY = pull * -40;
	const globeOut = 1 - between(t, factsOut, railsAt + 0.4, 0, 0.75, EASE_IN_OUT);
	const pingP = enter(t, elSalvador, DUR.std);
	const pulse = (t - elSalvador) % 1.1;

	const pose = poseAt(
		'estable',
		[
			{at: 0, action: 'walk', facing: 1},
			{at: 0.7, action: 'idle', look: 0.6},
			{at: elSalvador - 0.1, action: 'point', look: 1},
			{at: elSalvador + 1, action: 'idle', look: 0.5},
			{at: railsAt + 0.1, action: 'celebrate'},
		],
		lines,
		t,
	);
	const estX = interpolate(enter(t, 0, 0.8), [0, 1], [-200, 360]);

	return (
		<MgSceneFrame sceneId={SCENE.id} orbA={[0.62, 0.4]} orbB={[0.2, 0.75]}>
			<div style={{position: 'absolute', inset: 0, transform: `translateY(${camY}px) scale(${camScale})`, transformOrigin: '50% 45%'}}>
				<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
					<g opacity={globeOut} transform={`translate(${GLOBE.x} ${GLOBE.y}) scale(${0.6 + globeOut * 0.4}) translate(${-GLOBE.x} ${-GLOBE.y})`}>
						<LineGlobe t={t} at={0.15} />
						{pingP > 0 && (
							<g>
								{[0, 0.37, 0.74].map((o) => {
									const k = ((pulse + o) % 1.1) / 1.1;
									return <circle key={o} cx={PING.x} cy={PING.y} r={14 + k * 70} fill="none" stroke={colors.tealBright} strokeWidth={3} opacity={(1 - k) * pingP} />;
								})}
								<circle cx={PING.x} cy={PING.y} r={14 * pingP} fill={colors.tealBright} />
								<circle cx={PING.x} cy={PING.y} r={5 * pingP} fill={colors.white} />
								<DrawPath d={`M ${PING.x} ${PING.y} L ${PING.x + 120} ${PING.y - 110} L ${PING.x + 300} ${PING.y - 110}`} progress={between(t, elSalvador + 0.05, elSalvador + 0.45)} stroke={colors.tealBright} width={3} />
							</g>
						)}
					</g>
					{RAILS.map((r, i) => (
						<RailTrack key={r.y} rail={r} t={t} at={railsAt + i * STAGGER * 1.5} />
					))}
				</svg>
				{pingP > 0 && globeOut > 0.3 && (
					<div style={{position: 'absolute', left: PING.x + 128, top: PING.y - 176, fontFamily: fontInter, fontWeight: 800, fontSize: 46, letterSpacing: '0.04em', color: colors.white, opacity: globeOut}}>
						<MaskReveal at={elSalvador + 0.15} exitAt={factsOut}>
							EL SALVADOR
						</MaskReveal>
						<div style={{fontSize: 18, letterSpacing: '0.3em', color: colors.tealBright, fontWeight: 700}}>
							<MaskReveal at={elSalvador + 0.3} exitAt={factsOut}>
								HEADQUARTERS
							</MaskReveal>
						</div>
					</div>
				)}
				{/* Fact stack, top-left, swapped on "founded". */}
				<KineticPhrase line={line} from={1} to={4} x={110} y={110} size={84} width={900} align="left" accent={['portfolio']} exitAt={founded - 0.25} />
				<KineticPhrase line={line} from={8} to={11} x={110} y={110} size={64} width={900} align="left" color={colors.tealLight} weight={700} exitAt={factsOut} />
				<KineticPhrase line={line} from={12} to={15} x={110} y={190} size={84} width={900} align="left" accent={['bitfinex']} exitAt={factsOut} />
				<KineticPhrase line={line} from={16} to={22} x={960} y={120} size={104} width={1500} accent={['rails', 'money.']} />
			</div>
			<MgActor id="estable" pose={pose} x={estX} groundY={GROUND} height={300} />
			<Sfx name="mg-whoosh" at={0} volume={0.6} />
			<Sfx name="mg-type" at={0.25} volume={0.5} />
			<Sfx name="mg-pop" at={elSalvador} />
			<Sfx name="mg-tick" at={founded} volume={0.7} />
			<Sfx name="mg-whoosh" at={railsAt - 0.15} />
			<Sfx name="mg-data" at={railsAt + 0.3} volume={0.7} />
		</MgSceneFrame>
	);
};
