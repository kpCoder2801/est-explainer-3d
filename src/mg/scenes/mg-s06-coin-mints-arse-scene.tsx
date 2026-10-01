import React from 'react';
import {interpolate, random} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors, fontInter} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {KineticPhrase} from '../kit/kinetic-phrase';
import {MaskReveal} from '../kit/mask-reveal';
import {between, DUR, EASE_IN_OUT, EASE_OUT, enter, exit} from '../kit/mg-motion';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {MgActor} from '../mascots/mg-mascot';
import {ChainPill, MintCore} from './parts/mg-s06-mint-core';
import {ReservePanel} from './parts/mg-s06-reserve-panel';

const SCENE = sceneById('s06-coin');
const GROUND = 800;
const CORE = {x: 1180, y: 470};
const LAND = {x: 1480, y: GROUND};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const CHAINS = [
	{label: 'Ethereum', coin: 'ETH' as const, angle: 200, word: 4},
	{label: 'Polygon', coin: 'POL' as const, angle: 330, word: 5},
	{label: '+ more', angle: 85, word: 8},
];

/**
 * MG S06 — "Estable Coin mints ARSe". A mint core assembles from line-draws while chain
 * pills orbit it; on "Like this one!" it charges, bursts, and the ARSe coin logo flips
 * out, lands and morphs into the character, who then states its 1:1 peso backing over a
 * filling reserve chart.
 */
export const MgS06CoinMintsArseScene: React.FC = () => {
	const t = useSceneTime();
	const {lines, duration} = timeScene(SCENE);
	const [est, arse] = lines;

	const HEX = wordStart(est, 2) - 0.2;
	const FILL = wordStart(est, 3);
	const CHARGE = wordStart(est, 9);
	const MINT = wordStart(est, 10) + 0.05;
	const LANDED = MINT + 0.8;
	const MORPH = LANDED + 0.05;
	const EQ = wordStart(arse, 8);
	const RESERVES = wordStart(arse, 13);

	const rings = enter(t, 0.2, DUR.slow * 1.6);
	const hex = between(t, HEX, HEX + 0.7, 0, 1, EASE_OUT);
	const fill = enter(t, FILL, DUR.std);
	const charge = between(t, CHARGE, MINT, 0, 1, EASE_IN_OUT) * (1 - enter(t, MINT, DUR.quick));
	const burst = interpolate(t, [MINT, MINT + 0.7], [0, 1], clamp);
	const coreFade = 1 - enter(t, MINT + 0.35, DUR.slow);

	// ARSe coin: zooms out of the core with a double flip, arcs to its spot, then morphs.
	const fly = EASE_OUT(interpolate(t, [MINT, LANDED], [0, 1], clamp));
	const coinX = interpolate(fly, [0, 1], [CORE.x, LAND.x]);
	const coinY = interpolate(fly, [0, 1], [CORE.y + 130, LAND.y]) - Math.sin(fly * Math.PI) * 220;
	const flip = Math.cos(fly * Math.PI * 4);
	const morph = 1 - enter(t, MORPH, DUR.slow);

	// Camera: slow push-in plus a punch on the mint, with a seeded micro-shake.
	const punch = interpolate(t, [MINT, MINT + 0.08, MINT + 0.6], [0, 1, 0], clamp);
	const cam = 1 + between(t, 0, duration, 0, 0.04, (x) => x) + punch * 0.05;
	const shake = punch > 0.05 ? (random(`s06sh${Math.floor(t * 30)}`) - 0.5) * 14 * punch : 0;

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', look: 0.6},
			{at: FILL - 0.1, action: 'point', look: 1},
			{at: FILL + 1.2, action: 'idle', look: 0.7},
			{at: MINT, action: 'jump', look: 1},
			{at: MINT + 1, action: 'idle', look: 1},
			{at: EQ, action: 'celebrate', look: 1},
			{at: EQ + 1.2, action: 'idle', look: 0.8},
		],
		lines,
		t,
	);
	const arsePose = poseAt(
		'arse',
		[
			{at: 0, action: 'idle', facing: -1},
			{at: arse.start, action: 'wave', facing: -1, look: -0.4},
			{at: arse.start + 1.2, action: 'idle', facing: -1, look: -0.4},
			{at: RESERVES, action: 'point', facing: -1, look: -1},
			{at: RESERVES + 1.4, action: 'idle', facing: -1, look: -0.3},
		],
		lines,
		t,
	);

	const orbit = t * 14;
	const eqPart = (at: number, text: string, color: string) => (
		<MaskReveal at={at} dur={DUR.std}>
			<span style={{color, padding: '0 0.12em'}}>{text}</span>
		</MaskReveal>
	);

	return (
		<MgSceneFrame sceneId={SCENE.id} accent={colors.arseBlue} orbA={[0.6, 0.42]} orbB={[0.2, 0.75]}>
			<div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px) scale(${cam})`, transformOrigin: `${CORE.x}px ${CORE.y}px`}}>
				<MintCore cx={CORE.x} cy={CORE.y} rings={rings} hex={hex} fill={fill} charge={charge} burst={burst} spin={orbit * 1.5} fade={coreFade} />
				{CHAINS.map((c) => {
					const a = ((c.angle + orbit) * Math.PI) / 180;
					return (
						<ChainPill key={c.label} x={CORE.x + Math.cos(a) * 340} y={CORE.y + Math.sin(a) * 190} label={c.label} coin={c.coin} p={enter(t, wordStart(est, c.word), DUR.std) * coreFade} />
					);
				})}
				<KineticPhrase line={est} from={2} to={3} x={CORE.x} y={40} size={92} width={1000} accent={['coin']} exitAt={CHARGE - 0.15} />
				<KineticPhrase line={est} from={4} to={8} x={CORE.x} y={150} size={40} width={1000} weight={700} color={colors.tealLight} exitAt={CHARGE - 0.15} />
				{t >= MINT && (
					<div style={{position: 'absolute', inset: 0, transform: `scaleX(${t < LANDED ? Math.max(0.08, Math.abs(flip)) : 1})`, transformOrigin: `${coinX}px ${coinY}px`}}>
						<MgActor id="arse" pose={arsePose} x={coinX} groundY={coinY} height={260} scale={interpolate(fly, [0, 0.4, 1], [0.15, 1.15, 1], clamp)} morph={morph} />
					</div>
				)}
			</div>
			{/* Giant faint "ARSe" drifting behind the cast (parallax) while ARSe introduces itself. */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 250,
					textAlign: 'center',
					fontFamily: fontInter,
					fontWeight: 800,
					fontSize: 380,
					letterSpacing: '-0.04em',
					// Faint solid fill: Inter's overlapping contours show through a text stroke.
					color: colors.arseSky,
					opacity: 0.1 * enter(t, MORPH, DUR.slow) * exit(t, RESERVES - 0.2, DUR.std),
					transform: `translateX(${interpolate(t, [MORPH, duration], [80, -80], clamp)}px)`,
				}}
			>
				ARSe
			</div>
			<MgActor id="estable" pose={estable} x={330} groundY={GROUND} height={290} />
			{/* ARSe's self-intro, then the 1:1 equation and the reserve chart. */}
			<KineticPhrase line={arse} from={2} to={6} x={900} y={90} size={74} width={1500} accent={['arse', 'argentine', 'peso']} accentColor={colors.arseSky} exitAt={EQ - 0.25} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontFamily: fontInter, fontWeight: 800, fontSize: 132, letterSpacing: '-0.03em', color: colors.white, opacity: exit(t, arse.end + 0.3)}}>
				{eqPart(EQ, '1 ARSe', colors.white)}
				{eqPart(wordStart(arse, 9), '=', colors.tealBright)}
				{eqPart(wordStart(arse, 10), '1 ARS', colors.arseSky)}
			</div>
			<KineticPhrase line={arse} from={14} to={17} x={900} y={250} size={40} width={900} uppercase color={colors.arseSky} weight={800} />
			<ReservePanel x={900} y={320} appear={enter(t, RESERVES, DUR.std)} p={between(t, RESERVES, arse.end, 0, 1, (x) => x)} />
			<Sfx name="mg-tick" at={0.2} />
			<Sfx name="mg-whoosh" at={HEX} volume={0.6} />
			{CHAINS.map((c) => (
				<Sfx key={c.label} name="mg-pop" at={wordStart(est, c.word)} volume={0.6} />
			))}
			<Sfx name="mg-riser" at={MINT - 1.4} volume={0.8} />
			<Sfx name="mg-impact" at={MINT} />
			<Sfx name="mg-sparkle" at={MINT + 0.05} volume={0.8} />
			<Sfx name="mg-coin" at={LANDED - 0.05} />
			<Sfx name="mg-impact" at={EQ} volume={0.5} />
			<Sfx name="mg-data" at={RESERVES + 0.1} volume={0.7} />
			<Sfx name="mg-confirm" at={wordStart(arse, 17)} volume={0.8} />
		</MgSceneFrame>
	);
};
