import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Sfx} from '../../audio/sound-effects';
import {colors} from '../../brand/brand-tokens';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {Beat, poseAt, timeScene, wordStart} from '../../storyboard/scene-timeline';
import {ToyChip, ToyCoin} from '../kit/toy-props';
import {ToySceneFrame} from '../kit/toy-scene-frame';
import type {V3} from '../kit/toy-stage';
import {Toy} from '../kit/toy-mesh';
import {ToyMascot} from '../mascots/toy-mascot';
import {ToyDinnerReceipt, ToyReceiptHalf, ToySplitPhone} from './parts/toy-s07-dinner-split-phones';
import {ARGENTINA, arcPoint, latLonToLocal, SPAIN, ToyRemittanceGlobe} from './parts/toy-s07-remittance-globe';
import {ToyShopStall, ToyTimerChip, SUCCESS} from './parts/toy-s07-shop-stall-and-timer-chip';

const SCENE = sceneById('s07-arse-life');
/** The three vignettes sit side by side on one long set that slides past the camera (the studio backdrop stays put). */
const STAGE = [0, 11, 22.6];
const GLOBE = {at: new THREE.Vector3(0, 2.2, -0.4), r: 1.55};
const PHONE_DX = 2.3;
const RECEIPT_Y = 2.65;
const STALL_X = 22;
const COUNTER_TOP = 1.26;
const ARSE_H = 1.3;
const ARSE_ON_GLOBE = 0.5;
const UP = new THREE.Vector3(0, 1, 0);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);

type Spot = {p: THREE.Vector3; s: number};
/** Hop from a to b at progress `k` with a peak of `h` world units. */
const hop = (a: Spot, b: Spot, k: number, h: number): Spot => ({
	p: a.p.clone().lerp(b.p, k).add(new THREE.Vector3(0, Math.sin(k * Math.PI) * h, 0)),
	s: a.s + (b.s - a.s) * k,
});

/** S07 — ARSe in action: remittance over a globe, a split dinner bill, a shop QR payment, each with a timer chip. */
export const ToyS07ArseInActionScene: React.FC = () => {
	const t = useSceneTime();
	const {fps} = useVideoConfig();
	const {lines} = timeScene(SCENE);
	const [line] = lines;

	// Cues from the spoken words ("Send money across borders, split a dinner, or pay at a shop. In seconds, with low fees, on Polygon.").
	const ZIP = wordStart(line, 1); // "money"
	const ARRIVE = ZIP + 0.6;
	const B2 = wordStart(line, 4); // "split"
	const T2 = B2 - 0.3;
	const B3 = wordStart(line, 7); // "or"
	const T3 = B3 - 0.3;
	const PAY = wordStart(line, 9); // "at" — lands on the QR right after "pay"
	const CHIPS = [13, 15, 18].map((i) => wordStart(line, i)); // seconds · low · Polygon
	const pop = (at: number) => Math.max(0.001, spring({frame: (t - at) * fps, fps, config: {damping: 10, stiffness: 180}}));

	// Remittance: ARSe rides the dotted arc from the Argentina pin to Spain on a slowly turning globe.
	const spin = -0.8 + t * 0.06;
	const zip = interpolate(t, [ZIP, ARRIVE], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const a = latLonToLocal(ARGENTINA, GLOBE.r);
	const b = latLonToLocal(SPAIN, GLOBE.r);
	// ARSe stops just short of the destination pin so it stands beside it.
	const onArc = arcPoint(a, b, GLOBE.r, zip * 0.88);
	// Lift ARSe off the surface along the normal so it rides over the trail, not inside the globe.
	const lift = onArc.clone().normalize().multiplyScalar(0.18 + Math.sin(zip * Math.PI) * 0.05);
	const ride = onArc.add(lift).applyAxisAngle(UP, spin).add(GLOBE.at);
	const s1: Spot = {p: ride, s: ARSE_ON_GLOBE};
	const s2: Spot = {p: new THREE.Vector3(STAGE[1], 0, 0.6), s: ARSE_H};
	const s3a: Spot = {p: new THREE.Vector3(STALL_X - 2.5, 0, 0.8), s: ARSE_H};
	const s3b: Spot = {p: new THREE.Vector3(STALL_X + 0.1, COUNTER_TOP, 0.15), s: ARSE_H};
	const arse =
		t < T2 ? s1 : t < B2 ? hop(s1, s2, interpolate(t, [T2, B2], [0, 1], clamp), 1.6) : t < T3 ? s2 : t < B3 ? hop(s2, s3a, interpolate(t, [T3, B3], [0, 1], clamp), 1.2) : hop(s3a, s3b, interpolate(t, [B3, PAY], [0, 1], clamp), 1.3);

	const beats: Beat[] = [
		{at: 0, action: 'idle', facing: 1, look: 0.4},
		{at: ZIP, action: 'celebrate', facing: 1},
		{at: ARRIVE, action: 'idle', facing: 1, look: -0.3},
		{at: T2, action: 'jump', facing: 1},
		{at: B2 + 0.35, action: 'idle', facing: 1},
		{at: T3, action: 'jump', facing: 1},
		{at: PAY, action: 'celebrate', facing: 1},
		{at: PAY + 0.7, action: 'idle', facing: 1, look: 0.4},
		{at: CHIPS[2], action: 'celebrate', facing: 1},
	];
	const pose = poseAt('arse', beats, lines, t);
	// Faces along the flight, toward camera between moves, and toward the QR at the shop.
	const yaw = interpolate(t, [ZIP, ARRIVE, T2, B2, B2 + 0.3, T3, PAY, PAY + 0.8], [0.9, 0.9, 0.9, 0.9, 0, 0.8, 0.8, 0.25], {...clamp, easing: ease});

	const destPin = spring({frame: (t - ARRIVE) * fps, fps, config: {damping: 10, stiffness: 180}});
	const receiptIn = spring({frame: (t - T2) * fps, fps, config: {damping: 12, stiffness: 200}});
	const split = interpolate(t, [B2 + 0.05, B2 + 0.4], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const checked = t >= B2 + 0.4;
	const scanned = interpolate(t, [PAY, PAY + 0.15, PAY + 0.6], [0, 1, 0.6], clamp);

	// Whip between vignettes on the cue words while the camera orbits a little around each one.
	const stageX = interpolate(t, [T2 - 0.15, B2 + 0.05, T3 - 0.1, B3 + 0.05], [STAGE[0], STAGE[1], STAGE[1], STAGE[2]], {...clamp, easing: ease});
	const orbit = interpolate(t, [0, T2 - 0.15, B2 + 0.05, T3 - 0.1, B3 + 0.05, SCENE.lead + 8.5], [-1.4, 0.6, -0.7, 0.5, -1.5, 1.3], {...clamp, easing: ease});
	const camera = {
		position: [orbit, 2.6, 11.4 - Math.abs(orbit) * 0.2] as V3,
		target: [orbit * 0.15, 1.68, 0] as V3,
	};

	return (
		<ToySceneFrame
			sceneId={SCENE.id}
			camera={camera}
			rim={colors.arseSky}
			glow={colors.arseSky}
			overlay={
				<>
					<Sfx name="arc-zip" at={ZIP} volume={0.8} />
					<Sfx name="phone-ping" at={ARRIVE} volume={0.7} />
					<Sfx name="hop-boing" at={T2} volume={0.6} />
					<Sfx name="card-flip" at={B2 + 0.05} volume={0.8} />
					<Sfx name="phone-ping" at={B2 + 0.4} volume={0.7} />
					<Sfx name="hop-boing" at={T3} volume={0.6} />
					<Sfx name="qr-beep" at={PAY} volume={0.8} />
				</>
			}
		>
			<group position={[-stageX, 0, 0]}>
				{/* Desk-globe pedestal grounds the globe on the studio floor. */}
				<Toy color={colors.arseNavy} position={[GLOBE.at.x, 0.36, GLOBE.at.z]}>
					<cylinderGeometry args={[0.16, 0.5, 0.72, 32]} />
				</Toy>
				<ToyRemittanceGlobe position={GLOBE.at} radius={GLOBE.r} spin={spin} trail={zip} destPin={destPin} />
				{t >= ARRIVE && <ToyTimerChip label="2 sec" position={[2.55, 3.55, 0.3]} scale={pop(ARRIVE + 0.1)} />}

				{[-1, 1].map((side) => (
					<ToySplitPhone key={side} done={checked} position={[STAGE[1] + side * PHONE_DX, 0, 0]} rotation={[0, -side * 0.3, 0]} />
				))}
				{t >= T2 && split < 0.05 && <ToyDinnerReceipt position={[STAGE[1], RECEIPT_Y, 0.2]} scale={Math.max(0.001, receiptIn)} />}
				{split >= 0.05 &&
					split < 1 &&
					[-1, 1].map((side) => (
						<ToyReceiptHalf
							key={side}
							position={[STAGE[1] + side * (0.3 + split * (PHONE_DX - 0.3)), interpolate(split, [0, 1], [RECEIPT_Y, 1.3]), 0.2 + split * 0.15]}
							rotation={[0, -side * 0.3 * split, side * split * 0.3]}
							scale={interpolate(split, [0, 0.75, 1], [1, 0.6, 0.001])}
						/>
					))}
				{checked && <ToyTimerChip label="1 sec" position={[STAGE[1], 2.75, 0.3]} scale={pop(B2 + 0.45)} />}

				<ToyShopStall position={[STALL_X, 0, 0]} scanned={scanned} />
				{/* Steps aside for the closing chips. */}
				{t >= PAY && t < CHIPS[0] && (
					<ToyTimerChip label="Paid · 1 sec" color={SUCCESS} position={[STALL_X + 2.3, 2.45, 0.5]} scale={pop(PAY + 0.1) * interpolate(t, [CHIPS[0] - 0.25, CHIPS[0]], [1, 0.001], clamp)} />
				)}
				<group position={[STAGE[2] + 3.0, 0, 0.3]}>
					<ToyTimerChip label="Seconds" position={[0, 3.45, 0]} scale={pop(CHIPS[0])} />
					<ToyChip label="Low fees" color={colors.arseSky} textColor={colors.arseNavy} height={0.42} position={[0, 2.8, 0]} scale={pop(CHIPS[1])} />
					<group position={[0, 2.15, 0]} scale={pop(CHIPS[2])}>
						<ToyChip label="Polygon" color="#8247e5" height={0.42} position={[0.2, 0, 0]} />
						<ToyCoin symbol="POL" radius={0.24} position={[-0.75, 0, 0.12]} />
					</group>
				</group>

				<group position={arse.p}>
					<ToyMascot id="arse" pose={pose} height={arse.s} yaw={yaw} />
				</group>
			</group>
		</ToySceneFrame>
	);
};
