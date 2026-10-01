import React from 'react';
import * as THREE from 'three';
import {colors} from '../../brand/brand-tokens';
import {MascotPose} from '../../mascots/shared/mascot-motion';
import {roundedLogoShape} from '../kit/toy-estable-logo';
import {weldForOutline} from '../kit/toy-materials';
import {Toy} from '../kit/toy-mesh';
import {ToyMascotRig, ToyRigSpec, toyRightHandWorld} from './toy-mascot-rig';
import {Mouth3D, RoundEye3D} from './toy-rig-parts';

const DEPTH = 0.2;
const BEVEL = 0.05;
/** Front face of the slab (extrusion + bevel), where the face details sit. */
const FRONT = DEPTH / 2 + BEVEL;

const BODY = (() => {
	const g = new THREE.ExtrudeGeometry(roundedLogoShape(0.03), {
		depth: DEPTH,
		bevelEnabled: true,
		bevelThickness: BEVEL,
		bevelSize: 0.022,
		bevelSegments: 5,
		curveSegments: 6,
	});
	g.translate(0, 0, -DEPTH / 2);
	return {geometry: g, outline: weldForOutline(g)};
})();

const EYES: Array<[number, number]> = [
	[-0.198, 0.893],
	[0.198, 0.893],
];
const EYE_R = 0.094;
const EYE_TALL = 1.12;

const spec: ToyRigSpec = {
	bodyWidth: 1,
	shoulderL: {x: -0.237, y: 0.453},
	shoulderR: {x: 0.237, y: 0.453},
	shoulderZ: FRONT * 0.6,
	armSpread: 22,
	hipL: {x: -0.156, y: 0.023},
	hipR: {x: 0.156, y: 0.023},
	armLength: 0.244,
	legLength: 0.225,
	limbRadius: 0.021,
	limbColor: colors.tealBright,
	legRadius: 0.016,
	legColor: colors.tealLight,
	shoeColor: colors.teal,
	shoeShade: colors.tealShade,
	shoeSize: 0.24,
	renderBody: ({mouth, blink, look}) => (
		<group>
			<Toy color={colors.teal} geometry={BODY.geometry} outlineGeometry={BODY.outline} />
			{/* Teal eye bumps the eyes sit on, part of the silhouette as in the 2D mark. */}
			{EYES.map(([x, y]) => (
				<Toy key={x} color={colors.teal} position={[x, y, 0]} scale={[1, EYE_TALL, 0.85]}>
					<sphereGeometry args={[EYE_R * 1.25, 28, 20]} />
				</Toy>
			))}
			{EYES.map(([x, y]) => (
				<RoundEye3D key={x} at={[x, y, EYE_R * 1.0]} r={EYE_R} tall={EYE_TALL} look={look} blink={blink} />
			))}
			<Mouth3D at={[0, 0.79, FRONT + 0.004]} w={0.127} open={mouth} />
		</group>
	),
};

/** Estable's right palm in world space for a mascot placed at `at` (see `toyRightHandWorld`). */
export const estableRightHand = (pose: MascotPose, at: [number, number, number], height: number, yaw?: number) => toyRightHandWorld(spec, pose, at, height, yaw);

export const ToyEstableMascot: React.FC<{pose: MascotPose; height: number; yaw?: number}> = (props) => <ToyMascotRig spec={spec} {...props} />;
