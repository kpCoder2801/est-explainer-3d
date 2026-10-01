import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../audio/sound-effects';
import {colors, fontInter} from '../brand/brand-tokens';
import {SceneActor} from '../components/scene-actor';
import {EstableLogoShape} from '../mascots/estable-mascot';
import {poseAt, timeScene, wordStart} from '../storyboard/scene-timeline';
import {SceneFrame, sceneById, useSceneTime} from './scene-frame';

const SCENE = sceneById('s10-outro');
const GROUND = 870;
const LOGO = {x: 960, y: 46, size: 150};
const HEADLINE_Y = 218;
const URL_Y = 335; // clears Estable's eyes (top ≈ 490)
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const S10OutroScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [estLine, arseLine, nanduLine] = lines;

	// Logo resolves on "Estable."; headline words rise as each is spoken.
	const LOGO_AT = estLine.start - 0.1;
	const logoIn = spring({frame: (t - LOGO_AT) * fps, fps, config: {damping: 14, stiffness: 120}});
	const glow = interpolate(t, [LOGO_AT, LOGO_AT + 0.5], [0, 1], clamp);
	const words = 'Unlock the future of digital finance'.split(' ');
	const URL_AT = wordStart(nanduLine, 0);
	const urlIn = spring({frame: (t - URL_AT) * fps, fps, config: {damping: 10, stiffness: 180}});
	const urlHint = interpolate(t, [arseLine.start, arseLine.start + 0.3], [0, 1], clamp);
	const WAVE_ALL = nanduLine.end + 0.15;

	// ARSe and Nandu stroll in from the sides while Estable opens the line.
	const walk = interpolate(t, [0, 1.1], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const arseX = interpolate(walk, [0, 1], [-250, 590]);
	const nanduX = interpolate(walk, [0, 1], [2200, 1330]);

	const estable = poseAt(
		'estable',
		[
			{at: 0, action: 'wave'},
			{at: estLine.start + 0.6, action: 'idle'},
			{at: arseLine.start, action: 'idle', look: -0.6},
			{at: nanduLine.start, action: 'idle', look: 0.6},
			{at: WAVE_ALL, action: 'wave'},
			{at: WAVE_ALL + 1.3, action: 'idle'},
		],
		lines,
		t,
	);
	const arse = poseAt(
		'arse',
		[
			{at: 0, action: 'walk', facing: 1},
			{at: 1.1, action: 'idle', facing: 1, look: 0.6},
			{at: arseLine.start - 0.1, action: 'point', facing: 1, look: 0.5},
			{at: arseLine.end + 0.2, action: 'idle', facing: 1, look: 0.6},
			{at: WAVE_ALL, action: 'wave', facing: 1},
			{at: WAVE_ALL + 1.3, action: 'idle', facing: 1},
		],
		lines,
		t,
	);
	const nandu = poseAt(
		'nandu',
		[
			{at: 0, action: 'walk', facing: -1},
			{at: 1.1, action: 'idle', facing: -1, look: -0.6},
			{at: nanduLine.start, action: 'celebrate', facing: -1},
			{at: WAVE_ALL + 1.3, action: 'idle', facing: -1},
		],
		lines,
		t,
	);

	return (
		<SceneFrame sceneId={SCENE.id} glowX={0.5} glowY={0.18}>
			<div
				style={{
					position: 'absolute',
					left: LOGO.x - 420,
					top: LOGO.y + LOGO.size / 2 - 420,
					width: 840,
					height: 840,
					borderRadius: '50%',
					background: `radial-gradient(circle, rgba(49,196,172,${0.4 * glow}) 0%, rgba(0,157,146,${0.15 * glow}) 35%, rgba(0,0,0,0) 65%)`,
				}}
			/>
			{t >= LOGO_AT && (
				<svg
					width={LOGO.size}
					height={LOGO.size}
					viewBox="-20 -20 1064 1064"
					style={{position: 'absolute', left: LOGO.x - LOGO.size / 2, top: LOGO.y, transform: `scale(${0.6 + 0.4 * logoIn})`, opacity: Math.min(1, logoIn * 1.5)}}
				>
					<EstableLogoShape fill={colors.white} />
				</svg>
			)}
			<div style={{position: 'absolute', top: HEADLINE_Y, width: '100%', display: 'flex', justifyContent: 'center', gap: 22, fontFamily: fontInter, fontSize: 76, fontWeight: 700, color: colors.white}}>
				{words.map((w, i) => {
					const k = interpolate(t, [wordStart(estLine, i + 1) - 0.05, wordStart(estLine, i + 1) + 0.2], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
					return (
						<span key={w} style={{opacity: k, transform: `translateY(${(1 - k) * 30}px)`, display: 'inline-block'}}>
							{w}
						</span>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: URL_Y, width: '100%', display: 'flex', justifyContent: 'center'}}>
				<div
					style={{
						fontFamily: fontInter,
						fontSize: 60,
						fontWeight: 800,
						color: colors.tealBright,
						padding: '8px 40px',
						borderRadius: 999,
						border: `4px solid rgba(49,196,172,${0.6 * urlHint})`,
						background: `rgba(26,51,49,${0.7 * urlHint})`,
						transform: `scale(${t < URL_AT ? 0.9 + 0.1 * urlHint : 1 + (1 - urlIn) * 0.4})`,
						minWidth: 380,
						textAlign: 'center',
					}}
				>
					<span style={{opacity: t >= URL_AT ? 1 : 0}}>estable.io</span>
				</div>
			</div>
			<SceneActor id="arse" pose={arse} x={arseX} groundY={GROUND} height={210} />
			<SceneActor id="estable" pose={estable} x={960} groundY={GROUND} height={300} />
			<SceneActor id="nandu" pose={nandu} x={nanduX} groundY={GROUND} height={260} />
			<Sfx name="footsteps-cartoon" at={0.1} volume={0.6} />
			<Sfx name="logo-shimmer" at={LOGO_AT} volume={0.9} />
			<Sfx name="chip-pop" at={arseLine.start} volume={0.6} />
			<Sfx name="text-stamp" at={URL_AT} />
		</SceneFrame>
	);
};
