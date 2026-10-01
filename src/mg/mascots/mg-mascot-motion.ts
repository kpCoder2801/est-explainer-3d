import {interpolate} from 'remotion';
import {MascotAction} from '../../mascots/shared/mascot-motion';

/**
 * Limbless motion for the MG cast. Scenes keep using v1 action names (via poseAt);
 * each maps to whole-body motion: float, waddle, lean, hop, spin, plus "happy" eyes.
 * y is in body-heights (negative = up), rot in degrees.
 */
export type MgMotion = {y: number; rot: number; sx: number; sy: number; happy: boolean};

const TAU = Math.PI * 2;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const mgMotion = (action: MascotAction, at: number, time: number): MgMotion => {
	const float = Math.sin(time * TAU * 0.45) * 0.018;
	const base: MgMotion = {y: float - 0.02, rot: Math.sin(time * TAU * 0.3) * 1.5, sx: 1, sy: 1, happy: false};
	switch (action) {
		case 'idle':
			return base;
		case 'talk': {
			const bob = Math.abs(Math.sin(at * TAU * 2.1));
			return {...base, y: base.y - bob * 0.018, rot: Math.sin(at * TAU * 0.7) * 3, sx: 1 + bob * 0.015, sy: 1 - bob * 0.015};
		}
		case 'walk': {
			const s = Math.sin(at * TAU * 2);
			return {...base, y: -Math.abs(s) * 0.07 - 0.02, rot: s * 7, sx: 1 - Math.abs(s) * 0.03, sy: 1 + Math.abs(s) * 0.03};
		}
		case 'wave': {
			const w = Math.sin(at * TAU * 2.2) * interpolate(at, [0, 0.3], [0, 1], clamp);
			return {...base, rot: w * 9, happy: true};
		}
		case 'point': {
			const lean = interpolate(at, [0, 0.25], [0, 1], clamp);
			return {...base, rot: 11 * lean, sx: 1 + 0.04 * lean, sy: 1 - 0.03 * lean};
		}
		case 'jump': {
			const p = at % 1;
			const air = interpolate(p, [0.2, 0.75], [0, 1], clamp);
			const hop = Math.sin(air * Math.PI);
			const crouch = interpolate(p, [0, 0.18, 0.22, 0.75, 0.82, 1], [0, 1, 0, 0, 1, 0], clamp);
			return {...base, y: -hop * 0.35 - 0.02, sx: 1 + crouch * 0.14 - hop * 0.05, sy: 1 - crouch * 0.16 + hop * 0.08, happy: hop > 0.2};
		}
		case 'celebrate': {
			// Hop with a full spin on every other hop — very "logo sting".
			const cycle = at % 1.2;
			const hop = Math.sin(Math.min(1, cycle / 0.6) * Math.PI);
			const spin = Math.floor(at / 1.2) % 2 === 0 ? interpolate(cycle, [0.05, 0.6], [0, 360], clamp) : 0;
			return {...base, y: -hop * 0.16 - 0.02, rot: spin, sx: 1 - hop * 0.04, sy: 1 + hop * 0.05, happy: true};
		}
	}
};
