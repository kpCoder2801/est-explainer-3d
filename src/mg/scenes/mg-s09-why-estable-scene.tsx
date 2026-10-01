import React from 'react';
import {interpolate} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors, fontInter} from '../../brand/brand-tokens';
import {EstableLogoShape} from '../../mascots/estable-mascot';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {KineticPhrase} from '../kit/kinetic-phrase';
import {MaskReveal} from '../kit/mask-reveal';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {between, DUR, EASE_OUT, enter} from '../kit/mg-motion';
import {MgActor} from '../mascots/mg-mascot';
import {MgChip, TileKey, triangleTiles, ValueTile} from './parts/mg-s09-value-tiles';

const SCENE = sceneById('s09-why');
const CX = 700;
const TOP = 230;
const S = 620; // triangle width = height, like the logo
const LIST_X = 1090;
const GROUND = 860;

/** Value props in spoken order: tile, word span of Estable's line, colour. */
const PROPS: Array<{tile: TileKey; from: number; to: number; color: string}> = [
	{tile: 'left', from: 0, to: 1, color: colors.teal},
	{tile: 'right', from: 2, to: 2, color: colors.arseBlue},
	{tile: 'top', from: 3, to: 5, color: colors.nanduGold},
	{tile: 'center', from: 6, to: 11, color: colors.tealBright},
];

/**
 * MG S09 — "Why Estable". Four modular tiles fly in on their spoken value prop and lock
 * into the Estable triangle, which resolves into the logo; a numbered kinetic list mirrors
 * them. On ARSe's line the list hands over to three audience chips and the cast reacts.
 */
export const MgS09WhyEstableScene: React.FC = () => {
	const t = useSceneTime();
	const {lines, duration} = timeScene(SCENE);
	const [est, arse] = lines;
	const tiles = triangleTiles(CX, TOP, S);
	const LOCK = est.end - 0.15;
	const lock = enter(t, LOCK, DUR.std);
	const logo = enter(t, LOCK + 0.3, DUR.slow);
	const push = interpolate(between(t, 0, duration, 0, 1), [0, 1], [1, 1.04]);

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', look: 0.8, facing: 1},
			{at: wordStart(est, 0) - 0.1, action: 'point', look: 1, facing: 1},
			{at: wordStart(est, 3), action: 'idle', look: 0.8, facing: 1},
			{at: LOCK + 0.2, action: 'celebrate', facing: 1},
			{at: arse.start, action: 'idle', look: 0.6, facing: 1},
		],
		lines,
		t,
	);
	const ARRIVE = arse.start - 0.35;
	const arsePose = poseAt('arse', [{at: 0, action: 'idle', facing: -1, look: -0.5}, {at: arse.end + 0.1, action: 'celebrate', facing: -1}], lines, t);
	const nanduPose = poseAt('nandu', [{at: 0, action: 'idle', facing: -1}, {at: arse.end + 0.1, action: 'jump', facing: -1}], lines, t);

	return (
		<MgSceneFrame sceneId={SCENE.id} orbA={[0.36, 0.5]} orbB={[0.8, 0.35]}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 55%'}}>
				<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
					<g opacity={1 - logo}>
					{PROPS.map((p) => {
						const at = wordStart(est, p.from) - 0.05;
						return (
							<ValueTile
								key={p.tile}
								pts={tiles[p.tile]}
								tile={p.tile}
								p={enter(t, at, DUR.slow, EASE_OUT)}
								gap={1 - lock}
								icon={between(t, at + 0.25, at + 0.8)}
								fill={p.color}
								lockFill={lock}
							/>
						);
					})}
					</g>
					{/* Locked tiles resolve into the real mark, with a bright sweep ring. */}
					<g opacity={logo} transform={`translate(${CX - S / 2} ${TOP}) scale(${S / 1024})`}>
						<EstableLogoShape fill={colors.white} />
					</g>
					{lock > 0 && lock < 1 && <circle cx={CX} cy={TOP + S * 0.62} r={S * 0.4 + lock * 420} fill="none" stroke={colors.tealBright} strokeWidth={10 * (1 - lock)} opacity={1 - lock} />}
				</svg>

				{/* Numbered kinetic list mirroring the tiles; hands over to the chips on ARSe's line. */}
				{PROPS.map((p, i) => {
					const at = wordStart(est, p.from) - 0.05;
					const y = 270 + i * 104;
					const bar = enter(t, at, DUR.std);
					const out = 1 - enter(t, arse.start - 0.3, DUR.quick);
					return (
						<React.Fragment key={p.tile}>
							<div style={{position: 'absolute', left: LIST_X, top: y + 14, width: 12, height: 52 * bar, borderRadius: 6, background: p.color, opacity: out}} />
							<div style={{position: 'absolute', left: LIST_X + 32, top: y + 4, fontFamily: fontInter, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: p.color, opacity: out}}>
								<MaskReveal at={at}>{`0${i + 1}`}</MaskReveal>
							</div>
							<KineticPhrase line={est} from={p.from} to={p.to} x={LIST_X + 80} y={y} size={42} width={740} align="left" exitAt={arse.start - 0.3} />
						</React.Fragment>
					);
				})}

				{[
					{label: 'Fintechs', w: 1},
					{label: 'Banks', w: 2},
					{label: 'PSPs', w: 4},
				].map((c, i) => (
					<MgChip key={c.label} label={c.label} x={LIST_X + 40 + i * 70} y={250 + i * 125} p={enter(t, wordStart(arse, c.w) - 0.05, DUR.std)} />
				))}

				<MgActor id="estable" pose={estable} x={250} groundY={GROUND} height={210} />
				<MgActor id="arse" pose={arsePose} x={1560} groundY={GROUND} height={150} scale={enter(t, ARRIVE, DUR.std)} opacity={enter(t, ARRIVE, DUR.quick)} />
				<MgActor id="nandu" pose={nanduPose} x={1790} groundY={GROUND} height={170} morph={between(t, ARRIVE + 0.1, ARRIVE + 0.7, 0, 1, EASE_OUT)} />
			</div>

			{PROPS.map((p, i) => (
				<React.Fragment key={p.tile}>
					<Sfx name={i === 3 ? 'mg-impact' : 'mg-whoosh'} at={wordStart(est, p.from) - 0.12} volume={0.7} />
					<Sfx name="mg-tick" at={wordStart(est, p.from) + 0.3} volume={0.6} />
				</React.Fragment>
			))}
			<Sfx name="mg-bass-drop" at={LOCK} volume={0.8} />
			<Sfx name="mg-sparkle" at={LOCK + 0.3} volume={0.6} />
			<Sfx name="mg-sparkle" at={ARRIVE + 0.1} volume={0.5} />
			{[1, 2, 4].map((w) => (
				<Sfx key={w} name="mg-pop" at={wordStart(arse, w) - 0.05} volume={0.7} />
			))}
		</MgSceneFrame>
	);
};
