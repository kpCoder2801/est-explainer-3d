import React from 'react';
import {random} from 'remotion';
import * as THREE from 'three';
import {Toy} from '../../kit/toy-mesh';
import type {V3} from '../../kit/toy-stage';

/** Knot loop offsets (world units) around the knot centre; seeded so every render matches. */
export const knotLoop = (seed: string, n: number) =>
	Array.from({length: n}, (_, i) => {
		const a = (i / n) * Math.PI * 2 + random(`${seed}a${i}`) * 1.4;
		const r = 0.45 + random(`${seed}r${i}`) * 0.75;
		return {
			off: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.8, (random(`${seed}z${i}`) - 0.5) * 1.6),
			ph: random(`${seed}p${i}`) * Math.PI * 2,
		};
	});
export type KnotLoop = ReturnType<typeof knotLoop>;

/**
 * Control points for one cable from `a` to `b`. Tangled (`snap` = 0) it detours through
 * the knot loop, wobbling by `wobble`; straight (`snap` = 1) every point sits evenly on
 * the a→b line. `snap` may overshoot 1 (spring) so the cable twangs past straight.
 */
export const cablePoints = (a: V3, b: V3, knot: V3, loop: KnotLoop, opts: {snap: number; tighten: number; wobble: number; t: number}) => {
	const A = new THREE.Vector3(...a);
	const B = new THREE.Vector3(...b);
	const K = new THREE.Vector3(...knot);
	const n = loop.length + 2;
	return [A, ...loop.map((l) => {
		const knotted = l.off
			.clone()
			.multiplyScalar(opts.tighten)
			.add(new THREE.Vector3(Math.sin(opts.t * 7 + l.ph), Math.cos(opts.t * 6 + l.ph), Math.sin(opts.t * 5 + l.ph * 2)).multiplyScalar(opts.wobble * opts.tighten))
			.add(K);
		return knotted;
	}), B].map((p, i) => {
		const straight = A.clone().lerp(B, i / (n - 1));
		return i === 0 || i === n - 1 ? p : p.clone().lerp(straight, opts.snap);
	});
};

/**
 * Glossy cable tube along a Catmull-Rom curve. The JSX geometry is rebuilt (and the old
 * one disposed by r3f) when the points change, which only happens while it animates.
 */
export const CableTube: React.FC<{points: THREE.Vector3[]; color: string; radius?: number; segments?: number}> = ({points, color, radius = 0.06, segments = 140}) => {
	const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
	return (
		<Toy color={color} outline={0.018}>
			<tubeGeometry args={[curve, segments, radius, 10, false]} />
		</Toy>
	);
};

/** Rounded cap so the free end of a cable reads as a plug rather than a cut pipe. */
export const CablePlug: React.FC<{at: THREE.Vector3; color: string}> = ({at, color}) => (
	<Toy color={color} position={at}>
		<sphereGeometry args={[0.1, 16, 12]} />
	</Toy>
);
