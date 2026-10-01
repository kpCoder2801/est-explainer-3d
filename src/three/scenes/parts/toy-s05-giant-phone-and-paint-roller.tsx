import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw} from '../../kit/toy-canvas-textures';
import {CanvasFace, ToySlab} from '../../kit/toy-props';
import {Toy} from '../../kit/toy-mesh';
import type {V3} from '../../kit/toy-stage';
import {SCREEN_UNITS} from './toy-s05-wallet-screen-canvas';

type GroupProps = ThreeElements['group'];

/** Giant phone in world units: the screen keeps the 2D wallet layout's aspect. */
export const SCREEN_W = 1.9;
export const SCREEN_H = (SCREEN_W * SCREEN_UNITS.h) / SCREEN_UNITS.w;
export const PHONE = {w: SCREEN_W + 0.22, h: SCREEN_H + 0.42, d: 0.22};
/** The phone's centre sits this high: it rests in the groove of its desk stand. */
export const PHONE_CY = 0.2 + PHONE.h / 2;
/** Roller head sits just in front of the glass. */
const ROLLER_Z = PHONE.d / 2 + 0.15;
const ROLLER_R = 0.12;
const ROLLER_LEN = SCREEN_W + 0.16;
/** End of the roller's short handle frame, relative to the roller axis. */
const SOCKET: V3 = [-ROLLER_LEN / 2 - 0.16, -0.32, 0.22];

/** Glossy dark phone on a teal desk stand, its screen a live canvas face. */
export const ToyGiantPhone: React.FC<GroupProps & {draw: CanvasDraw; drawKey: string}> = ({draw, drawKey, ...group}) => (
	<group {...group}>
		<ToySlab w={1.7} h={0.26} d={0.8} r={0.1} color={colors.tealDark} position={[0, 0.13, -0.05]} />
		<group position={[0, PHONE_CY, 0]}>
			<ToySlab w={PHONE.w} h={PHONE.h} d={PHONE.d} r={0.2} color="#1f2a2c" />
			<CanvasFace w={SCREEN_W} h={SCREEN_H} position={[0, 0, PHONE.d / 2 + 0.003]} draw={draw} drawKey={drawKey} />
			{/* Speaker slot in the top bezel and two side buttons, so the slab reads as a phone from any angle. */}
			<ToySlab w={0.42} h={0.07} d={0.03} r={0.035} color={colors.outline} outline={false} position={[0, PHONE.h / 2 - 0.11, PHONE.d / 2]} />
			<ToySlab w={0.05} h={0.42} d={0.08} r={0.025} color="#2e3b3d" position={[PHONE.w / 2 + 0.015, 0.9, 0]} />
			<ToySlab w={0.05} h={0.26} d={0.08} r={0.025} color="#2e3b3d" position={[PHONE.w / 2 + 0.015, 0.4, 0]} />
		</group>
	</group>
);

/** Phone-local height of the roller axis for a pass progress `p` (−0.04 above the screen … 0.96 near its bottom). */
export const rollerLocalY = (p: number) => PHONE_CY + SCREEN_H / 2 - p * SCREEN_H;

/** Roller head (nap cylinder, end caps, wire frame) in phone-local space at height `y`; `scale` pops it on and off. */
export const ToyRollerHead: React.FC<{y: number; scale: number; color: string; spin: number}> = ({y, scale, color, spin}) => (
	<group position={[0, y, 0]} scale={scale}>
		<group position={[0, 0, ROLLER_Z]}>
		<group rotation={[spin, 0, Math.PI / 2]}>
			<Toy color={color}>
				<cylinderGeometry args={[ROLLER_R, ROLLER_R, ROLLER_LEN, 32]} />
			</Toy>
			{[-1, 1].map((s) => (
				<Toy key={s} color={colors.tealLight} position={[0, (s * ROLLER_LEN) / 2, 0]}>
					<cylinderGeometry args={[ROLLER_R * 0.55, ROLLER_R * 0.55, 0.06, 20]} />
				</Toy>
			))}
		</group>
		<Rod from={[-ROLLER_LEN / 2, 0, 0]} to={[SOCKET[0], 0, 0]} radius={0.028} color={colors.tealLight} />
		<Rod from={[SOCKET[0], 0, 0]} to={SOCKET} radius={0.028} color={colors.tealLight} />
		</group>
	</group>
);

/** A straight glossy rod between two points (unit cylinder scaled, so no per-frame geometry). */
const Rod: React.FC<{from: V3; to: V3; radius: number; color: string}> = ({from, to, radius, color}) => {
	const a = new THREE.Vector3(...from);
	const d = new THREE.Vector3(...to).sub(a);
	const len = Math.max(0.001, d.length());
	const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
	const mid = a.addScaledVector(d, len / 2);
	return (
		<Toy color={color} position={mid} quaternion={q} scale={[1, len, 1]} outline={0.012}>
			<cylinderGeometry args={[radius, radius, 1, 14]} />
		</Toy>
	);
};
