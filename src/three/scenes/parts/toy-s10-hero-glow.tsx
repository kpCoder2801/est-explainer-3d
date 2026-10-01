import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import {CanvasDraw, useCanvasTexture} from '../../kit/toy-canvas-textures';

type GroupProps = ThreeElements['group'];

/** Soft white radial falloff; tinted by the material colour. */
const drawHalo: CanvasDraw = (ctx, w, h) => {
	const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
	g.addColorStop(0, 'rgba(255,255,255,0.9)');
	g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);
};

/**
 * Additive halo card behind a hero object: the "hero glow" the logo resolves in.
 * Unlit, ignores fog, never writes depth, so it only brightens what is behind it.
 */
export const HeroGlow: React.FC<GroupProps & {size: number; color: string; strength: number}> = ({size, color, strength, ...group}) => {
	const tex = useCanvasTexture(256, 256, drawHalo, 'halo');
	return (
		<group {...group}>
			<mesh>
				<planeGeometry args={[size, size]} />
				<meshBasicMaterial
					map={tex}
					color={color}
					transparent
					opacity={strength}
					blending={THREE.AdditiveBlending}
					depthWrite={false}
					toneMapped={false}
					fog={false}
				/>
			</mesh>
		</group>
	);
};
