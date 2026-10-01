import voLines from './vo-lines.json';

/** One generated voice line (see scripts/generate-voice-over.mjs). Times are in seconds from line start. */
export type VoiceOverLine = {
	speaker: string;
	text: string;
	spoken: string;
	file: string;
	duration: number;
	alignment: {chars: string; starts: number[]; ends: number[]};
};

const VO = voLines as unknown as Record<string, VoiceOverLine[]>;

/** The recorded line, if the scene's line text still matches what was recorded. */
export const voiceOverFor = (sceneId: string, index: number, text: string): VoiceOverLine | undefined => {
	const vo = VO[sceneId]?.[index];
	return vo && vo.text === text ? vo : undefined;
};

const VOWELS = 'aeiouyáéíóú';
const CLOSED = 'mbpfv'; // lips together / teeth on lip

/** Mouth openness of the character being spoken at `t`, from the TTS alignment. */
const openAt = (vo: VoiceOverLine, t: number) => {
	const {chars, starts, ends} = vo.alignment;
	// Binary search for the character active at t.
	let lo = 0;
	let hi = starts.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (starts[mid] <= t) lo = mid;
		else hi = mid - 1;
	}
	if (t < starts[0] || t > ends[ends.length - 1] || t > ends[lo] + 0.05) return 0;
	const c = chars[lo].toLowerCase();
	if (VOWELS.includes(c)) return c === 'o' || c === 'u' ? 0.75 : 1;
	if (CLOSED.includes(c)) return 0.05;
	if (/[a-z]/.test(c)) return 0.4;
	return 0;
};

/** Lip-sync value 0…1, lightly smoothed so the mouth doesn't flicker frame to frame. */
export const mouthFromAlignment = (vo: VoiceOverLine, t: number) =>
	(openAt(vo, t - 0.035) + openAt(vo, t) * 2 + openAt(vo, t + 0.035)) / 4;

/** Fraction (0…1) of the line's characters already spoken at `t`. */
export const spokenFraction = (vo: VoiceOverLine, t: number) => {
	const n = vo.alignment.starts.filter((s) => s <= t).length;
	return n / vo.alignment.starts.length;
};

/** Time at which `fraction` of the line's characters have started being spoken. */
export const timeAtSpokenFraction = (vo: VoiceOverLine, fraction: number) => {
	const {starts} = vo.alignment;
	return starts[Math.min(starts.length - 1, Math.max(0, Math.floor(fraction * starts.length)))];
};
