import * as THREE from 'three';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {colors} from '../../brand/brand-tokens';

/**
 * Glossy vinyl-toy look: a soft diffuse base under a sharp clearcoat, so studio
 * reflections ride on top of the flat brand colour without washing it out.
 * Cached per colour; one renderer per Remotion tab so sharing is safe.
 */
const toyCache = new Map<string, THREE.MeshPhysicalMaterial>();
export const toyMaterial = (color: string, opts: {matte?: boolean} = {}) => {
	const key = `${color}-${opts.matte ? 'm' : 'g'}`;
	let m = toyCache.get(key);
	if (!m) {
		m = new THREE.MeshPhysicalMaterial({
			color,
			roughness: opts.matte ? 0.75 : 0.42,
			metalness: 0,
			clearcoat: opts.matte ? 0 : 1,
			clearcoatRoughness: 0.14,
		});
		toyCache.set(key, m);
	}
	return m;
};

/** Unlit colour for eyes' ink, mouth interiors and other graphic details that should not shade. */
const flatCache = new Map<string, THREE.MeshBasicMaterial>();
export const flatMaterial = (color: string) => {
	let m = flatCache.get(color);
	if (!m) {
		m = new THREE.MeshBasicMaterial({color});
		flatCache.set(color, m);
	}
	return m;
};

/**
 * Sticker line art in 3D: an inverted hull — the back faces of the mesh, pushed out
 * along their normals in object space — drawn in the outline ink. `thickness` is in
 * the mesh's own units, so it scales with the mascot.
 */
const outlineCache = new Map<number, THREE.ShaderMaterial>();
export const outlineMaterial = (thickness: number) => {
	let m = outlineCache.get(thickness);
	if (!m) {
		m = new THREE.ShaderMaterial({
			uniforms: {thickness: {value: thickness}, ink: {value: new THREE.Color(colors.outline)}},
			vertexShader: /* glsl */ `
				uniform float thickness;
				void main() {
					vec3 p = position + normalize(normal) * thickness;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
				}`,
			fragmentShader: /* glsl */ `
				uniform vec3 ink;
				void main() { gl_FragColor = vec4(ink, 1.0); }`,
			side: THREE.BackSide,
		});
		outlineCache.set(thickness, m);
	}
	return m;
};

/**
 * Extrusions and voxel unions have split (hard-edge) normals, which tear an inverted
 * hull open at every corner. Welding the vertices and recomputing gives one smooth
 * normal per position, which is all the outline pass needs.
 */
export const weldForOutline = (geometry: THREE.BufferGeometry) => {
	const g = geometry.clone();
	g.deleteAttribute('normal');
	g.deleteAttribute('uv');
	const welded = mergeVertices(g, 1e-4);
	welded.computeVertexNormals();
	return welded;
};
