import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToyChip, ToyStableCoin} from '../kit/toy-props';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import {Toy} from '../kit/toy-mesh';
import type {V3} from '../kit/toy-stage';
import {ToyMascot} from '../mascots/toy-mascot';
import {FlipFactCard} from './parts/toy-s02-fact-card';
import {GlobePose, globeSurfacePoint, SurfaceAnchor, ToyGlobe, ToyMapPin} from './parts/toy-s02-globe';

const SCENE = sceneById('s02-who');
const EL_SALVADOR = {lat: 13.7, lon: -89};
const GLOBE_CENTER: V3 = [0.3, 2.05, -0.4];
const GLOBE_R = 1.3;
const ESTABLE_X = -3.05;
const WALK_END = 1.3;
/** Spin (rad) at which El Salvador faces out toward Estable, ~55° left of the camera axis. */
const SPIN_AT_PIN = (-55 + 89) * (Math.PI / 180);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Two money rails orbit the globe, tilted opposite ways so they cross in an X; each
 * draws on as a growing torus arc, then coins ride it. Order ZXY = tilt the ring back
 * (x), then lean it left or right around the camera axis (z).
 */
const RAILS = [
	{radius: 1.62, rot: new THREE.Euler(1.25, 0, 0.55, 'ZXY'), color: colors.tealBright, dir: 1},
	{radius: 1.56, rot: new THREE.Euler(1.25, 0, -0.55, 'ZXY'), color: colors.arseSky, dir: -1},
];

/** Undo the rail's tilt so a riding coin shows its face to the camera, with a little wobble spin. */
const faceCamera = (rot: THREE.Euler, a: number) =>
	new THREE.Quaternion().setFromEuler(rot).invert().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.sin(a * 2) * 0.5, 0)));

export const ToyS02WhoWeAreScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	const TETHER = wordStart(line, 2);
	const PIN = wordStart(line, 6);
	const FOUNDED = wordStart(line, 8);
	const RAIL_AT = wordStart(line, 16);

	// Globe pops up on its stand and spins in fast, easing so El Salvador faces Estable on "El Salvador".
	const globeIn = spring({frame: (t - 0.15) * fps, fps, config: {damping: 13, stiffness: 90}});
	const spinIn = interpolate(t, [0, PIN], [-2.6, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	// Floats in space with a slow bob instead of standing on a desk stand.
	const center: V3 = [GLOBE_CENTER[0], GLOBE_CENTER[1] + Math.sin(t * 1.3) * 0.06, GLOBE_CENTER[2]];
	const globe: GlobePose = {center, radius: GLOBE_R, spin: SPIN_AT_PIN + spinIn + Math.max(0, t - PIN) * 0.05, tilt: 0.2, scale: Math.max(0.001, globeIn)};

	const pinDrop = interpolate(t, [PIN - 0.2, PIN + 0.15], [4, 0], {...clamp, easing: Easing.in(Easing.quad)});
	const pinSquash = interpolate(t, [PIN + 0.15, PIN + 0.24, PIN + 0.42], [1, 0.72, 1], clamp);
	const pinWorld = globeSurfacePoint(globe, EL_SALVADOR.lat, EL_SALVADOR.lon, 0.7);
	const chipIn = spring({frame: (t - PIN - 0.35) * fps, fps, config: {damping: 11, stiffness: 160}});
	const card = (at: number) => spring({frame: (t - at) * fps, fps, config: {damping: 11, stiffness: 120}});
	const rails = interpolate(t, [RAIL_AT, RAIL_AT + 1.3], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});

	const walkX = interpolate(t, [0, WALK_END], [-6.6, ESTABLE_X], {...clamp, easing: Easing.out(Easing.quad)});
	// Turned hard toward the walk direction, then settles three-quarter toward the globe.
	const yaw = interpolate(t, [WALK_END - 0.3, WALK_END + 0.3], [1.1, 0.5], clamp);
	const pose = poseAt(
		'estable',
		[
			{at: 0, action: 'walk'},
			{at: WALK_END, action: 'idle', look: 0.6},
			{at: PIN - 0.35, action: 'point', look: 1},
			{at: PIN + 1.1, action: 'idle', look: 0.5},
			{at: RAIL_AT - 0.1, action: 'wave', look: 1},
			{at: RAIL_AT + 1.2, action: 'idle', look: 0.6},
			{at: line.end + 0.05, action: 'celebrate', look: 0.3},
		],
		lines,
		t,
	);

	// Camera tracks Estable's entrance, settles on the whole set, then orbits right and eases back for the rails.
	const settle = interpolate(t, [0, 2.4], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const reveal = interpolate(t, [RAIL_AT - 0.4, RAIL_AT + 1.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const camera = {
		position: [interpolate(settle, [0, 1], [-2.4, 0]) + reveal * 1.3, 2.5 + reveal * 0.5, interpolate(settle, [0, 1], [11.2, 11.6]) + reveal * 0.7] as V3,
		target: [interpolate(settle, [0, 1], [-2, 0.3]) + reveal * 0.3, interpolate(settle, [0, 1], [1.6, 1.8]), 0] as V3,
	};

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			glowX={0.4}
			overlay={
				<>
					<Sfx name="footsteps-cartoon" at={0} volume={0.8} />
					<Sfx name="card-flip" at={TETHER} />
					<Sfx name="pin-drop" at={PIN + 0.1} />
					<Sfx name="card-flip" at={FOUNDED} />
					<Sfx name="arc-zip" at={RAIL_AT} />
				</>
			}
		>
			<ToyGlobe pose={globe}>
				{t >= PIN - 0.2 && (
					<SurfaceAnchor lat={EL_SALVADOR.lat} lon={EL_SALVADOR.lon}>
						<group position={[0, 0, GLOBE_R * 0.99]} rotation={[Math.PI / 2, 0, 0]}>
							<ToyMapPin size={0.55} drop={pinDrop} squash={pinSquash} />
						</group>
					</SurfaceAnchor>
				)}
			</ToyGlobe>
			{chipIn > 0.01 && <ToyChip label="El Salvador" color={colors.tealBright} textColor={colors.ink} height={0.34} position={[pinWorld.x - 0.7, pinWorld.y + 0.75, pinWorld.z + 0.3]} scale={chipIn} />}
			{rails > 0 && (
				<group position={center}>
					{RAILS.map((r, i) => {
						const p = interpolate(rails, [i * 0.2, i * 0.2 + 0.8], [0, 1], clamp);
						return (
							p > 0 && (
								<group key={i} rotation={r.rot}>
									<Toy color={r.color} outline={0.012}>
										<torusGeometry args={[r.radius, 0.035, 10, 120, Math.max(0.01, p * Math.PI * 2)]} />
									</Toy>
									{/* Coins ride the finished rail. */}
									{p >= 1 &&
										[0, 1, 2].map((c) => {
											const a = (c / 3 + (t - RAIL_AT) * 0.18 * r.dir) * Math.PI * 2;
											return <ToyStableCoin key={c} radius={0.15} position={[Math.cos(a) * r.radius, Math.sin(a) * r.radius, 0]} quaternion={faceCamera(r.rot, a)} />;
										})}
								</group>
							)
						);
					})}
				</group>
			)}
			{t >= TETHER && <FlipFactCard text="A Tether portfolio company" flip={card(TETHER)} position={[3.45, 2.55, 0.1]} rotation={[0, -0.28, 0]} />}
			{t >= FOUNDED && <FlipFactCard text="Founded by ex-Bitfinex & Tether builders" flip={card(FOUNDED)} accent={colors.tealBright} position={[3.45, 1.15, 0.4]} rotation={[0, -0.28, 0]} />}
			<group position={[walkX, 0, 0.3]}>
				<ToyMascot id="estable" pose={pose} height={1.75} yaw={yaw} />
			</group>
		</ToySceneFrame>
	);
};
