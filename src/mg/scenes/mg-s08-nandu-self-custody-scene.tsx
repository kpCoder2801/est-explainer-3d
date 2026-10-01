import React from 'react';
import {Easing, interpolate} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors, fontInter} from '../../brand/brand-tokens';
import {CoinIcon} from '../../components/coin-icon';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {KineticPhrase} from '../kit/kinetic-phrase';
import {DUR, enter, exit} from '../kit/mg-motion';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {MgActor} from '../mascots/mg-mascot';
import {PHONE_H, PHONE_W, PixelBurst, PixelPhone, PixelTrail, stepped} from './parts/mg-s08-pixel-props';

const SCENE = sceneById('s08-nandu');
const GROUND = 790;
const NANDU_X = 560;
const NANDU_H = 340;
const PHONE_LEFT = 1300;
const PHONE_TOP = GROUND - PHONE_H;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** The three payoff stamps: lead word + keyword, coloured per brand member. */
const STAMPS = [
	{word: 15, key: 'CRYPTO.', color: colors.tealBright},
	{word: 17, key: 'WALLET.', color: colors.arseSky},
	{word: 19, key: 'CONTROL.', color: colors.nanduGold},
];

/**
 * MG S08 — Nandu. Pixels are the motif: Nandu assembles from scattered squares as it
 * sprints in with a pixel trail, a pixel phone builds and locks a key, then the
 * "Your crypto. Your wallet. Your control." payoff stamps in on 10fps steps.
 */
export const MgS08NanduSelfCustodyScene: React.FC = () => {
	const t = useSceneTime();
	const {lines} = timeScene(SCENE);
	const [line] = lines;
	const w = (i: number) => wordStart(line, i);

	const PHASE2 = w(9) - 0.2;
	const PHASE3 = w(15) - 0.25;
	const KEY_AT = w(10);
	const LOCK_AT = w(14);
	// Phone holds the lock until "crypto", clearing before the second stamp line needs the space.
	const PHONE_OUT = w(16);

	// Sprint in from the right on stepped time, assembling as it comes.
	const runX = (time: number) => interpolate(stepped(time), [0, 1.1], [2150, NANDU_X], {...clamp, easing: Easing.out(Easing.quad)});
	// Pixels lock together over the whole sprint, finishing as it skids to a stop.
	const assemble = enter(t, 0.05, 1.05, Easing.out(Easing.quad));

	const pose = poseAt(
		'nandu',
		[
			{at: 0, action: 'walk', facing: -1},
			{at: 1.15, action: 'idle', facing: -1, look: 0},
			{at: PHASE2, action: 'idle', facing: 1, look: 1},
			{at: KEY_AT, action: 'point', facing: 1, look: 1},
			{at: LOCK_AT + 0.4, action: 'idle', facing: 1, look: 0.6},
			{at: line.end + 0.1, action: 'celebrate', facing: 1},
		],
		lines,
		t,
	);
	const running = t < 1.15 ? {...pose, actionTime: pose.actionTime * 1.8} : pose;

	// Camera kick on each stamp: a quick punch-in that settles.
	const kick = STAMPS.reduce((s, st) => {
		const k = t - w(st.word);
		return s + (k >= 0 && k < 0.35 ? 0.03 * (1 - k / 0.35) : 0);
	}, 0);
	const polIn = enter(t, w(8) - 0.12, DUR.std) * exit(t, PHASE2);

	return (
		<MgSceneFrame sceneId={SCENE.id} accent={colors.nanduGold} orbA={[0.3, 0.55]} orbB={[0.75, 0.4]}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${1 + kick})`, transformOrigin: '50% 45%'}}>
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					<PixelTrail t={t} xAt={runX} groundY={GROUND} until={1.05} />
					<PixelPhone left={PHONE_LEFT} top={PHONE_TOP} t={t} buildAt={stepped(PHASE2 + 0.1)} keyAt={stepped(KEY_AT)} lockAt={stepped(LOCK_AT)} exitAt={stepped(PHONE_OUT)} />
					<PixelBurst cx={PHONE_LEFT + PHONE_W / 2} cy={PHONE_TOP + PHONE_H * 0.4} t={t} at={stepped(LOCK_AT)} color={colors.tealBright} reach={260} />
					{STAMPS.map((s, i) => (
						<PixelBurst key={s.key} cx={1300} cy={262 + i * 150} t={t} at={stepped(w(s.word))} color={s.color} reach={320} />
					))}
				</svg>

				<MgActor id="nandu" pose={running} x={runX(t)} groundY={GROUND} height={NANDU_H} morph={assemble} />

				{/* Phase 1 — introduction */}
				<KineticPhrase line={line} from={0} to={1} x={1300} y={110} size={64} weight={700} color={colors.tealLight} exitAt={w(4) - 0.1} />
				<KineticPhrase line={line} from={2} to={3} x={880} y={250} size={170} width={1000} align="left" accent={['nandu,']} accentColor={colors.nanduGold} exitAt={PHASE2} />
				<KineticPhrase line={line} from={4} to={6} x={880} y={450} size={72} width={1040} align="left" uppercase accent={['self-custody']} accentColor={colors.nanduGold} exitAt={PHASE2} />
				<div style={{position: 'absolute', left: 880, top: 568, transform: `scale(${polIn})`, transformOrigin: '50% 50%', opacity: polIn}}>
					<CoinIcon symbol="POL" size={62} />
				</div>
				<KineticPhrase line={line} from={7} to={8} x={962} y={562} size={64} width={800} align="left" uppercase color={colors.tealLight} exitAt={PHASE2} />

				{/* Phase 2 — keys on your device */}
				<KineticPhrase line={line} from={9} to={14} x={1100} y={140} size={78} width={1560} uppercase accent={['keys', 'device.']} accentColor={colors.nanduGold} exitAt={PHASE3} />

				{/* Phase 3 — the payoff, stamped on steps */}
				{STAMPS.map((s, i) => {
					const k = stepped(t) - w(s.word);
					if (k < 0) return null;
					const scale = k < 0.1 ? 1.5 : k < 0.2 ? 1.12 : 1;
					return (
						<div
							key={s.key}
							style={{
								position: 'absolute',
								left: 1300 - 600,
								top: 200 + i * 150,
								width: 1200,
								textAlign: 'center',
								fontFamily: fontInter,
								fontWeight: 800,
								fontSize: 126,
								lineHeight: 1,
								letterSpacing: '-0.03em',
								color: colors.white,
								transform: `scale(${scale})`,
							}}
						>
							YOUR <span style={{color: s.color}}>{s.key}</span>
						</div>
					);
				})}
			</div>

			<Sfx name="pixel-run" at={0} />
			<Sfx name="pixel-skid" at={1.0} />
			<Sfx name="mg-pop" at={w(3) - 0.05} />
			<Sfx name="mg-type" at={w(5) - 0.05} volume={0.5} />
			<Sfx name="mg-pop" at={w(8) - 0.12} volume={0.8} />
			<Sfx name="mg-data" at={PHASE2 + 0.1} volume={0.7} />
			<Sfx name="pixel-drop" at={KEY_AT} />
			<Sfx name="mg-confirm" at={LOCK_AT} />
			<Sfx name="mg-glitch" at={PHONE_OUT} volume={0.6} />
			{STAMPS.map((s) => (
				<React.Fragment key={s.key}>
					<Sfx name="text-stamp" at={w(s.word)} />
					<Sfx name="mg-impact" at={w(s.word)} volume={0.5} />
				</React.Fragment>
			))}
			<Sfx name="mg-sparkle" at={line.end + 0.1} volume={0.7} />
		</MgSceneFrame>
	);
};
