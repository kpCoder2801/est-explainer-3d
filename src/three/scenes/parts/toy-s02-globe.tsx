import React, {useMemo} from 'react';
import * as THREE from 'three';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, useCanvasTexture} from '../../kit/toy-canvas-textures';
import {outlineMaterial} from '../../kit/toy-materials';
import {Toy} from '../../kit/toy-mesh';
import type {V3} from '../../kit/toy-stage';

const deg = Math.PI / 180;
export const PIN_RED = '#ef6f78';

/**
 * Stylised continents as clusters of blobs: [lat, lon, radius°], merged into smooth
 * coastlines on the globe texture. Rough shapes only — it should read as "Earth", not a map.
 */
const LAND: Array<[number, number, number]> = [
	// North America, Greenland
	[52, -102, 17], [40, -96, 13], [56, -122, 13], [63, -150, 9], [31, -103, 9], [21, -101, 6], [16, -92, 4], [12, -86, 3], [64, -78, 10], [73, -42, 9],
	// South America
	[6, -68, 8], [-5, -62, 11], [-15, -55, 11], [-27, -61, 8], [-39, -68, 5], [-49, -71, 3],
	// Europe, Africa
	[50, 10, 8], [57, 30, 10], [44, 22, 6], [16, 2, 11], [11, 21, 13], [0, 22, 11], [-12, 26, 9], [-25, 25, 7], [-20, 46, 3],
	// Asia, Oceania
	[56, 82, 17], [45, 102, 15], [62, 122, 13], [30, 79, 9], [25, 106, 9], [65, 152, 9], [36, 47, 8], [-2, 115, 5], [-25, 134, 10], [-40, 174, 3],
];

/** Euler (order YXZ) that turns local +z onto the surface normal at (lat, lon). */
const anchorEuler = (lat: number, lon: number) => new THREE.Euler(-lat * deg, lon * deg, 0, 'YXZ');

/** Group whose +z axis is the outward surface normal at (lat, lon); children sit on the sphere at z = radius. */
export const SurfaceAnchor: React.FC<{lat: number; lon: number; children: React.ReactNode}> = ({lat, lon, children}) => (
	<group rotation={anchorEuler(lat, lon)}>{children}</group>
);

export type GlobePose = {center: V3; radius: number; spin: number; tilt: number; scale: number};

/** World position of a surface point (plus `lift` above it), so world-space labels can follow the spinning globe. */
export const globeSurfacePoint = (g: GlobePose, lat: number, lon: number, lift = 0) => {
	const p = new THREE.Vector3(0, 0, (g.radius + lift) * g.scale).applyEuler(anchorEuler(lat, lon));
	p.applyEuler(new THREE.Euler(0, g.spin, 0));
	p.applyEuler(new THREE.Euler(0, 0, g.tilt));
	return p.add(new THREE.Vector3(...g.center));
};

const OCEAN = '#2f8fdc';
const OCEAN_DEEP = '#1f66b5';
const LAND_GREEN = '#4cc16a';
const LAND_SHORE = '#8be08a';

/** Canvas x for a longitude, matching three's sphere UVs (and `anchorEuler`): u = lon/360 + 0.25. */
const lonToX = (lon: number, w: number) => ((((lon / 360 + 0.25) % 1) + 1) % 1) * w;

/**
 * Equirectangular Earth texture: the LAND blobs are blurred into one mask and
 * thresholded into smooth coastlines, painted green on a blue ocean gradient with a
 * pale shore rim and white polar caps.
 */
const drawEarth: CanvasDraw = (ctx, w, h) => {
	const mask = document.createElement('canvas');
	mask.width = w;
	mask.height = h;
	const m = mask.getContext('2d')!;
	m.filter = `blur(${w / 160}px)`;
	m.fillStyle = '#fff';
	for (const [lat, lon, size] of LAND) {
		const ry = (size / 180) * h * 1.15;
		const rx = ry / Math.max(0.35, Math.cos(lat * deg));
		const x = lonToX(lon, w);
		const y = ((90 - lat) / 180) * h;
		for (const dx of [-w, 0, w]) {
			m.beginPath();
			m.ellipse(x + dx, y, rx, ry, 0, 0, Math.PI * 2);
			m.fill();
		}
	}
	const img = m.getImageData(0, 0, w, h);
	const ocean = ctx.createLinearGradient(0, 0, 0, h);
	ocean.addColorStop(0, OCEAN_DEEP);
	ocean.addColorStop(0.5, OCEAN);
	ocean.addColorStop(1, OCEAN_DEEP);
	ctx.fillStyle = ocean;
	ctx.fillRect(0, 0, w, h);
	const out = ctx.getImageData(0, 0, w, h);
	const green = new THREE.Color(LAND_GREEN);
	const shore = new THREE.Color(LAND_SHORE);
	for (let i = 0; i < img.data.length; i += 4) {
		const a = img.data[i + 3];
		if (a < 120) continue;
		// Just above the threshold is the coastline band; deeper inland is plain green.
		const c = a < 150 ? shore : green;
		out.data[i] = c.r * 255;
		out.data[i + 1] = c.g * 255;
		out.data[i + 2] = c.b * 255;
	}
	ctx.putImageData(out, 0, 0);
	// Polar caps.
	ctx.fillStyle = '#f2fbff';
	ctx.fillRect(0, 0, w, h * 0.045);
	ctx.fillRect(0, h * 0.955, w, h * 0.045);
};

/**
 * Glossy toy Earth floating in space: blue ocean with green continents, a faint ink
 * outline and a soft atmosphere glow. `children` render in the spinning globe frame
 * (use `SurfaceAnchor` to stick things on it).
 */
export const ToyGlobe: React.FC<{pose: GlobePose; children?: React.ReactNode}> = ({pose, children}) => {
	const {center, radius: r, spin, tilt, scale} = pose;
	const tex = useCanvasTexture(2048, 1024, drawEarth, 'earth');
	const material = useMemo(() => new THREE.MeshPhysicalMaterial({map: tex, roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.12}), [tex]);
	return (
		<group position={center} rotation={[0, 0, tilt]} scale={scale}>
			<mesh>
				<sphereGeometry args={[r * 1.07, 48, 32]} />
				<meshBasicMaterial color={colors.arseSky} transparent opacity={0.16} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
			</mesh>
			<group rotation={[0, spin, 0]}>
				<mesh material={material} castShadow>
					<sphereGeometry args={[r, 64, 48]} />
				</mesh>
				<mesh material={outlineMaterial(0.025)}>
					<sphereGeometry args={[r, 64, 48]} />
				</mesh>
				{children}
			</group>
		</group>
	);
};

/**
 * Map pin modelled upright with its tip at the origin; `drop` lifts it along its own
 * axis (falling in) and `squash` flattens it on impact.
 */
export const ToyMapPin: React.FC<{size?: number; drop?: number; squash?: number}> = ({size = 0.5, drop = 0, squash = 1}) => (
	<group position={[0, drop, 0]} scale={[size * (2 - squash), size * squash, size * (2 - squash)]}>
		<Toy color={PIN_RED} position={[0, 0.36, 0]} rotation={[Math.PI, 0, 0]} outline={0.03}>
			<coneGeometry args={[0.2, 0.72, 28]} />
		</Toy>
		<Toy color={PIN_RED} position={[0, 0.8, 0]} outline={0.03}>
			<sphereGeometry args={[0.3, 32, 24]} />
		</Toy>
		<Toy color={colors.white} position={[0, 0.8, 0]} outline={false}>
			<sphereGeometry args={[0.13, 20, 14]} />
		</Toy>
	</group>
);
