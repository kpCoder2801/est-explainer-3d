import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors, fontInter} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToyChip} from '../kit/toy-props';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import {ToyMascot} from '../mascots/toy-mascot';
import {cameraPath} from '../kit/toy-camera-path';
import {HeroGlow} from './parts/toy-s10-hero-glow';
import {ToyEstableLogo} from '../kit/toy-estable-logo';

const SCENE = sceneById('s10-outro');
const LOGO = {y: 3.52, z: -0.6, size: 1.3};
const URL_Y = 2.55;
/** Headline baseline in screen pixels, between the floating logo and the URL chip (final camera). */
const HEADLINE_TOP = 326;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const ToyS10OutroScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [estLine, arseLine, nanduLine] = lines;

	// Logo resolves on "Estable.": spins up out of edge-on, grows and rises into the glow.
	const LOGO_AT = estLine.start - 0.1;
	const logoIn = spring({frame: (t - LOGO_AT) * fps, fps, config: {damping: 13, stiffness: 90}});
	const glow = interpolate(t, [LOGO_AT, LOGO_AT + 0.5, LOGO_AT + 1.4], [0, 1.25, 0.8], clamp);
	const float = Math.sin(t * 1.4) * 0.04;
	const words = 'Unlock the future of digital finance'.split(' ');
	const URL_AT = wordStart(nanduLine, 0);
	const urlIn = spring({frame: (t - URL_AT) * fps, fps, config: {damping: 10, stiffness: 180}});
	const WAVE_ALL = nanduLine.end + 0.15;

	// ARSe and Nandu stroll in from the sides while Estable opens the line.
	const walk = interpolate(t, [0, 1.1], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const arseX = interpolate(walk, [0, 1], [-7.5, -2.35]);
	const nanduX = interpolate(walk, [0, 1], [8, 2.45]);

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
	// Everyone squares up to camera for the group wave and the held end frame.
	const lineUp = t >= WAVE_ALL;

	// Crane down from above the logo while orbiting in from the left; settle into the held end frame.
	const camera = cameraPath(t, [
		{at: 0, position: [-2.4, 3.9, 16.5], target: [0, 2.5, 0]},
		// Arrive before the headline's first word so the logo is clear of the text when it rises.
		{at: wordStart(estLine, 1) - 0.1, position: [-0.6, 2.3, 13], target: [0, 2.15, 0]},
		{at: WAVE_ALL, position: [0, 2.05, 12], target: [0, 2.1, 0]},
	]);

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			reveal={0.7 + glow * 0.5}
			overlay={
				<>
					<div style={{position: 'absolute', top: HEADLINE_TOP, width: '100%', display: 'flex', justifyContent: 'center', gap: 20, fontFamily: fontInter, fontSize: 64, fontWeight: 800, color: colors.white}}>
						{words.map((w, i) => {
							const k = interpolate(t, [wordStart(estLine, i + 1) - 0.05, wordStart(estLine, i + 1) + 0.22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
							return (
								<span key={w} style={{opacity: k, transform: `translateY(${(1 - k) * 34}px)`, display: 'inline-block', textShadow: '0 4px 24px rgba(0,0,0,0.55)'}}>
									{w}
								</span>
							);
						})}
					</div>
					<Sfx name="footsteps-cartoon" at={0.1} volume={0.6} />
					<Sfx name="logo-shimmer" at={LOGO_AT} volume={0.9} />
					<Sfx name="chip-pop" at={arseLine.start} volume={0.6} />
					<Sfx name="text-stamp" at={URL_AT} />
				</>
			}
		>
			<HeroGlow size={7} color={colors.tealBright} strength={0.55 * glow} position={[0, LOGO.y + LOGO.size * 0.5, LOGO.z - 1.2]} />
			{glow > 0 && <pointLight position={[0, LOGO.y + 0.6, LOGO.z + 1.6]} color={colors.tealBright} intensity={glow * 10} distance={7} />}
			{t >= LOGO_AT && (
				<group position={[0, LOGO.y - (1 - logoIn) * 0.8 + float, LOGO.z]} rotation={[0, (1 - logoIn) * -Math.PI * 1.5, 0]} scale={0.35 + 0.65 * logoIn}>
					<ToyEstableLogo size={LOGO.size} />
				</group>
			)}
			{urlIn > 0.01 && (
				// Springy overshoot gives the stamp: pops past full size and settles.
				<ToyChip label="estable.io" color={colors.tealDark} textColor={colors.tealBright} height={0.44} position={[0, URL_Y, 0.2]} scale={urlIn} />
			)}
			<group position={[arseX, 0, 0.6]}>
				<ToyMascot id="arse" pose={arse} height={1.45} yaw={lineUp ? 0.12 : undefined} />
			</group>
			<group position={[0, 0, 0.6]}>
				<ToyMascot id="estable" pose={estable} height={1.58} yaw={0} />
			</group>
			<group position={[nanduX, 0, 0.6]}>
				<ToyMascot id="nandu" pose={nandu} height={1.85} yaw={lineUp ? 0.7 : undefined} />
			</group>
		</ToySceneFrame>
	);
};
