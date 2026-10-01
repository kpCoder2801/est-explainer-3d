import {mouthFromAlignment, spokenFraction, timeAtSpokenFraction, VoiceOverLine, voiceOverFor} from '../audio/voice-over';
import {MascotId} from '../mascots/mascot';
import {MascotAction, MascotPose, mouthFromText} from '../mascots/shared/mascot-motion';
import {ScriptLine, StoryboardScene} from './storyboard-script';

/** Speaking-rate estimate, used only for lines without recorded voice-over. */
const WORDS_PER_SECOND = 2.6;
const PAUSE_PER_PUNCTUATION = 0.18;
const GAP_BETWEEN_LINES = 0.35;

export type TimedLine = ScriptLine & {start: number; end: number; vo?: VoiceOverLine};

export const estimateLineSeconds = (text: string) => {
	const words = text.trim().split(/\s+/).length;
	const pauses = (text.match(/[,.!?]/g) ?? []).length;
	return Math.max(0.9, words / WORDS_PER_SECOND + pauses * PAUSE_PER_PUNCTUATION);
};

export const timeScene = (scene: StoryboardScene) => {
	let cursor = scene.lead;
	const lines: TimedLine[] = scene.lines.map((l, i) => {
		const vo = voiceOverFor(scene.id, i, l.text);
		const start = cursor;
		const end = start + (vo ? vo.duration : estimateLineSeconds(l.text));
		cursor = end + GAP_BETWEEN_LINES;
		return {...l, start, end, vo};
	});
	const duration = (lines.at(-1)?.end ?? scene.lead) + scene.tail;
	return {lines, duration};
};

export type Beat = {at: number; action: MascotAction; facing?: 1 | -1; look?: number};

/**
 * Resolves a mascot's pose at time `t` from its action beats and the scene's lines.
 * While a mascot is speaking and its beat is `idle`, it switches to `talk` gestures.
 */
export const poseAt = (id: MascotId, beats: Beat[], lines: TimedLine[], t: number): MascotPose => {
	const active = [...beats].reverse().find((b) => b.at <= t) ?? beats[0];
	const speaking = lines.find((l) => l.speaker === id && t >= l.start && t <= l.end);
	const facing = [...beats].reverse().find((b) => b.at <= t && b.facing)?.facing ?? 1;
	return {
		action: speaking && active.action === 'idle' ? 'talk' : active.action,
		actionTime: Math.max(0, t - (speaking && active.action === 'idle' ? speaking.start : active.at)),
		time: t,
		mouth: !speaking
			? 0
			: speaking.vo
				? mouthFromAlignment(speaking.vo, t - speaking.start)
				: mouthFromText(speaking.text, t - speaking.start, speaking.end - speaking.start),
		look: active.look ?? 0,
		facing,
		seed: id,
	};
};

/** Fraction of the line's displayed text reached at scene time `t` (drives caption highlighting). */
export const lineProgress = (line: TimedLine, t: number) =>
	line.vo ? spokenFraction(line.vo, t - line.start) : (t - line.start) / (line.end - line.start);

/**
 * Time the `index`-th displayed word (0-based) of a line is spoken — lets props hit on a word.
 * Uses the recorded alignment when available (mapped by character position), else an estimate.
 */
export const wordStart = (line: TimedLine, index: number) => {
	const words = line.text.split(/\s+/);
	const charsBefore = words.slice(0, index).join(' ').length + (index > 0 ? 1 : 0);
	const fraction = charsBefore / line.text.length;
	return line.start + (line.vo ? timeAtSpokenFraction(line.vo, fraction) : fraction * (line.end - line.start));
};
