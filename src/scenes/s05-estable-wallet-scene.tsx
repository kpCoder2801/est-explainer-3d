import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../audio/sound-effects';
import {colors} from '../brand/brand-tokens';
import {PopChip} from '../components/pop-chip';
import {SceneActor} from '../components/scene-actor';
import {Phone} from '../props/scene-props';
import {Beat, poseAt, timeScene, wordStart} from '../storyboard/scene-timeline';
import {SCREEN, WALLET_THEMES, WalletCoinIcons, WalletScreen} from './parts/s05-wallet-screen';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s05-wallet');
const GROUND = 850;
const PHONE = {x: 1100, y: 120, w: 400, h: 720};
const BEZEL = PHONE.w * 0.06; // matches scene-props Phone
const SCREEN_X = PHONE.x + BEZEL;
const SCREEN_Y = PHONE.y + BEZEL * 1.6;
const PASS_SECONDS = 0.8;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Paint roller across the screen at screen-local height `y`, handle reaching back toward Estable. */
const PaintRoller: React.FC<{y: number; color: string}> = ({y, color}) => {
	const gy = SCREEN_Y + y;
	const left = SCREEN_X - 34;
	const right = SCREEN_X + SCREEN.w + 34;
	return (
		<g>
			<path d={`M ${left + 10} ${gy} L ${left - 40} ${gy + 20} L ${left - 70} ${gy + 70}`} stroke={colors.outline} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<path d={`M ${left + 10} ${gy} L ${left - 40} ${gy + 20} L ${left - 70} ${gy + 70}`} stroke={colors.tealLight} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<rect x={left - 96} y={gy + 64} width={52} height={70} rx={18} fill={colors.teal} stroke={colors.outline} strokeWidth={8} transform={`rotate(-30 ${left - 70} ${gy + 99})`} />
			<rect x={left} y={gy - 26} width={right - left} height={52} rx={26} fill={color} stroke={colors.outline} strokeWidth={8} />
			<path d={`M ${left + 24} ${gy - 10} L ${right - 60} ${gy - 10}`} stroke={colors.white} strokeOpacity={0.55} strokeWidth={7} strokeLinecap="round" />
		</g>
	);
};

/** S05 — Estable Wallet: the white-label wallet re-skins through partner brands under a paint roller. */
export const S05EstableWalletScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	// Paint passes land on "branded"(7), "No"(10), "We"(14); the reveal chip on "put"(18), logo pop on "name"(20).
	const PASSES = [7, 10, 14].map((w) => wordStart(line, w) - 0.1);
	const PUT = wordStart(line, 18);
	const NAME = wordStart(line, 20);

	const done = PASSES.filter((p) => t >= p + PASS_SECONDS).length;
	const active = PASSES.findIndex((p) => t >= p && t < p + PASS_SECONDS);
	const base = WALLET_THEMES[done];
	const next = active >= 0 ? WALLET_THEMES[active + 1] : null;
	const rollerY = active >= 0 ? interpolate(t, [PASSES[active], PASSES[active] + PASS_SECONDS], [-30, SCREEN.h + 30], {easing: Easing.inOut(Easing.quad)}) : 0;
	const logoPop = 1 + 0.35 * Math.max(0, Math.sin(Math.min(1, Math.max(0, (t - NAME) / 0.45)) * Math.PI));

	const rise = 1 - spring({frame: (t - 0.1) * fps, fps, config: {damping: 12, stiffness: 110}});

	const beats: Beat[] = [
		{at: 0, action: 'idle', facing: 1, look: 0.8},
		...PASSES.flatMap((p): Beat[] => [
			{at: p - 0.15, action: 'point', facing: 1, look: 1},
			{at: p + PASS_SECONDS + 0.1, action: 'idle', facing: 1, look: 0.6},
		]),
		{at: PUT - 0.1, action: 'celebrate', facing: 1, look: 0.4},
		{at: PUT + 1.4, action: 'idle', facing: 1, look: 0.4},
	];
	const estable = poseAt('estable', beats.sort((a, b) => a.at - b.at), lines, t);

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.6} glowY={0.45}>
			<div style={{position: 'absolute', inset: 0, transform: `translateY(${rise * 900}px)`}}>
				<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
					<Phone x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} screen={base.bg}>
						<WalletScreen theme={base} logoScale={done === WALLET_THEMES.length - 1 ? logoPop : 1} />
						{next && (
							<>
								<clipPath id="wallet-reveal">
									<rect x={0} y={0} width={SCREEN.w} height={Math.max(0, rollerY)} />
								</clipPath>
								<g clipPath="url(#wallet-reveal)">
									<WalletScreen theme={next} />
								</g>
							</>
						)}
					</Phone>
				</svg>
				<WalletCoinIcons screenX={SCREEN_X} screenY={SCREEN_Y} />
				{next && (
					<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
						<PaintRoller y={rollerY} color={next.primary} />
					</svg>
				)}
			</div>
			<SceneActor id="estable" pose={estable} x={760} groundY={GROUND} height={320} />
			<PopChip at={0.3} x={760} y={230} label="Estable Wallet" size={34} />
			<PopChip at={PUT} x={PHONE.x + PHONE.w / 2} y={70} label="Your brand · ready to deploy" color={colors.tealBright} size={30} />
			<Sfx name="phone-ping" at={0.35} volume={0.7} />
			{PASSES.map((p) => (
				<React.Fragment key={p}>
					<Sfx name="paint-roller" at={p} volume={0.8} />
					<Sfx name="magic-swap" at={p + PASS_SECONDS - 0.15} volume={0.6} />
				</React.Fragment>
			))}
		</SceneFrame>
	);
};
