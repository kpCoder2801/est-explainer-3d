import {Easing, interpolate, random} from 'remotion';

export type MascotAction = 'idle' | 'talk' | 'walk' | 'wave' | 'point' | 'jump' | 'celebrate';

/** Everything a mascot rig needs to draw one frame. Scenes build this via `useMascotState`. */
export type MascotPose = {
	action: MascotAction;
	/** Seconds since the current action started (drives cycles like wave/walk). */
	actionTime: number;
	/** Seconds since scene start (drives idle breathing + blink schedule). */
	time: number;
	/** 0 = closed, 1 = fully open. */
	mouth: number;
	/** Pupil offset, -1 (left) … 1 (right). */
	look: number;
	facing: 1 | -1;
	seed: string;
};

/** Joint angles in degrees. Arms: 0 = hanging down, 90 = horizontal outward, 180 = straight up. */
export type BodyMotion = {
	bodyY: number;
	hop: number;
	squashX: number;
	squashY: number;
	tilt: number;
	armL: number;
	armR: number;
	legL: number;
	legR: number;
};

const TAU = Math.PI * 2;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Shared motion vocabulary. Values are in rig units where body height ≈ 1, so each
 * rig multiplies by its own size — this keeps the three mascots moving in the same
 * "hand" while their bodies differ.
 */
export const bodyMotion = (action: MascotAction, t: number, time: number): BodyMotion => {
	const breathe = Math.sin(time * TAU * 0.45);
	const base: BodyMotion = {
		bodyY: breathe * 0.008,
		hop: 0,
		squashX: 1 - breathe * 0.012,
		squashY: 1 + breathe * 0.012,
		tilt: 0,
		armL: 18 + breathe * 3,
		armR: 18 - breathe * 3,
		legL: 0,
		legR: 0,
	};

	switch (action) {
		case 'idle':
			return base;
		case 'talk': {
			// Small conversational gestures: one hand lifts on a slow cycle, slight head tilt.
			const g = Math.sin(t * TAU * 0.35);
			return {
				...base,
				tilt: Math.sin(t * TAU * 0.6) * 2.5,
				armR: 35 + Math.max(0, g) * 45,
				armL: 22 + Math.max(0, -g) * 30,
			};
		}
		case 'walk': {
			const s = Math.sin(t * TAU * 1.8);
			return {
				...base,
				bodyY: -Math.abs(Math.cos(t * TAU * 1.8)) * 0.035,
				tilt: 4,
				legL: s * 28,
				legR: -s * 28,
				armL: 20 - s * 22,
				armR: 20 + s * 22,
			};
		}
		case 'wave': {
			const raise = interpolate(t, [0, 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
			return {
				...base,
				tilt: -3 * raise,
				armR: 18 + raise * (130 + Math.sin(t * TAU * 2.2) * 22),
			};
		}
		case 'point': {
			const raise = interpolate(t, [0, 0.3], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
			return {...base, tilt: 4 * raise, armR: 18 + raise * 78, armL: 14};
		}
		case 'jump': {
			// 1s cycle: anticipation squash → launch → apex → landing squash.
			const p = t % 1;
			const air = interpolate(p, [0.2, 0.75], [0, 1], clamp);
			const hop = Math.sin(air * Math.PI);
			const crouch = interpolate(p, [0, 0.18, 0.22, 0.75, 0.82, 1], [0, 1, 0, 0, 1, 0], clamp);
			return {
				...base,
				hop: hop * 0.32,
				squashX: 1 + crouch * 0.12 - hop * 0.06,
				squashY: 1 - crouch * 0.14 + hop * 0.08,
				armL: 18 + hop * 120,
				armR: 18 + hop * 120,
				legL: hop * -14,
				legR: hop * 14,
			};
		}
		case 'celebrate': {
			const p = t % 0.6;
			const hop = Math.sin((p / 0.6) * Math.PI);
			return {
				...base,
				hop: hop * 0.12,
				squashX: 1 - hop * 0.04,
				squashY: 1 + hop * 0.05,
				tilt: Math.sin(t * TAU * 0.8) * 5,
				armL: 150 + Math.sin(t * TAU * 1.6) * 20,
				armR: 150 - Math.sin(t * TAU * 1.6) * 20,
			};
		}
	}
};

/** Returns 0 (open) … 1 (closed). Blinks every ~2.5–4.5s on a per-mascot schedule. */
export const blinkAmount = (time: number, seed: string): number => {
	let start = 0.6 + random(`${seed}-b0`) * 1.5;
	for (let i = 1; start < time + 1; i++) {
		const d = time - start;
		if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI);
		start += 2.5 + random(`${seed}-b${i}`) * 2;
	}
	return 0;
};

/**
 * Placeholder lip-flap used until ElevenLabs alignment exists: opens once per
 * syllable-ish vowel group at ~2.6 words/s. Replaced by audio timestamps later.
 */
export const mouthFromText = (text: string, t: number, duration: number): number => {
	if (t < 0 || t > duration) return 0;
	const groups = Math.max(1, (text.toLowerCase().match(/[aeiouy]+/g) ?? []).length);
	const phase = (t / duration) * groups;
	const local = phase % 1;
	const strength = 0.55 + random(`m${Math.floor(phase)}`) * 0.45;
	return Math.sin(local * Math.PI) * strength;
};

/** Converts an arm angle into a 2D direction for a limb hanging from a shoulder on side `side`. */
export const limbVector = (angleDeg: number, side: -1 | 1) => {
	const a = (angleDeg * Math.PI) / 180;
	return {x: Math.sin(a) * side, y: Math.cos(a)};
};
