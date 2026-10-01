import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import {colors} from '../../brand/brand-tokens';
import {ESTABLE_LOGO_VERTICES} from '../../mascots/estable-mascot';
import {weldForOutline} from './toy-materials';
import {Toy} from './toy-mesh';

type GroupProps = ThreeElements['group'];

/** Extrusion depth and bevel in logo units (logo is 1 × 1, origin at bottom-centre). */
const DEPTH = 0.16;
const BEVEL = 0.045;

/** Logo space (1024 units, y down) → unit space (y up, centred on x, bottom on y = 0). */
const toUnit = ([x, y]: [number, number]) => new THREE.Vector2((x - 512) / 1024, (1024 - y) / 1024);

/**
 * The Estable mark as a filleted polygon — every corner softened by a quadratic
 * fillet, the 3D counterpart of the 2D rig's round stroke joins. Radius is capped by
 * edge length so the mark's short chamfer edges keep their shape. Shared by the
 * Estable mascot body and the hero logo, so both have one silhouette.
 */
export const roundedLogoShape = (radius: number) => {
	const pts = ESTABLE_LOGO_VERTICES.map(toUnit);
	const shape = new THREE.Shape();
	pts.forEach((p, i) => {
		const prev = pts[(i - 1 + pts.length) % pts.length];
		const next = pts[(i + 1) % pts.length];
		const r = Math.min(radius, p.distanceTo(prev) * 0.45, p.distanceTo(next) * 0.45);
		const a = p.clone().add(prev.clone().sub(p).normalize().multiplyScalar(r));
		const b = p.clone().add(next.clone().sub(p).normalize().multiplyScalar(r));
		if (i === 0) shape.moveTo(a.x, a.y);
		else shape.lineTo(a.x, a.y);
		shape.quadraticCurveTo(p.x, p.y, b.x, b.y);
	});
	shape.closePath();
	return shape;
};

/** Built once at module load and shared by every logo instance. */
const LOGO = (() => {
	const g = new THREE.ExtrudeGeometry(roundedLogoShape(0.025), {
		depth: DEPTH,
		bevelEnabled: true,
		bevelThickness: BEVEL,
		bevelSize: 0.018,
		bevelSegments: 5,
		curveSegments: 6,
	});
	g.translate(0, 0, -DEPTH / 2);
	return {geometry: g, outline: weldForOutline(g)};
})();

/** Front face z of a unit logo (extrusion + bevel), for decals placed on it. */
export const LOGO_FRONT = DEPTH / 2 + BEVEL;

/**
 * Glossy extruded Estable triangle mark. `size` is its height in world units; it
 * stands on its group origin (bottom-centre), so it can sit on a block or float.
 */
export const ToyEstableLogo: React.FC<GroupProps & {size: number; color?: string}> = ({size, color = colors.teal, ...group}) => (
	<group {...group}>
		<Toy color={color} geometry={LOGO.geometry} outlineGeometry={LOGO.outline} outline={0.012} scale={size} />
	</group>
);
