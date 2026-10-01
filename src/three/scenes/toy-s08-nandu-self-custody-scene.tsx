import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToyChip, ToyCoin} from '../kit/toy-props';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import {ToyMascot} from '../mascots/toy-mascot';
import {cameraPath} from '../kit/toy-camera-path';
import {StampCard} from './parts/toy-s08-stamp-title';
import {PHONE_H, PixelDust, SCREEN_Z, SkidBurst, stepped, VoxelKey, VoxelLock, VoxelPhone, VoxelSparkle} from './parts/toy-s08-voxel-props';

const SCENE = sceneById('s08-nandu');
const NANDU_X = -1.45;
const PHONE_X = 1.75;
const RUN_FROM = 7.5;
const RUN_END = 1.15;
const SKID_AT = 1.05;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Sprint in from the right on stepped time: overshoot, then skid back to the mark. */
const runX = (t: number) => interpolate(stepped(t), [0, 1.1, 1.35], [RUN_FROM, NANDU_X - 0.25, NANDU_X], {...clamp, easing: Easing.out(Easing.quad)});
const TITLE = [
	{text: 'Your crypto.', word: 15, x: -2.75},
	{text: 'Your wallet.', word: 17, x: 0},
	{text: 'Your control.', word: 19, x: 2.85, gold: true},
];

export const ToyS08NanduSelfCustodyScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	const PHONE_IN = wordStart(line, 8) - 0.15; // "...on Polygon."
	const KEY_DROP = wordStart(line, 10) - 0.1; // "Your keys stay on your device."
	const KEY_FALL = 0.6;
	const LOCKED = KEY_DROP + 0.8;
	const STAMPS = TITLE.map((w) => wordStart(line, w.word));

	const nanduX = runX(t);
	const pose = poseAt(
		'nandu',
		[
			{at: 0, action: 'walk', facing: -1},
			{at: RUN_END, action: 'idle', facing: -1, look: 0},
			{at: PHONE_IN - 0.2, action: 'idle', facing: 1, look: 1},
			{at: KEY_DROP + 0.1, action: 'point', facing: 1, look: 1},
			{at: LOCKED + 0.4, action: 'idle', facing: -1, look: 0},
			{at: line.end + 0.1, action: 'celebrate', facing: -1},
		],
		lines,
		t,
	);
	// Running uses a faster stride than walking; in profile while sprinting, then turned toward camera (or the phone).
	const running = t < RUN_END;
	const nanduPose = running ? {...pose, actionTime: pose.actionTime * 1.8} : pose;
	const yaw = running ? 0.15 : pose.facing < 0 ? 0.85 : -0.7;

	// Phone drops with a sprite bounce; key falls into its screen, then becomes a lock.
	const phoneY = interpolate(stepped(t), [PHONE_IN, PHONE_IN + 0.4], [5.5, 0], {...clamp, easing: Easing.out(Easing.bounce)});
	const keyK = interpolate(stepped(t), [KEY_DROP, KEY_DROP + KEY_FALL], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const keyY = interpolate(keyK, [0, 1], [5, PHONE_H * 0.52]);
	const lockStep = stepped(t) - LOCKED;
	const lockScale = lockStep < 0.1 ? 1.5 : lockStep < 0.2 ? 0.85 : 1;
	const flash = interpolate(t, [LOCKED - 0.05, LOCKED + 0.05, LOCKED + 0.6], [0, 1, 0], clamp);
	const chipIn = spring({frame: (t - PHONE_IN - 0.35) * fps, fps, config: {damping: 11, stiffness: 160}});

	// Track the sprint low and close, settle into the two-shot, lean toward the phone, then crane up for the title.
	const track = Math.max(NANDU_X, nanduX);
	const camera = cameraPath(t, [
		{at: 0, position: [track * 0.55 + 1, 1.15, 8.6], target: [track * 0.6, 1.05, 0]},
		{at: 1.1, position: [track * 0.55 + 1, 1.15, 8.6], target: [track * 0.6, 1.05, 0]},
		{at: 2.4, position: [-1.6, 1.6, 8.4], target: [-1.1, 1.3, 0]},
		{at: PHONE_IN - 0.3, position: [-1.3, 1.6, 8.6], target: [-0.95, 1.3, 0]},
		{at: PHONE_IN + 0.3, position: [-0.1, 1.75, 10.2], target: [0.15, 1.35, 0]},
		{at: PHONE_IN + 1.2, position: [1.3, 1.65, 9.6], target: [0.45, 1.3, 0]},
		{at: STAMPS[0] - 0.7, position: [1.1, 1.7, 9.6], target: [0.45, 1.35, 0]},
		{at: STAMPS[0] + 0.1, position: [0, 2.2, 11.6], target: [0, 1.95, 0]},
		{at: line.end + 1.2, position: [-0.4, 2.15, 10.9], target: [0, 1.95, 0]},
	]);

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			glow={colors.nanduGold}
			glowX={0.2}
			rim={colors.nanduLight}
			overlay={
				<>
					<Sfx name="pixel-run" at={0} />
					<Sfx name="pixel-skid" at={SKID_AT} />
					<Sfx name="pixel-drop" at={PHONE_IN} />
					<Sfx name="chip-pop" at={PHONE_IN + 0.35} volume={0.6} />
					<Sfx name="pixel-drop" at={KEY_DROP} volume={0.8} />
					<Sfx name="pixel-lock" at={LOCKED} />
					{STAMPS.map((s) => (
						<Sfx key={s} name="text-stamp" at={s} />
					))}
				</>
			}
		>
			<PixelDust t={t} until={RUN_END} heelX={runX} dir={1} />
			<SkidBurst t={t} at={SKID_AT} x={NANDU_X - 0.5} dir={-1} />
			<group position={[nanduX, 0, 0]}>
				<ToyMascot id="nandu" pose={nanduPose} height={2.3} yaw={yaw} />
			</group>

			{t >= PHONE_IN && (
				// Angled a little toward Nandu so the bezel depth shows.
				<group position={[PHONE_X, phoneY, 0]} rotation={[0, -0.28, 0]}>
					<VoxelPhone />
					{t >= KEY_DROP && t < LOCKED && (
						<group position={[0, keyY - 0.15, SCREEN_Z + 0.08]} rotation={[0, (1 - keyK) * Math.PI * 2, (1 - keyK) * 0.5]}>
							<VoxelKey />
						</group>
					)}
					{t >= LOCKED && (
						<group position={[0, PHONE_H * 0.3, SCREEN_Z + 0.06]} scale={lockScale}>
							<VoxelLock />
						</group>
					)}
					{chipIn > 0.01 && (
						<group position={[0.1, PHONE_H + 0.5, 0.2]} scale={chipIn}>
							<ToyChip label="Built on Polygon" color="#8247e5" height={0.34} position={[0.2, 0, 0]} />
							<ToyCoin symbol="POL" radius={0.24} position={[-1.05, 0, 0.12]} />
						</group>
					)}
				</group>
			)}
			<VoxelSparkle t={t} at={LOCKED} center={[PHONE_X, PHONE_H * 0.55, 0.3]} />
			{flash > 0 && <pointLight position={[PHONE_X - 0.3, PHONE_H * 0.6, 1.2]} color={colors.tealBright} intensity={flash * 9} distance={6} />}

			{TITLE.map((w, i) => (
				<StampCard key={w.text} t={t} at={STAMPS[i]} text={w.text} w={2.55} position={[w.x, 3.55, -0.6]} gold={w.gold} />
			))}
		</ToySceneFrame>
	);
};
