// Generates the background music beds (v1 + motion-graphics cut) with ElevenLabs Music into public/music/.
// The video trims and fades it to length, so it is generated a little long.
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {creditsUsed, elevenlabs} from './elevenlabs-client.mjs';

const TRACKS = [
	{
	file: 'estable-explainer-bed.mp3',
	seconds: 110,
	prompt:
		'Bright, playful 1930s rubber-hose cartoon swing jazz blended with a clean modern tech pulse. Bouncy upright bass, brushed swing drums, muted trumpet hooks, plucky pizzicato strings, glockenspiel sparkles and soft synth pads. Optimistic, friendly and confident, steady medium-up tempo, consistent energy suitable under voice-over, ending with a short button. Instrumental only, no vocals.',
	},
	{
		file: 'estable-explainer-mg-bed.mp3',
		seconds: 110,
		prompt:
			'Modern premium motion-graphics tech promo track. Punchy electronic groove around 118 BPM, pulsing synth bass, crisp claps and hats, glassy plucked arpeggios, wide airy pads, tasteful risers into clean drops every few bars, confident and optimistic fintech energy, steady intensity suitable under voice-over, clean ending hit. Instrumental only, no vocals.',
	},
];

const dir = new URL('../public/music/', import.meta.url);
mkdirSync(dir, {recursive: true});
const before = await creditsUsed();
for (const track of TRACKS) {
	const out = new URL(track.file, dir);
	if (existsSync(out)) {
		console.log(`${track.file} exists, skipping`);
		continue;
	}
	const audio = await elevenlabs('/v1/music', {
		method: 'POST',
		raw: true,
		body: {prompt: track.prompt, music_length_ms: track.seconds * 1000, force_instrumental: true},
	});
	writeFileSync(out, audio);
	console.log(`${track.file} (${audio.length} bytes)`);
}
const after = await creditsUsed();
console.log(`credits ${before.used} → ${after.used} of ${after.limit}`);
