import {Easing, interpolate} from 'remotion';
import {CameraShot, V3} from './toy-stage';

/** A camera key: where the camera is and what it looks at, `at` seconds into the scene. */
export type ShotKey = {at: number; position: V3; target: V3};

const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const ease = Easing.inOut(Easing.cubic);

/**
 * Camera move as a pure function of scene time: holds on the first key before it,
 * eases (in-out cubic) between consecutive keys, and holds on the last key after.
 * Two keys with the same shot make a hold. Keys must be sorted by `at`.
 */
export const cameraPath = (t: number, keys: ShotKey[]): CameraShot => {
	const next = keys.findIndex((k) => k.at > t);
	if (next === 0) return {position: keys[0].position, target: keys[0].target};
	if (next === -1) {
		const last = keys[keys.length - 1];
		return {position: last.position, target: last.target};
	}
	const a = keys[next - 1];
	const b = keys[next];
	const k = interpolate(t, [a.at, b.at], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	return {position: lerp3(a.position, b.position, k), target: lerp3(a.target, b.target, k)};
};
