import React from 'react';
import * as THREE from 'three';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {colors} from '../../brand/brand-tokens';
import {ARSE_MOLECULE_PATHS} from '../../mascots/arse-mascot';
import {MascotPose} from '../../mascots/shared/mascot-motion';
import {Toy} from '../kit/toy-mesh';
import {ToyMascotRig, ToyRigSpec} from './toy-mascot-rig';
import {EggEye3D, Mouth3D} from './toy-rig-parts';

/** Plump coin body: an ellipsoid centred at (0, 0.5) with radius 0.5 and a shallower depth. */
const R = 0.5;
const DEPTH_R = 0.39;
const CY = 0.5;

/** Front surface depth of the body at (x, y) in body space. */
const surfaceZ = (x: number, y: number) => DEPTH_R * Math.sqrt(Math.max(0, 1 - (x * x + (y - CY) * (y - CY)) / (R * R)));

/** Surface tilt about x at height y on the centre line, so flat details face along the normal. */
const surfaceTiltX = (y: number) => -Math.atan2((y - CY) / (R * R), surfaceZ(0, y) / (DEPTH_R * DEPTH_R));

/**
 * The logo molecule as a raised white inlay: the SVG paths are extruded thin, then
 * every vertex is pushed onto the curved front of the body so it hugs the surface
 * like a printed-and-domed toy decal.
 */
const MOLECULE = (() => {
	const loader = new SVGLoader();
	const svg = `<svg xmlns="http://www.w3.org/2000/svg">${ARSE_MOLECULE_PATHS.map((d) => `<path d="${d}"/>`).join('')}<circle cx="125" cy="133" r="15"/></svg>`;
	const toBody = (p: THREE.Vector2) => new THREE.Vector2(p.x / 250 - 0.5, 1 - p.y / 250);
	const shapes = loader.parse(svg).paths.flatMap((path) =>
		SVGLoader.createShapes(path).map((s) => {
			const {shape, holes} = s.extractPoints(24);
			const out = new THREE.Shape(shape.map(toBody));
			out.holes = holes.map((h) => new THREE.Path(h.map(toBody)));
			return out;
		}),
	);
	const g = new THREE.ExtrudeGeometry(shapes, {depth: 1, bevelEnabled: false, curveSegments: 24});
	const pos = g.attributes.position;
	const THICK = 0.022;
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i);
		const y = pos.getY(i);
		pos.setZ(i, surfaceZ(x, y) - 0.006 + pos.getZ(i) * THICK);
	}
	g.computeVertexNormals();
	return g;
})();

const EYES = [
	{x: -0.204, y: 0.944, side: -1 as const},
	{x: 0.204, y: 0.944, side: 1 as const},
];
const EYE_W = 0.108;
const EYE_H = 0.148;
/** Above the molecule's top lobe (logo y 46), as in the 2D rig. */
const MOUTH_Y = 0.86;

const spec: ToyRigSpec = {
	bodyWidth: 1,
	shoulderL: {x: -0.444, y: 0.4},
	shoulderR: {x: 0.444, y: 0.4},
	shoulderZ: surfaceZ(0.444, 0.4) * 0.6,
	hipL: {x: -0.14, y: 0.032},
	hipR: {x: 0.14, y: 0.032},
	armLength: 0.24,
	legLength: 0.232,
	limbRadius: 0.021,
	limbColor: colors.arseSky,
	legRadius: 0.016,
	legColor: colors.arseSky,
	shoeColor: colors.arseBlue,
	shoeShade: colors.arseShade,
	shoeSize: 0.24,
	renderBody: ({mouth, blink, look}) => (
		<group>
			<Toy color={colors.arseBlue} position={[0, CY, 0]} scale={[1, 1, DEPTH_R / R]}>
				<sphereGeometry args={[R, 48, 36]} />
			</Toy>
			<Toy color={colors.white} geometry={MOLECULE} outline={false} />
			{/* Egg eye bumps in body colour pop over the top rim. */}
			{EYES.map((e) => (
				<Toy key={e.x} color={colors.arseBlue} position={[e.x, e.y, 0.04]} rotation={[0, 0, (e.side * 10 * Math.PI) / 180]} scale={[EYE_W * 1.28, EYE_H * 1.28, EYE_W * 0.8]}>
					<sphereGeometry args={[1, 28, 20]} />
				</Toy>
			))}
			{EYES.map((e) => (
				<EggEye3D key={e.x} at={[e.x, e.y, 0.11]} w={EYE_W} h={EYE_H} side={e.side} look={look} blink={blink} />
			))}
			<Mouth3D at={[0, MOUTH_Y, surfaceZ(0, MOUTH_Y) + 0.012]} w={0.15} open={mouth} tiltX={surfaceTiltX(MOUTH_Y) * 0.45} />
		</group>
	),
};

export const ToyArseMascot: React.FC<{pose: MascotPose; height: number; yaw?: number}> = (props) => <ToyMascotRig spec={spec} {...props} />;
