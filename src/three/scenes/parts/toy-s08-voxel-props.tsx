import React, {useMemo} from 'react';
import {random} from 'remotion';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {colors} from '../../../brand/brand-tokens';
import {Toy} from '../../kit/toy-mesh';

/** Nandu's world moves like a sprite: sample time at 10fps. */
export const stepped = (t: number) => Math.floor(t * 10) / 10;

/** Ink shell per voxel as a fraction of a voxel, grown in x/y only (same recipe as the voxel Nandu). */
const INK = 0.12;

type Ink = {color: string; depth: number; z?: number};
type VoxelPart = {color: string; geometry: THREE.BufferGeometry; outline: THREE.BufferGeometry};

/**
 * Pixel rows → one merged voxel mesh (+ ink shell) per palette entry. Art is centred
 * on x and sits with its bottom row on y = 0; sizes are in voxels of `size` world units.
 */
const buildVoxelArt = (rows: string[], palette: Record<string, Ink>, size: number): VoxelPart[] =>
	Object.entries(palette).flatMap(([ch, ink]) => {
		const cells = rows.flatMap((row, y) => [...row].map((c, x) => ({c, x, y})).filter((p) => p.c === ch));
		if (cells.length === 0) return [];
		const box = (x: number, y: number, grow: number) => {
			const g = new THREE.BoxGeometry((1 + grow * 2) * size, (1 + grow * 2) * size, ink.depth * size);
			g.translate((x + 0.5 - rows[0].length / 2) * size, (rows.length - y - 0.5) * size, (ink.z ?? 0) * size);
			return g;
		};
		return [
			{
				color: ink.color,
				geometry: mergeGeometries(cells.map((p) => box(p.x, p.y, 0))),
				outline: mergeGeometries(cells.map((p) => box(p.x, p.y, INK))),
			},
		];
	});

const VoxelArt: React.FC<{parts: VoxelPart[]}> = ({parts}) => (
	<group>
		{parts.map((p) => (
			<Toy key={p.color} color={p.color} geometry={p.geometry} outlineGeometry={p.outline} outline={0} />
		))}
	</group>
);

/** World size of one phone voxel; the phone is 11 × 14 voxels. */
export const PHONE_VOXEL = 0.13;
const PHONE_ROWS = [
	'.ggggggggg.',
	'gwwwwwwwwwg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwssssssswg',
	'gwwwwwwwwwg',
	'gwwwwkwwwwg',
	'.ggggggggg.',
];
export const PHONE_H = PHONE_ROWS.length * PHONE_VOXEL;
/** The screen is recessed behind the gold frame so it reads as a real bezel in 3D. */
const PHONE = buildVoxelArt(
	PHONE_ROWS,
	{
		g: {color: colors.nanduGold, depth: 2.2},
		w: {color: colors.nanduShade, depth: 1.8},
		s: {color: colors.tealDark, depth: 1.2, z: -0.4},
		k: {color: colors.nanduLight, depth: 2.4},
	},
	PHONE_VOXEL,
);
/** Front of the recessed screen, where the key and lock sit. */
export const SCREEN_Z = 0.2 * PHONE_VOXEL;

const KEY = buildVoxelArt(['.yyy.......', 'yy.yyyyyyyy', 'yy.yy..y.y.', '.yyy.......'], {y: {color: colors.nanduLight, depth: 1}}, PHONE_VOXEL * 0.75);
const LOCK = buildVoxelArt(
	['..www..', '.w...w.', '.w...w.', 'wwwwwww', 'www.www', 'www.www', 'wwwwwww'],
	{w: {color: colors.tealBright, depth: 1}},
	PHONE_VOXEL * 0.82,
);

export const VoxelPhone: React.FC = () => <VoxelArt parts={PHONE} />;
export const VoxelKey: React.FC = () => <VoxelArt parts={KEY} />;
export const VoxelLock: React.FC = () => <VoxelArt parts={LOCK} />;

/** A short-lived voxel cube (dust, sparkle). Shares one unit box geometry. */
const Cube: React.FC<{p: [number, number, number]; s: number; color: string; spin?: number}> = ({p, s, color, spin = 0}) => (
	<Toy color={color} position={p} scale={s} rotation={[spin, spin * 0.7, 0]} outline={false}>
		<boxGeometry args={[1, 1, 1]} />
	</Toy>
);

/**
 * Pixel dust kicked up behind a runner: a cube is born every 0.1s at the runner's heel
 * (`heelX(born)`), then rises, drifts back and shrinks — all on stepped time.
 */
export const PixelDust: React.FC<{t: number; until: number; heelX: (t: number) => number; dir: 1 | -1}> = ({t, until, heelX, dir}) => {
	const st = stepped(t);
	const life = 0.6;
	return (
		<group>
			{Array.from({length: Math.ceil(until / 0.1)}, (_, i) => {
				const born = i * 0.1;
				const age = st - born;
				if (age < 0 || age > life) return null;
				const k = age / life;
				const z = (random(`dust-z${i}`) - 0.5) * 0.6;
				const x = heelX(born) + dir * (0.25 + age * 0.9);
				return <Cube key={i} p={[x, 0.08 + age * 0.7 + random(`dust-y${i}`) * 0.1, z]} s={0.16 * (1 - k)} color={colors.nanduLight} spin={i} />;
			})}
		</group>
	);
};

/** Skid burst: a spray of cubes thrown forward from the feet when the runner brakes. */
export const SkidBurst: React.FC<{t: number; at: number; x: number; dir: 1 | -1}> = ({t, at, x, dir}) => {
	const k = stepped(t) - at;
	if (k < 0 || k > 0.7) return null;
	const p = k / 0.7;
	return (
		<group>
			{Array.from({length: 10}, (_, i) => {
				const sp = 0.6 + random(`skid-s${i}`) * 1.2;
				const up = 0.6 + random(`skid-u${i}`) * 1.1;
				const z = (random(`skid-z${i}`) - 0.5) * 1.4;
				return <Cube key={i} p={[x + dir * sp * p, Math.max(0.06, up * p - 1.6 * p * p), z * p]} s={0.14 * (1 - p * 0.8)} color={colors.nanduShade} spin={i + p * 4} />;
			})}
		</group>
	);
};

/** Lock sparkle: teal and gold cubes burst outward in 3D from `at`, spinning as they fade. */
export const VoxelSparkle: React.FC<{t: number; at: number; center: [number, number, number]}> = ({t, at, center}) => {
	const k = stepped(t) - at;
	const dirs = useMemo(
		() =>
			Array.from({length: 16}, (_, i) => {
				const a = (i / 16) * Math.PI * 2;
				return new THREE.Vector3(Math.cos(a), Math.sin(a), (random(`spk${i}`) - 0.3) * 1.2).normalize();
			}),
		[],
	);
	if (k < 0 || k > 0.7) return null;
	const p = k / 0.7;
	return (
		<group position={center}>
			{dirs.map((d, i) => {
				const r = 0.5 + p * 1.6 * (i % 2 ? 1 : 0.7);
				return <Cube key={i} p={[d.x * r, d.y * r, d.z * r]} s={0.16 * (1 - p)} color={i % 3 === 0 ? colors.nanduLight : colors.tealBright} spin={p * 6 + i} />;
			})}
		</group>
	);
};
