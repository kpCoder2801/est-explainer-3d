import React from 'react';
import * as THREE from 'three';
import {blinkAmount, bodyMotion, MascotPose} from '../../mascots/shared/mascot-motion';
import {BlobShadow, Glove, HoseLimb, Sneaker, StickLeg, V3} from './toy-rig-parts';

type P2 = {x: number; y: number};

/**
 * A toy mascot's proportions in body space: origin at the bottom-centre of the body,
 * y up, body height = 1. Mirrors the 2D `VectorRigSpec` so the same `bodyMotion`
 * joint angles drive both.
 */
export type ToyRigSpec = {
	bodyWidth: number;
	shoulderL: P2;
	shoulderR: P2;
	/** How far in front of the body centre the shoulders sit (+z). */
	shoulderZ: number;
	hipL: P2;
	hipR: P2;
	armLength: number;
	legLength: number;
	limbRadius: number;
	limbColor: string;
	legRadius: number;
	legColor: string;
	shoeColor: string;
	shoeShade: string;
	shoeSize: number;
	/** Extra outward angle for bodies whose sides slope outward (a triangle hides hanging arms). */
	armSpread?: number;
	renderBody: (face: {mouth: number; blink: number; look: number; time: number}) => React.ReactNode;
};

const deg = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);
/** Glove size relative to the arm's radius, shared by the drawn glove and the hand helper. */
const GLOVE = 2.9;

/**
 * World position of a mascot's right palm, for props it holds (cable ends, a paint
 * pole). Mirrors the rig's own arm maths: arm angle, body bob/hop/tilt/squash,
 * facing mirror, height and yaw — so a held prop stays on the glove in every pose.
 */
export const toyRightHandWorld = (spec: ToyRigSpec, pose: MascotPose, at: [number, number, number], height: number, yaw?: number) => {
	const m = bodyMotion(pose.action, pose.actionTime, pose.time);
	const a = Math.min(m.armR + (spec.armSpread ?? 0), 150) * deg;
	const reach = spec.armLength + spec.limbRadius * GLOVE * 1.2;
	const p = new THREE.Vector3(spec.shoulderR.x + Math.sin(a) * reach, spec.shoulderR.y - Math.cos(a) * reach, spec.shoulderZ + 0.04);
	p.multiply(new THREE.Vector3(m.squashX, m.squashY, m.squashX)).applyAxisAngle(new THREE.Vector3(0, 0, 1), -m.tilt * deg);
	const lift = spec.legLength - Math.min(spec.hipL.y, spec.hipR.y);
	p.y += lift - m.bodyY + m.hop;
	p.x *= pose.facing;
	return p.multiplyScalar(height).applyAxisAngle(UP, yaw ?? pose.facing * 0.32).add(new THREE.Vector3(...at));
};

/**
 * Generic 3D rig. The returned group stands on y = 0 and is `height` world units tall
 * (body only — legs extend below, as in the 2D rig). `facing` mirrors like the 2D cut;
 * `yaw` turns the toy a little toward its facing direction so it reads as 3D.
 */
export const ToyMascotRig: React.FC<{spec: ToyRigSpec; pose: MascotPose; height: number; yaw?: number}> = ({spec, pose, height, yaw}) => {
	const m = bodyMotion(pose.action, pose.actionTime, pose.time);
	const blink = blinkAmount(pose.time, pose.seed);
	const groundBody = Math.min(spec.hipL.y, spec.hipR.y) - spec.legLength;
	const lift = -groundBody;
	const hop = m.hop;
	const bob = -m.bodyY;

	const arm = (side: -1 | 1, angle: number) => {
		const s = side < 0 ? spec.shoulderL : spec.shoulderR;
		const a = Math.min(angle + (spec.armSpread ?? 0), 150) * deg;
		const dir = {x: Math.sin(a) * side, y: -Math.cos(a)};
		const from: V3 = [s.x, s.y, spec.shoulderZ];
		const to: V3 = [s.x + dir.x * spec.armLength, s.y + dir.y * spec.armLength, spec.shoulderZ + 0.04];
		// Elbow bows outward from the body (perpendicular to the arm) and slightly toward camera.
		const bend = spec.limbRadius * 1.3;
		const bow: V3 = [-dir.y * bend * side, dir.x * bend * side, 0.05];
		return (
			<group key={side}>
				<HoseLimb from={from} to={to} bow={bow} radius={spec.limbRadius} color={spec.limbColor} />
				<Glove at={to} dir={dir} w={spec.limbRadius * GLOVE} side={side} pointing={side > 0 && pose.action === 'point'} />
			</group>
		);
	};

	const leg = (side: -1 | 1, angle: number) => {
		const h = side < 0 ? spec.hipL : spec.hipR;
		const swing = Math.sin(angle * deg) * spec.legLength * 0.9;
		const footLift = Math.max(0, Math.sin(angle * deg)) * spec.legLength * 0.3;
		const footY = groundBody + hop + footLift;
		const hip: V3 = [h.x, h.y + bob + hop, 0];
		const ankle: V3 = [h.x * 1.05, footY + spec.shoeSize * 0.3, swing];
		return (
			<group key={side}>
				<StickLeg from={hip} to={ankle} radius={spec.legRadius} color={spec.legColor} />
				<Sneaker at={[ankle[0], footY, swing]} size={spec.shoeSize} color={spec.shoeColor} shade={spec.shoeShade} />
			</group>
		);
	};

	return (
		<group scale={height} rotation={[0, yaw ?? pose.facing * 0.32, 0]}>
			<BlobShadow width={spec.bodyWidth * 1.05 * (1 - hop * 1.2)} depth={spec.bodyWidth * 0.55 * (1 - hop * 1.2)} strength={1 - hop * 1.5} />
			<group position={[0, lift, 0]} scale={[pose.facing, 1, 1]}>
				{leg(-1, m.legL)}
				{leg(1, m.legR)}
				<group position={[0, bob + hop, 0]} rotation={[0, 0, -m.tilt * deg]} scale={[m.squashX, m.squashY, m.squashX]}>
					{spec.renderBody({mouth: pose.mouth, blink, look: pose.look * pose.facing, time: pose.time})}
					{arm(-1, m.armL)}
					{arm(1, m.armR)}
				</group>
			</group>
		</group>
	);
};
