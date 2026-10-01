import React from 'react';
import {Easing, interpolate, random, spring, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import {ToyMascot} from '../mascots/toy-mascot';

const SCENE = sceneById('s01-hello');
const PARTICLES = 36;
const ASSEMBLE_END = 1.9;
const POP_AT = 2.05;
/** Triangle the nodes assemble into, centred where Estable's body will appear. */
const TRI = {cx: 0, cy: 1.6, r: 1.3};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Point `u` (0…1) along the perimeter of the upward triangle. */
const trianglePoint = (u: number) => {
	const corners = [
		[TRI.cx, TRI.cy + TRI.r],
		[TRI.cx + TRI.r * 1.05, TRI.cy - TRI.r * 0.95],
		[TRI.cx - TRI.r * 1.05, TRI.cy - TRI.r * 0.95],
	];
	const seg = Math.floor(u * 3) % 3;
	const k = u * 3 - Math.floor(u * 3);
	const a = corners[seg];
	const b = corners[(seg + 1) % 3];
	return new THREE.Vector3(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, 0.3);
};

export const ToyS01HelloScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);

	const gather = interpolate(t, [0.5, ASSEMBLE_END], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const outlineFade = interpolate(t, [POP_AT - 0.05, POP_AT + 0.25], [1, 0], clamp);
	const flash = interpolate(t, [POP_AT - 0.1, POP_AT, POP_AT + 0.35], [0, 1, 0], clamp);
	const pop = spring({frame: (t - POP_AT) * fps, fps, config: {damping: 9, stiffness: 140}});

	// Nodes fly in from all around the set (including behind the camera's sides) and draw the outline.
	const particles = Array.from({length: PARTICLES}, (_, i) => {
		const from = new THREE.Vector3((random(`p${i}x`) - 0.5) * 16, random(`p${i}y`) * 6, -2 - random(`p${i}z`) * 8);
		const g = interpolate(gather, [i / PARTICLES / 3, Math.min(1, i / PARTICLES / 3 + 0.7)], [0, 1], clamp);
		return {p: from.lerp(trianglePoint(i / PARTICLES), g), g};
	});
	const links = particles.flatMap((a, i) => {
		const b = particles[(i + 1) % PARTICLES];
		return Math.min(a.g, b.g) > 0.95 ? [a.p, b.p] : [];
	});

	const pose = poseAt(
		'estable',
		[
			{at: 0, action: 'idle'},
			{at: POP_AT + 0.3, action: 'jump'},
			{at: POP_AT + 1.2, action: 'idle'},
			// Wave lands on "Hi" (4th word: "Psst, over here! Hi, ...").
			{at: wordStart(lines[0], 3) - 0.15, action: 'wave'},
			{at: lines[0].end + 0.2, action: 'idle'},
		],
		lines,
		t,
	);

	// Slow push-in with a gentle drift around the hero.
	const push = interpolate(t, [0, SCENE.lead + 3], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const orbit = Math.sin(t * 0.35) * 0.6;
	const camera = {
		position: [orbit, interpolate(push, [0, 1], [2.6, 1.9]), interpolate(push, [0, 1], [13, 9.6])] as [number, number, number],
		target: [0, 1.45, 0] as [number, number, number],
	};

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			reveal={1 - gather * 0.5 + flash * 0.8}
			overlay={
				<>
					<Sfx name="whoosh-gather" at={0.45} />
					<Sfx name="pop-appear" at={POP_AT - 0.08} />
					<Sfx name="hop-boing" at={POP_AT + 0.48} volume={0.8} />
				</>
			}
		>
			{outlineFade > 0 && (
				<group>
					{particles.map(({p, g}, i) => (
						<mesh key={i} position={p} scale={(1 + g * 0.6) * outlineFade}>
							<sphereGeometry args={[0.06, 12, 8]} />
							<meshBasicMaterial color={colors.tealBright} toneMapped={false} />
						</mesh>
					))}
					{links.length > 0 && (
						<lineSegments geometry={new THREE.BufferGeometry().setFromPoints(links)}>
							<lineBasicMaterial color={colors.tealBright} transparent opacity={outlineFade} />
						</lineSegments>
					)}
				</group>
			)}
			{flash > 0 && <pointLight position={[0, 1.8, 1.2]} color={colors.tealBright} intensity={flash * 40} distance={8} />}
			{t >= POP_AT - 0.05 && (
				<group scale={Math.max(0.001, pop)}>
					<ToyMascot id="estable" pose={pose} height={2.05} />
				</group>
			)}
		</ToySceneFrame>
	);
};
