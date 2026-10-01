import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import {flatMaterial, outlineMaterial, toyMaterial} from './toy-materials';

/** Default line-art thickness in rig units (body height = 1). */
export const TOY_OUTLINE = 0.02;

type GroupProps = ThreeElements['group'];

/**
 * One toy part: the glossy surface plus its faint ink outline. Pass the geometry
 * either as a JSX child (`<sphereGeometry />`, rebuilt by r3f when its args change)
 * or as a prebuilt `geometry` with an optional welded `outlineGeometry`.
 */
export const Toy: React.FC<
	GroupProps & {
		color: string;
		geometry?: THREE.BufferGeometry;
		outlineGeometry?: THREE.BufferGeometry;
		outline?: number | false;
		matte?: boolean;
		/** Unlit flat colour (eye ink, mouth interior). */
		flat?: boolean;
		castShadow?: boolean;
		children?: React.ReactNode;
	}
> = ({color, geometry, outlineGeometry, outline = TOY_OUTLINE, matte, flat, castShadow = true, children, ...group}) => (
	<group {...group}>
		<mesh geometry={geometry} material={flat ? flatMaterial(color) : toyMaterial(color, {matte})} castShadow={castShadow}>
			{geometry ? null : children}
		</mesh>
		{outline !== false && (
			<mesh geometry={outlineGeometry ?? geometry} material={outlineMaterial(outline)}>
				{geometry || outlineGeometry ? null : children}
			</mesh>
		)}
	</group>
);
