import React from 'react';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {colors} from '../../brand/brand-tokens';
import {blinkAmount, bodyMotion, MascotPose} from '../../mascots/shared/mascot-motion';
import {BEAK_CELLS, BODY_CELLS, EYE_CELL, LEG_BACK, LEG_FRONT, NANDU_COLS, NANDU_ROWS, WING_CELLS} from '../../mascots/shared/nandu-pixel-map';
import {Toy} from '../kit/toy-mesh';
import {BlobShadow} from './toy-rig-parts';

/** One voxel per logo pixel; the bird is NANDU_ROWS voxels tall (= rig height 1). */
const C = 1 / NANDU_ROWS;
const BODY_DEPTH = 3;
const LEG_DEPTH = 1;
/**
 * Ink shell around each voxel, as a fraction of a voxel. Grown in x/y only: growing
 * in depth would poke every neighbour's shell through the shared front face as seams.
 */
const INK = 0.12;
/** Pixel art moves on twos-and-threes: sample motion at 10fps and snap to half-voxels, like the 2D rig. */
const STEP_FPS = 10;
const snap = (v: number) => Math.round(v / (C / 2)) * (C / 2);

type Cell = {x: number; y: number; w?: number; h?: number};
const toCells = (list: Array<[number, number]>): Cell[] => list.map(([x, y]) => ({x, y}));

/** Pixel grid (y down) → body space (y up, centred on x), as a box of `depth` voxels. */
const voxelBox = (c: Cell, depth: number, grow = 0) => {
	const w = (c.w ?? 1) + grow * 2;
	const h = (c.h ?? 1) + grow * 2;
	const d = depth;
	const g = new THREE.BoxGeometry(w * C, h * C, d * C);
	g.translate((c.x + (c.w ?? 1) / 2 - NANDU_COLS / 2) * C, (NANDU_ROWS - c.y - (c.h ?? 1) / 2) * C, 0);
	return g;
};

/** A merged voxel group plus its ink shell (every voxel grown a little, drawn back-faced). */
const voxels = (cells: Cell[], depth: number) => ({
	geometry: mergeGeometries(cells.map((c) => voxelBox(c, depth))),
	outline: mergeGeometries(cells.map((c) => voxelBox(c, depth, INK))),
});

const BODY_CLOSED = voxels(toCells(BODY_CELLS), BODY_DEPTH);
const BODY_OPEN = voxels(
	[...toCells(BODY_CELLS.filter(([x, y]) => !BEAK_CELLS.has(`${x},${y}`))), {x: 0, y: 0.55, w: 2, h: 0.55}],
	BODY_DEPTH,
);
const JAW = voxels([{x: 0, y: 1.5, w: 2, h: 0.5}], BODY_DEPTH - 0.6);
const LEG_F = voxels(toCells(LEG_FRONT), LEG_DEPTH);
const LEG_B = voxels(toCells(LEG_BACK), LEG_DEPTH);
// At rest the wing is the logo's open notch; flapping pops it up out of the body.
const WING_UP = voxels(
	[...WING_CELLS.map(([x, y]) => ({x: x + 1, y: y - 3})), {x: WING_CELLS[1][0] + 1, y: WING_CELLS[1][1] - 4}, {x: WING_CELLS[0][0] + 1, y: WING_CELLS[0][1] - 2}],
	BODY_DEPTH + 0.6,
);

const Vox: React.FC<{set: {geometry: THREE.BufferGeometry; outline: THREE.BufferGeometry}; color: string; position?: [number, number, number]}> = ({set, color, position}) => (
	<Toy color={color} geometry={set.geometry} outlineGeometry={set.outline} outline={0} position={position} />
);

/** Square pixel eye on both flanks: white + ink pupil + catch-light, the 2D recipe as thin slabs. */
/** `look` is in the mirrored local frame (the caller cancels the facing flip). */
const PixelEye: React.FC<{look: number; blink: boolean; side: 1 | -1}> = ({look, blink, side}) => {
	const cx = (EYE_CELL[0] + 0.5 - NANDU_COLS / 2) * C;
	const cy = (NANDU_ROWS - EYE_CELL[1] - 0.45) * C;
	const z = side * (BODY_DEPTH / 2 + 0.06) * C;
	const slab = (w: number, h: number, x: number, y: number, dz: number, color: string) => (
		<Toy color={color} flat outline={false} position={[cx + x * C, cy + y * C, z + side * dz * C]}>
			<boxGeometry args={[w * C, h * C, 0.1 * C]} />
		</Toy>
	);
	if (blink) return slab(1.8, 0.35, 0, -0.1, 0, colors.outline);
	return (
		<group>
			{slab(2.3, 2.3, 0, 0, -0.02, colors.outline)}
			{slab(1.8, 1.8, 0, 0, 0.02, colors.white)}
			{slab(0.9, 1, look * 0.3 - 0.05, -0.15, 0.06, colors.outline)}
			{slab(0.3, 0.3, look * 0.3 + 0.1, 0.1, 0.1, colors.white)}
		</group>
	);
};

/**
 * Nandu as a voxel toy: the 8-bit logo extruded into chunky blocks, legs one voxel
 * thick and offset in depth so the stride reads in 3D. Motion is the shared
 * vocabulary, stepped like the 2D pixel rig.
 */
export const ToyNanduMascot: React.FC<{pose: MascotPose; height: number; yaw?: number}> = ({pose, height, yaw}) => {
	const stepTime = Math.floor(pose.time * STEP_FPS) / STEP_FPS;
	const stepAction = Math.floor(pose.actionTime * STEP_FPS) / STEP_FPS;
	const m = bodyMotion(pose.action, stepAction, stepTime);
	const blink = blinkAmount(pose.time, pose.seed) > 0.4;
	const lift = snap(m.hop - m.bodyY);
	const walking = pose.action === 'walk';
	const stride = walking ? (Math.floor(pose.actionTime * 6) % 2 === 0 ? 1 : -1) : 0;
	const tucked = m.hop > 0.05;
	const wingUp = m.armR > 70 && Math.floor(pose.actionTime * 8) % 2 === 0;
	const mouthOpen = pose.mouth > 0.3;
	const look = Math.round(pose.look * 2) / 2;
	const legZ = (LEG_DEPTH / 2 + 0.3) * C;

	return (
		// The logo faces left, so facing right mirrors it (as in the 2D rig).
		<group scale={height} rotation={[0, yaw ?? -pose.facing * 0.5, 0]}>
			<BlobShadow width={0.6 * (1 - m.hop * 1.2)} depth={0.32 * (1 - m.hop * 1.2)} strength={1 - m.hop * 1.5} />
			<group scale={[-pose.facing, 1, 1]} position={[0, lift, 0]}>
				<Vox set={LEG_F} color={colors.nanduShade} position={[stride * C, tucked ? C : 0, legZ]} />
				<Vox set={LEG_B} color={colors.nanduShade} position={[-stride * C, tucked || stride < 0 ? C : 0, -legZ]} />
				<Vox set={mouthOpen ? BODY_OPEN : BODY_CLOSED} color={colors.nanduGold} />
				{mouthOpen && <Vox set={JAW} color={colors.nanduShade} />}
				{wingUp && <Vox set={WING_UP} color={colors.nanduLight} />}
				<PixelEye look={look * -pose.facing} blink={blink} side={1} />
				<PixelEye look={look * -pose.facing} blink={blink} side={-1} />
			</group>
		</group>
	);
};
