import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {Beat, poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToyChip} from '../kit/toy-props';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import type {V3} from '../kit/toy-stage';
import {ToyMascot} from '../mascots/toy-mascot';
import {rollerLocalY, ToyGiantPhone, ToyRollerHead} from './parts/toy-s05-giant-phone-and-paint-roller';
import {drawWalletScreen, WALLET_THEMES} from './parts/toy-s05-wallet-screen-canvas';

const SCENE = sceneById('s05-wallet');
const PASS_SECONDS = 0.8;
const PHONE_AT: V3 = [1.35, 0, 0];
/** Turned a little toward Estable so the screen and the roller read in 3/4 view. */
const PHONE_YAW = -0.3;
const ESTABLE_AT: V3 = [-2.15, 0, 0.35];
const ESTABLE_H = 2;
const ESTABLE_YAW = 0.5;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

/** S05 — Estable Wallet: Estable paint-rolls a giant phone and the wallet re-skins through three partner brands. */
export const ToyS05EstableWalletScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	// Paint passes land on "branded"(7), "No"(10), "We"(14); the reveal chip on "put"(18), logo pop on "name"(20).
	const PASSES = [7, 10, 14].map((w) => wordStart(line, w) - 0.1);
	const PUT = wordStart(line, 18);
	const NAME = wordStart(line, 20);

	const done = PASSES.filter((p) => t >= p + PASS_SECONDS).length;
	const active = PASSES.findIndex((p) => t >= p - 0.2 && t < p + PASS_SECONDS + 0.12);
	const rolling = active >= 0 && t >= PASSES[active] && t < PASSES[active] + PASS_SECONDS;
	const base = WALLET_THEMES[done];
	const next = rolling ? WALLET_THEMES[active + 1] : null;
	const pass = active >= 0 ? interpolate(t, [PASSES[active], PASSES[active] + PASS_SECONDS], [-0.04, 0.96], {...clamp, easing: Easing.inOut(Easing.quad)}) : 0;
	const reveal = Math.min(1, Math.max(0, pass + 0.04));
	const logoPop = done === WALLET_THEMES.length - 1 ? 1 + 0.35 * Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - NAME) / 0.45)) * Math.PI)) : 1;
	// The roller lifts away from the glass as it is brought in and taken off.
	const rollerIn = active >= 0 ? interpolate(t, [PASSES[active] - 0.2, PASSES[active], PASSES[active] + PASS_SECONDS, PASSES[active] + PASS_SECONDS + 0.12], [0, 1, 1, 0], clamp) : 0;

	const rise = spring({frame: (t - 0.1) * fps, fps, config: {damping: 12, stiffness: 110}});
	const chip = (at: number) => spring({frame: (t - at) * fps, fps, config: {damping: 10, stiffness: 170}});

	const beats: Beat[] = [
		{at: 0, action: 'idle', facing: 1, look: 0.8},
		...PASSES.flatMap((p): Beat[] => [
			{at: p - 0.3, action: 'point', facing: 1, look: 1},
			{at: p + PASS_SECONDS + 0.1, action: 'idle', facing: 1, look: 0.6},
		]),
		{at: PUT - 0.1, action: 'celebrate', facing: 1, look: 0.4},
		{at: PUT + 1.4, action: 'idle', facing: 1, look: 0.4},
	];
	const pose = poseAt('estable', [...beats].sort((a, b) => a.at - b.at), lines, t);

	// The roller paints the screen on its own while Estable points it along, like a magic brush.
	const rollerY = rollerLocalY(pass);

	// Wide reveal → slow orbit/push toward the phone over the three passes → pull back for the hand-off.
	const keys = [0, PASSES[0], PASSES[2] + PASS_SECONDS, PUT + 0.6];
	const camX = interpolate(t, keys, [-1.8, -0.6, 1.3, 0], {...clamp, easing: ease});
	const camZ = interpolate(t, keys, [12.6, 11.4, 10.9, 11.8], {...clamp, easing: ease});
	const camera = {
		position: [camX, 2.7, camZ] as V3,
		target: [interpolate(t, keys, [-0.2, -0.1, 0.3, -0.25], {...clamp, easing: ease}), 1.72, 0] as V3,
	};

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			glowX={0.4}
			overlay={
				<>
					<Sfx name="phone-ping" at={0.35} volume={0.7} />
					{PASSES.map((p) => (
						<React.Fragment key={p}>
							<Sfx name="paint-roller" at={p} volume={0.8} />
							<Sfx name="magic-swap" at={p + PASS_SECONDS - 0.15} volume={0.6} />
						</React.Fragment>
					))}
					<Sfx name="chip-pop" at={PUT} volume={0.7} />
				</>
			}
		>
			<group position={[PHONE_AT[0], PHONE_AT[1] - (1 - rise) * 6, PHONE_AT[2]]} rotation={[0, PHONE_YAW, 0]}>
				<ToyGiantPhone
					draw={drawWalletScreen(base, next, reveal, logoPop)}
					drawKey={`${done}-${next ? active : 'x'}-${Math.round(reveal * 240)}-${logoPop.toFixed(2)}`}
				/>
				{rollerIn > 0 && <ToyRollerHead y={rollerY} scale={rollerIn} color={WALLET_THEMES[active + 1].primary} spin={-pass * 18} />}
			</group>
			<group position={ESTABLE_AT}>
				<ToyMascot id="estable" pose={pose} height={ESTABLE_H} yaw={ESTABLE_YAW} />
				<ToyChip label="Estable Wallet" height={0.42} position={[0, 3.05, 0]} scale={Math.max(0.001, chip(0.3))} />
				<ToyChip label="Your brand · ready to deploy" color={colors.tealBright} textColor={colors.ink} height={0.4} position={[0.35, 3.62, 0]} scale={Math.max(0.001, chip(PUT))} />
			</group>
		</ToySceneFrame>
	);
};
