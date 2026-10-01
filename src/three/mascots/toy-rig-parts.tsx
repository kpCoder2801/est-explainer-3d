import React from 'react';
import * as THREE from 'three';
import {colors} from '../../brand/brand-tokens';
import {Toy} from '../kit/toy-mesh';

/**
 * Shared 3D parts for the toy mascots, in rig units (body height = 1, y up, +z toward
 * camera). Shapes follow the 2D sticker rig so the cast reads the same in every cut.
 */

export type V3 = [number, number, number];
const v = (p: V3) => new THREE.Vector3(...p);

/** Rubber-hose arm: a tube along a quadratic curve whose elbow bows away from the body and toward camera. */
export const HoseLimb: React.FC<{from: V3; to: V3; bow: V3; radius: number; color: string}> = ({from, to, bow, radius, color}) => {
	// Rebuilt every frame: the arm pose changes continuously, and r3f disposes the old tube.
	const a = v(from);
	const b = v(to);
	const curve = new THREE.QuadraticBezierCurve3(a, a.clone().add(b).multiplyScalar(0.5).add(v(bow)), b);
	return (
		<Toy color={color}>
			<tubeGeometry args={[curve, 20, radius, 10, false]} />
		</Toy>
	);
};

/** Straight stick leg with rounded ends. */
export const StickLeg: React.FC<{from: V3; to: V3; radius: number; color: string}> = ({from, to, radius, color}) => {
	const curve = new THREE.LineCurve3(v(from), v(to));
	return (
		<group>
			<Toy color={color}>
				<tubeGeometry args={[curve, 2, radius, 8, false]} />
			</Toy>
			<Toy color={color} position={from}>
				<sphereGeometry args={[radius, 10, 8]} />
			</Toy>
		</group>
	);
};

/**
 * White cartoon glove (cuff, palm, three finger bumps, thumb), modelled with the
 * fingers pointing along local -y and rotated onto the arm. `pointing` extends the
 * index finger and tucks the others.
 */
export const Glove: React.FC<{at: V3; dir: {x: number; y: number}; w: number; side: -1 | 1; pointing: boolean}> = ({at, dir, w, side, pointing}) => {
	const W = colors.white;
	const angle = Math.atan2(dir.x, -dir.y);
	return (
		<group position={at} rotation={[0, 0, angle]}>
			<Toy color={W} position={[0, -0.1 * w, 0]}>
				<cylinderGeometry args={[w * 0.92, w, w * 0.62, 18]} />
			</Toy>
			<Toy color={W} position={[-side * w * 0.95, -0.95 * w, w * 0.15]} rotation={[0, 0, side * 0.45]} scale={[0.42, 0.6, 0.42]}>
				<sphereGeometry args={[w, 16, 12]} />
			</Toy>
			<Toy color={W} position={[0, -1.2 * w, 0]} scale={[1.05, 0.95, 0.72]}>
				<sphereGeometry args={[w, 20, 14]} />
			</Toy>
			{pointing ? (
				<Toy color={W} position={[0, -2.15 * w, 0.05 * w]}>
					<capsuleGeometry args={[w * 0.3, w * 1.25, 6, 12]} />
				</Toy>
			) : (
				[-0.62, 0, 0.62].map((k) => (
					<Toy key={k} color={W} position={[k * w, -1.95 * w, 0.08 * w]}>
						<capsuleGeometry args={[w * 0.38, w * 0.32, 6, 12]} />
					</Toy>
				))
			)}
		</group>
	);
};

/** Big rounded sneaker with a white sole and toe cap, pointing toward camera (+z). */
export const Sneaker: React.FC<{at: V3; size: number; color: string; shade: string}> = ({at, size: S, color, shade}) => (
	<group position={at}>
		<Toy color={colors.white} position={[0, 0.06 * S, 0.14 * S]} scale={[0.5, 0.11, 0.78]}>
			<sphereGeometry args={[S, 22, 12]} />
		</Toy>
		<Toy color={color} position={[0, 0.27 * S, 0.12 * S]} scale={[0.44, 0.34, 0.66]}>
			<sphereGeometry args={[S, 22, 16]} />
		</Toy>
		<Toy color={shade} position={[0, 0.2 * S, 0.62 * S]} scale={[0.3, 0.17, 0.16]} outline={false}>
			<sphereGeometry args={[S, 16, 10]} />
		</Toy>
	</group>
);

/** Round cartoon eye: flattened white ball, big ink pupil, two catch-lights. */
export const RoundEye3D: React.FC<{at: V3; r: number; tall?: number; look: number; blink: number}> = ({at, r, tall = 1, look, blink}) => {
	const open = 1 - blink * 0.92;
	const px = look * r * 0.34;
	return (
		<group position={at}>
			<group scale={[1, open, 1]}>
				<Toy color={colors.white} scale={[1, tall, 0.62]}>
					<sphereGeometry args={[r, 28, 20]} />
				</Toy>
				<Toy color={colors.outline} flat outline={false} position={[px, -r * 0.12 * tall, r * 0.5]} scale={[0.5, 0.56 * tall, 0.18]}>
					<sphereGeometry args={[r, 20, 14]} />
				</Toy>
				<Toy color={colors.white} flat outline={false} position={[px + r * 0.18, r * 0.12 * tall, r * 0.62]}>
					<sphereGeometry args={[r * 0.17, 10, 8]} />
				</Toy>
				<Toy color={colors.white} flat outline={false} position={[px - r * 0.2, -r * 0.42 * tall, r * 0.6]}>
					<sphereGeometry args={[r * 0.08, 8, 6]} />
				</Toy>
			</group>
			{blink > 0.5 && <SmileArc at={[0, 0, r * 0.62]} w={r * 2} depth={0.35} thickness={r * 0.08} />}
		</group>
	);
};

/**
 * 1930s cartoon egg eye (ARSe): tall egg tilted inward, low pupil, three lashes on the
 * outer upper edge. Egg = sphere stretched taller and pinched toward the top.
 */
export const EggEye3D: React.FC<{at: V3; w: number; h: number; side: -1 | 1; look: number; blink: number}> = ({at, w, h, side, look, blink}) => {
	const open = 1 - blink * 0.9;
	const px = look * w * 0.3;
	return (
		<group position={at} rotation={[0, 0, (side * 10 * Math.PI) / 180]}>
			<group scale={[1, open, 1]}>
				<Toy color={colors.white} scale={[w, h, w * 0.7]}>
					<sphereGeometry args={[1, 28, 20]} />
				</Toy>
				<Toy color={colors.outline} flat outline={false} position={[px, -h * 0.3, w * 0.58]} scale={[w * 0.55, h * 0.5, w * 0.16]}>
					<sphereGeometry args={[1, 20, 14]} />
				</Toy>
				<Toy color={colors.white} flat outline={false} position={[px + w * 0.18, -h * 0.08, w * 0.72]}>
					<sphereGeometry args={[w * 0.17, 10, 8]} />
				</Toy>
			</group>
			{blink < 0.5
				? [0, 1, 2].map((i) => {
						const a = ((90 - side * (30 + i * 22)) * Math.PI) / 180;
						return (
							<Toy
								key={i}
								color={colors.outline}
								flat
								outline={false}
								position={[Math.cos(a) * w * 1.02, Math.sin(a) * h * 1.0, 0]}
								rotation={[0, 0, a - Math.PI / 2 + side * 0.5]}
							>
								<capsuleGeometry args={[w * 0.06, w * 0.32, 4, 8]} />
							</Toy>
						);
					})
				: <SmileArc at={[0, -h * 0.25, w * 0.7]} w={w * 2} depth={0.4} thickness={w * 0.08} />}
		</group>
	);
};

/** Ink arc used for a closed smile or a closed eyelid. `depth` = sag relative to width. */
export const SmileArc: React.FC<{at: V3; w: number; depth: number; thickness: number; color?: string}> = ({at, w, depth, thickness, color = colors.outline}) => {
	// Chord w with sag depth*w → circle radius and arc angle.
	const s = depth * w;
	const R = (w * w) / (8 * s) + s / 2;
	const arc = 2 * Math.asin(Math.min(1, w / 2 / R));
	return (
		<group position={at}>
			<Toy color={color} flat outline={false} position={[0, R - s, 0]} rotation={[0, 0, -Math.PI / 2 - arc / 2]}>
				<torusGeometry args={[R, thickness, 8, 24, arc]} />
			</Toy>
		</group>
	);
};

/** Mouth: closed = ink smile, open = dark D-shaped opening with a pink tongue. */
export const Mouth3D: React.FC<{at: V3; w: number; open: number; tiltX?: number}> = ({at, w, open, tiltX = 0}) => (
	<group position={at} rotation={[tiltX, 0, 0]}>
		{open < 0.08 ? (
			<SmileArc at={[0, 0, 0]} w={w} depth={0.3} thickness={w * 0.065} />
		) : (
			<group position={[0, -w * 0.4 * open, 0]}>
				<Toy color="#3a1218" outline={w * 0.05} scale={[w * 0.52, w * (0.1 + 0.42 * open), w * 0.14]}>
					<sphereGeometry args={[1, 20, 14]} />
				</Toy>
				<Toy color="#ef6f78" flat outline={false} position={[0, -w * 0.28 * open, w * 0.11]} scale={[w * 0.26, Math.min(w * 0.14, w * 0.2 * open), w * 0.05]}>
					<sphereGeometry args={[1, 16, 10]} />
				</Toy>
			</group>
		)}
	</group>
);

/** Soft contact shadow (radial alpha) — deterministic and independent of the scene's lights. */
let blobTexture: THREE.Texture | null = null;
const getBlobTexture = () => {
	if (!blobTexture) {
		const c = document.createElement('canvas');
		c.width = c.height = 128;
		const ctx = c.getContext('2d')!;
		const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
		g.addColorStop(0, 'rgba(0,0,0,0.55)');
		g.addColorStop(0.55, 'rgba(0,0,0,0.3)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 128, 128);
		blobTexture = new THREE.CanvasTexture(c);
	}
	return blobTexture;
};

export const BlobShadow: React.FC<{width: number; depth: number; strength?: number}> = ({width, depth, strength = 1}) => (
	<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} scale={[width, depth, 1]} renderOrder={-1}>
		<planeGeometry args={[1, 1]} />
		<meshBasicMaterial map={getBlobTexture()} transparent opacity={strength} depthWrite={false} />
	</mesh>
);
