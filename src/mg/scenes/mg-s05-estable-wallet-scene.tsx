import React from 'react';
import {interpolate} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {KineticPhrase} from '../kit/kinetic-phrase';
import {MgSceneFrame} from '../kit/mg-scene-frame';
import {between, DUR, enter, STAGGER} from '../kit/mg-motion';
import {MgActor} from '../mascots/mg-mascot';
import {WALLET_THEMES, WalletScreen} from './parts/mg-s05-wallet-parts';

const SCENE = sceneById('s05-wallet');
const PHONE = {x: 760, y: 110, w: 400, h: 780, bezel: 20};
const SCREEN = {w: PHONE.w - PHONE.bezel * 2, h: PHONE.h - PHONE.bezel * 2};
const WIPE = 0.45;

/**
 * MG S05 — Estable Wallet. A 3D-tilted phone floats in with a clean wallet UI; on
 * "branded", "No" and "We" a glowing mask wipe re-skins it through invented brands,
 * while kinetic type delivers "No building from scratch" and "Your name on it".
 */
export const MgS05EstableWalletScene: React.FC = () => {
	const t = useSceneTime();
	const {lines} = timeScene(SCENE);
	const [line] = lines;
	// Word indices: 3 you · 7 branded · 10 No · 14 We · 19 your · 20 name · 22 it.
	const passes = [7, 10, 14].map((i) => wordStart(line, i) - 0.1);
	const nameAt = wordStart(line, 20);

	const appear = enter(t, 0.3, DUR.slow);
	const passIdx = passes.filter((p) => t >= p).length;
	const wipe = passIdx > 0 ? between(t, passes[passIdx - 1], passes[passIdx - 1] + WIPE) : 1;
	const base = WALLET_THEMES[Math.max(0, passIdx - 1)];
	const top = WALLET_THEMES[passIdx];
	const rows = [0, 1, 2, 3, 4, 5].map((i) => enter(t, 0.6 + i * STAGGER * 1.5, DUR.std));

	// Phone tilt: swings in from deep perspective, settles, and kicks on each re-skin.
	const kick = passes.reduce((k, p) => k + Math.max(0, Math.sin(between(t, p, p + 0.6, 0, 1) * Math.PI)) * 7, 0);
	const ry = interpolate(appear, [0, 1], [-42, -16]) + interpolate(t, [1, 10], [0, 8], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) + kick;
	const rx = 5 + Math.sin(t * 0.9) * 1.5;
	const float = Math.sin(t * 1.2) * 10;

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'idle', facing: 1, look: 1},
			{at: passes[0] - 0.1, action: 'point', facing: 1, look: 1},
			{at: passes[0] + 1.1, action: 'idle', facing: 1, look: 0.8},
			{at: passes[2] - 0.1, action: 'point', facing: 1, look: 1},
			{at: nameAt, action: 'celebrate', facing: 1},
		],
		lines,
		t,
	);

	return (
		<MgSceneFrame sceneId={SCENE.id} accent={top.primary} orbA={[0.5, 0.45]} orbB={[0.82, 0.3]}>
			<KineticPhrase line={line} from={0} to={2} x={110} y={86} size={80} width={640} align="left" accent={['wallet,']} />
			{/* Brand pulse rings behind the phone on each re-skin. */}
			{passes.map((p, i) => {
				const r = between(t, p, p + 0.8, 0, 1);
				if (r <= 0 || r >= 1) return null;
				return (
					<div
						key={p}
						style={{
							position: 'absolute',
							left: PHONE.x,
							top: PHONE.y,
							width: PHONE.w,
							height: PHONE.h,
							borderRadius: 64,
							border: `6px solid ${WALLET_THEMES[i + 1].secondary}`,
							transform: `scale(${1 + r * 0.45})`,
							opacity: 1 - r,
						}}
					/>
				);
			})}
			<div style={{position: 'absolute', left: PHONE.x + PHONE.w / 2 - 170, top: PHONE.y + PHONE.h + 18, width: 340, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', filter: 'blur(10px)', opacity: appear}} />
			<div style={{position: 'absolute', inset: 0, perspective: 1800}}>
				<div
					style={{
						position: 'absolute',
						left: PHONE.x,
						top: PHONE.y,
						width: PHONE.w,
						height: PHONE.h,
						borderRadius: 64,
						background: 'linear-gradient(145deg, #3a4644, #121817 60%, #050707)',
						boxShadow: `0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.12)`,
						opacity: appear,
						transform: `translateY(${(1 - appear) * 260 + float}px) rotateY(${ry}deg) rotateX(${rx}deg)`,
						transformStyle: 'preserve-3d',
					}}
				>
					<div style={{position: 'absolute', left: PHONE.bezel, top: PHONE.bezel, width: SCREEN.w, height: SCREEN.h, borderRadius: 46, overflow: 'hidden'}}>
						<WalletScreen theme={base} rows={rows} />
						{passIdx > 0 && (
							<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - wipe) * 100}% 0)`}}>
								<WalletScreen theme={top} rows={rows} />
							</div>
						)}
						{passIdx > 0 && wipe < 1 && (
							<div
								style={{
									position: 'absolute',
									left: -20,
									right: -20,
									top: wipe * SCREEN.h - 14,
									height: 28,
									background: `linear-gradient(180deg, rgba(255,255,255,0), ${top.secondary}, rgba(255,255,255,0.9), ${top.secondary}, rgba(255,255,255,0))`,
									filter: 'blur(2px)',
									opacity: Math.sin(wipe * Math.PI),
								}}
							/>
						)}
						<div style={{position: 'absolute', left: SCREEN.w / 2 - 50, top: 14, width: 100, height: 26, borderRadius: 13, background: '#000'}} />
						{/* Glass sheen sliding across with the tilt. */}
						<div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${30 + ry}%, rgba(255,255,255,0.10) ${40 + ry}%, rgba(255,255,255,0) ${52 + ry}%)`}} />
					</div>
				</div>
			</div>
			<KineticPhrase line={line} from={3} to={9} x={1250} y={300} size={64} width={600} align="left" accent={['branded']} exitAt={wordStart(line, 10) - 0.45} />
			<KineticPhrase line={line} from={10} to={13} x={1250} y={270} size={100} width={600} align="left" uppercase accent={['scratch.']} exitAt={wordStart(line, 14) - 0.4} />
			<KineticPhrase line={line} from={14} to={18} x={1250} y={220} size={60} width={600} align="left" color={colors.tealLight} />
			<KineticPhrase line={line} from={19} to={22} x={1250} y={370} size={108} width={620} align="left" uppercase accent={['name']} accentColor={WALLET_THEMES[3].secondary} />
			<MgActor id="estable" pose={estable} x={400} groundY={870} height={260} />
			<Sfx name="mg-whoosh" at={0.25} volume={0.7} />
			<Sfx name="mg-pop" at={0.45} />
			{passes.map((p) => (
				<React.Fragment key={p}>
					<Sfx name="mg-whoosh" at={p - 0.05} />
					<Sfx name="mg-sparkle" at={p + 0.25} volume={0.5} />
				</React.Fragment>
			))}
			<Sfx name="mg-glitch" at={passes[1]} volume={0.5} />
			<Sfx name="mg-impact" at={nameAt - 0.05} volume={0.9} />
			<Sfx name="mg-confirm" at={wordStart(line, 22) + 0.25} volume={0.8} />
		</MgSceneFrame>
	);
};
