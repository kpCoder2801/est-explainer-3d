import type {ThreeElements} from '@react-three/fiber';
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, useCanvasTexture} from '../../kit/toy-canvas-textures';
import {Toy} from '../../kit/toy-mesh';

type GroupProps = ThreeElements['group'];

/** Rough continent outlines as [lon, lat] rings — a toy map, not cartography. */
const CONTINENTS: Array<Array<[number, number]>> = [
	[[-80, 10], [-60, 10], [-35, -7], [-40, -22], [-58, -38], [-68, -55], [-75, -50], [-72, -18], [-81, -5]],
	[[-165, 65], [-140, 70], [-95, 75], [-65, 60], [-55, 50], [-80, 25], [-97, 17], [-83, 9], [-105, 22], [-118, 32], [-125, 48], [-150, 60]],
	[[-17, 15], [-5, 35], [10, 37], [33, 31], [43, 12], [51, 11], [40, -15], [32, -28], [20, -35], [12, -17], [9, 4], [-8, 5]],
	[[-10, 36], [-9, 43], [-2, 48], [5, 51], [10, 57], [20, 60], [28, 70], [40, 66], [40, 45], [28, 40], [15, 38], [3, 42]],
	[[40, 45], [40, 66], [70, 75], [110, 77], [140, 72], [170, 66], [140, 50], [122, 30], [108, 20], [100, 8], [78, 8], [68, 23], [57, 25], [50, 30], [35, 35]],
	[[114, -22], [130, -12], [142, -11], [153, -27], [146, -39], [135, -34], [115, -34]],
	[[-50, 60], [-20, 70], [-25, 82], [-55, 80]],
];

export type LatLon = {lat: number; lon: number};
export const ARGENTINA: LatLon = {lat: -34, lon: -64};
export const SPAIN: LatLon = {lat: 40, lon: -4};

/** Point on a sphere of radius `r` matching three's SphereGeometry UV layout (equirectangular texture). */
export const latLonToLocal = ({lat, lon}: LatLon, r: number) => {
	const phi = ((lon + 180) / 360) * Math.PI * 2;
	const theta = ((90 - lat) / 180) * Math.PI;
	return new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
};

/** Quadratic bezier remittance arc between two surface points, bulging `lift`× the radius out of the globe. */
export const arcPoint = (a: THREE.Vector3, b: THREE.Vector3, r: number, p: number, lift = 1.75) => {
	const c = a.clone().add(b).normalize().multiplyScalar(r * lift);
	const q = 1 - p;
	return a.clone().multiplyScalar(q * q).addScaledVector(c, 2 * q * p).addScaledVector(b, p * p);
};

const drawMap: CanvasDraw = (ctx, w, h) => {
	ctx.fillStyle = colors.arseNavy;
	ctx.fillRect(0, 0, w, h);
	ctx.strokeStyle = 'rgba(111,211,240,0.22)';
	ctx.lineWidth = 2;
	for (let lon = -180; lon <= 180; lon += 30) {
		ctx.beginPath();
		ctx.moveTo(((lon + 180) / 360) * w, 0);
		ctx.lineTo(((lon + 180) / 360) * w, h);
		ctx.stroke();
	}
	for (let lat = -60; lat <= 60; lat += 30) {
		ctx.beginPath();
		ctx.moveTo(0, ((90 - lat) / 180) * h);
		ctx.lineTo(w, ((90 - lat) / 180) * h);
		ctx.stroke();
	}
	ctx.lineJoin = 'round';
	CONTINENTS.forEach((ring) => {
		ctx.beginPath();
		ring.forEach(([lon, lat], i) => ctx[i ? 'lineTo' : 'moveTo'](((lon + 180) / 360) * w, ((90 - lat) / 180) * h));
		ctx.closePath();
		ctx.fillStyle = colors.arseSky;
		ctx.fill();
		ctx.strokeStyle = colors.arseHighlight;
		ctx.lineWidth = 5;
		ctx.stroke();
	});
};

/** Map pin standing out of the globe along the surface normal at `at` (globe-local). */
const MapPin: React.FC<{at: THREE.Vector3; color: string; scale?: number}> = ({at, color, scale = 1}) => {
	const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), at.clone().normalize());
	return (
		<group position={at} quaternion={q} scale={Math.max(0.001, scale)}>
			<Toy color={color} position={[0, 0.14, 0]} rotation={[Math.PI, 0, 0]}>
				<coneGeometry args={[0.09, 0.28, 20]} />
			</Toy>
			<Toy color={color} position={[0, 0.34, 0]}>
				<sphereGeometry args={[0.13, 24, 16]} />
			</Toy>
			<Toy color={colors.white} position={[0, 0.34, 0.1]} outline={false}>
				<sphereGeometry args={[0.05, 12, 8]} />
			</Toy>
		</group>
	);
};

/**
 * Glossy toy globe with an Argentina pin, a destination pin (`destPin` 0…1 pops it)
 * and a dotted remittance trail drawn up to `trail` (0…1). Children of the spin
 * group, so they turn with the globe.
 */
export const ToyRemittanceGlobe: React.FC<GroupProps & {radius: number; spin: number; trail: number; destPin: number}> = ({radius, spin, trail, destPin, ...group}) => {
	const tex = useCanvasTexture(1024, 512, drawMap, 'world-map');
	const material = useMemo(() => new THREE.MeshPhysicalMaterial({map: tex, roughness: 0.45, clearcoat: 1, clearcoatRoughness: 0.12}), [tex]);
	const a = latLonToLocal(ARGENTINA, radius);
	const b = latLonToLocal(SPAIN, radius);
	const dots = 24;
	return (
		<group {...group}>
			<group rotation={[0, spin, 0]}>
				<mesh material={material} castShadow>
					<sphereGeometry args={[radius, 64, 40]} />
				</mesh>
				<MapPin at={a} color={colors.arseBlue} />
				<MapPin at={b} color={colors.tealBright} scale={destPin} />
				{Array.from({length: dots + 1}, (_, i) =>
					i / dots > trail ? null : (
						<Toy key={i} color={colors.arseSky} position={arcPoint(a, b, radius, i / dots)} outline={0.012}>
							<sphereGeometry args={[0.05, 14, 10]} />
						</Toy>
					),
				)}
			</group>
		</group>
	);
};
