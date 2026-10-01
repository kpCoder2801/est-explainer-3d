import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo} from 'react';
import {random} from 'remotion';
import * as THREE from 'three';
import {colors} from '../../brand/brand-tokens';

export type V3 = [number, number, number];
export type CameraShot = {position: V3; target: V3; fov?: number};

/** Places the scene camera every frame (shots are pure functions of scene time). */
export const SceneCamera: React.FC<CameraShot> = ({position, target, fov = 30}) => {
	const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
	useLayoutEffect(() => {
		camera.position.set(...position);
		camera.fov = fov;
		camera.lookAt(...target);
		camera.updateProjectionMatrix();
	});
	return null;
};

const radialTexture = (inner: string, outer: string) => {
	const c = document.createElement('canvas');
	c.width = c.height = 256;
	const ctx = c.getContext('2d')!;
	const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
	g.addColorStop(0, inner);
	g.addColorStop(1, outer);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 256, 256);
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
};

/**
 * The 3D hero set: a dark studio floor that catches real shadows, a teal glow pool
 * under the action, a soft glowing backdrop and the brand node network floating in
 * depth so camera moves get parallax.
 */
export const ToyStage: React.FC<{time: number; glow?: string; glowX?: number; seed?: string; reveal?: number}> = ({
	time,
	glow = colors.tealBright,
	glowX = 0,
	seed = 'net',
	reveal = 1,
}) => {
	const pool = useMemo(() => radialTexture('rgba(255,255,255,0.55)', 'rgba(255,255,255,0)'), []);
	return (
		<group>
			<color attach="background" args={[colors.bg]} />
			<fog attach="fog" args={[colors.bg, 9, 24]} />
			{/* Unlit and not tone-mapped (Neutral tone mapping crushes near-black), so it fades exactly into the fog colour; a shadow-only layer catches the toys' shadows. */}
			<mesh rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[120, 120]} />
				<meshBasicMaterial color="#1a1c1c" toneMapped={false} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
				<planeGeometry args={[120, 120]} />
				<shadowMaterial opacity={0.4} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[glowX, 0.004, 0]}>
				<planeGeometry args={[9, 6]} />
				<meshBasicMaterial map={pool} color={glow} transparent opacity={0.16 * reveal} depthWrite={false} toneMapped={false} />
			</mesh>
			{/* Behind the fog's far distance so the floor has fully faded into the backdrop before it. */}
			<mesh position={[glowX * 2, 5, -30]}>
				<planeGeometry args={[56, 34]} />
				<meshBasicMaterial map={pool} color={glow} transparent opacity={0.3 * reveal} depthWrite={false} toneMapped={false} fog={false} />
			</mesh>
			<NodeNetwork time={time} seed={seed} opacity={reveal} />
		</group>
	);
};

/** Drifting nodes + proximity links behind the set, the 3D twin of `BrandNetworkBackground`. */
const NodeNetwork: React.FC<{time: number; seed: string; opacity: number; count?: number}> = ({time, seed, opacity, count = 70}) => {
	const nodes = useMemo(
		() =>
			Array.from({length: count}, (_, i) => ({
				x: (random(`${seed}x${i}`) - 0.5) * 30,
				y: random(`${seed}y${i}`) * 11 + 0.6,
				z: -5 - random(`${seed}z${i}`) * 9,
				ph: random(`${seed}p${i}`) * Math.PI * 2,
				sp: 0.15 + random(`${seed}s${i}`) * 0.35,
				r: 0.025 + random(`${seed}r${i}`) * 0.04,
			})),
		[count, seed],
	);
	// One preallocated buffer, rewritten each frame, so long renders don't leak GPU buffers.
	const lineGeo = useMemo(() => {
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * count * 3), 3));
		return g;
	}, [count]);
	const pts = nodes.map((n) => new THREE.Vector3(n.x + Math.sin(time * n.sp + n.ph) * 0.35, n.y + Math.cos(time * n.sp * 0.8 + n.ph) * 0.25, n.z));
	const attr = lineGeo.getAttribute('position') as THREE.BufferAttribute;
	let v = 0;
	for (let i = 0; i < pts.length; i++)
		for (let j = i + 1; j < pts.length; j++)
			if (pts[i].distanceTo(pts[j]) < 3.2) {
				attr.setXYZ(v++, pts[i].x, pts[i].y, pts[i].z);
				attr.setXYZ(v++, pts[j].x, pts[j].y, pts[j].z);
			}
	attr.needsUpdate = true;
	lineGeo.setDrawRange(0, v);
	return (
		<group>
			<lineSegments geometry={lineGeo}>
				<lineBasicMaterial color={colors.tealBright} transparent opacity={0.16 * opacity} depthWrite={false} />
			</lineSegments>
			{pts.map((p, i) => (
				<mesh key={i} position={p}>
					<sphereGeometry args={[nodes[i].r, 8, 6]} />
					<meshBasicMaterial color={colors.tealBright} transparent opacity={0.55 * opacity} toneMapped={false} />
				</mesh>
			))}
		</group>
	);
};
