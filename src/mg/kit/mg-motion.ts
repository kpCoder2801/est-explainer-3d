import {Easing, interpolate} from 'remotion';

/**
 * Motion identity for the motion-graphics cut ("energetic-premium"):
 * one signature curve (expo-out) for entrances, expo-in for exits, three durations.
 */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.87, 0, 0.13, 1);
export const DUR = {quick: 8 / 30, std: 14 / 30, slow: 24 / 30} as const;
export const STAGGER = 3 / 30;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 entrance progress for something that starts at `at` seconds. */
export const enter = (t: number, at: number, dur: number = DUR.std, ease = EASE_OUT) => interpolate(t, [at, at + dur], [0, 1], {...clamp, easing: ease});

/** 1→0 exit progress for something that leaves at `at` seconds (1 before, 0 after). */
export const exit = (t: number, at: number | undefined, dur: number = DUR.quick) =>
	at === undefined ? 1 : interpolate(t, [at, at + dur], [1, 0], {...clamp, easing: EASE_IN});

/** Linear map with clamping, for scrubbing values between two times. */
export const between = (t: number, a: number, b: number, from = 0, to = 1, ease = EASE_IN_OUT) => interpolate(t, [a, b], [from, to], {...clamp, easing: ease});
