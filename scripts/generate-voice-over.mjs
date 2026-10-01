// Generates every script line with its mascot's voice via ElevenLabs TTS "with-timestamps",
// writing public/vo/<scene>-<n>-<speaker>.mp3 and src/audio/vo-lines.json (durations +
// character alignment that drive lip-sync and captions). Unchanged lines are skipped.
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {STORYBOARD} from '../src/storyboard/storyboard-script.ts';
import {creditsUsed, elevenlabs} from './elevenlabs-client.mjs';

const MODEL = 'eleven_multilingual_v2';
const VOICE_SETTINGS = {stability: 0.42, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true};
/** How brand words are spoken; captions keep the written form. */
const SPOKEN = [
	[/\bARSe\b/g, 'A R S e'],
	[/\bPSPs\b/g, 'P S Ps'],
];

/**
 * Trims leading silence (keeping a short pre-roll) and shifts the alignment to match,
 * so a line starts speaking the moment its scene cue fires.
 */
const PRE_ROLL = 0.06;
const trimLead = (entry) => {
	if (entry.leadTrimmed !== undefined) return entry;
	const path = new URL(`../public/${entry.file}`, import.meta.url).pathname;
	// silencedetect reports on stderr.
	const log = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path, '-af', 'silencedetect=noise=-40dB:d=0.1', '-f', 'null', '-'], {encoding: 'utf8'}).stderr;
	const m = log.match(/silence_start: (-?[\d.e-]+)[\s\S]*?silence_end: ([\d.]+)/);
	const lead = m && Number(m[1]) <= 0.02 ? Math.max(0, Number(m[2]) - PRE_ROLL) : 0;
	if (lead > 0) {
		const tmp = `${path}.tmp.mp3`;
		execFileSync('ffmpeg', ['-y', '-v', 'error', '-ss', lead.toFixed(3), '-i', path, '-c:a', 'libmp3lame', '-q:a', '2', tmp]);
		execFileSync('mv', [tmp, path]);
	}
	const shift = (xs) => xs.map((x) => Math.max(0, +(x - lead).toFixed(3)));
	return {
		...entry,
		leadTrimmed: +lead.toFixed(3),
		duration: Math.max(0, entry.duration - lead),
		alignment: {...entry.alignment, starts: shift(entry.alignment.starts), ends: shift(entry.alignment.ends)},
	};
};

const cast = JSON.parse(readFileSync(new URL('../src/audio/voice-cast.json', import.meta.url), 'utf8'));
const manifestUrl = new URL('../src/audio/vo-lines.json', import.meta.url);
const previous = existsSync(manifestUrl) ? JSON.parse(readFileSync(manifestUrl, 'utf8')) : {};
mkdirSync(new URL('../public/vo/', import.meta.url), {recursive: true});

const before = await creditsUsed();
const manifest = {};
let generated = 0;
for (const scene of STORYBOARD) {
	manifest[scene.id] = [];
	for (const [i, line] of scene.lines.entries()) {
		const spoken = SPOKEN.reduce((t, [re, rep]) => t.replace(re, rep), line.text);
		const voiceId = cast[line.speaker].voice_id;
		const hash = createHash('sha1').update(JSON.stringify([spoken, voiceId, MODEL, VOICE_SETTINGS])).digest('hex').slice(0, 12);
		const file = `vo/${scene.id}-${i + 1}-${line.speaker}.mp3`;
		const old = previous[scene.id]?.[i];
		if (old?.hash === hash && existsSync(new URL(`../public/${file}`, import.meta.url))) {
			manifest[scene.id].push(trimLead(old));
			continue;
		}
		const res = await elevenlabs(`/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
			method: 'POST',
			body: {text: spoken, model_id: MODEL, voice_settings: VOICE_SETTINGS},
		});
		writeFileSync(new URL(`../public/${file}`, import.meta.url), Buffer.from(res.audio_base64, 'base64'));
		const a = res.alignment;
		manifest[scene.id].push(trimLead({
			speaker: line.speaker,
			text: line.text,
			spoken,
			file,
			hash,
			duration: a.character_end_times_seconds.at(-1),
			alignment: {chars: a.characters.join(''), starts: a.character_start_times_seconds, ends: a.character_end_times_seconds},
		}));
		generated++;
		console.log(`${file} ${a.character_end_times_seconds.at(-1).toFixed(2)}s`);
	}
}
writeFileSync(manifestUrl, JSON.stringify(manifest, null, 1));
const after = await creditsUsed();
console.log(`generated ${generated} lines · credits ${before.used} → ${after.used} of ${after.limit}`);
