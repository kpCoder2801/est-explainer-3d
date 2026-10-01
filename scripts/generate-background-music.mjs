// Generates the background music bed with ElevenLabs Music into public/music/.
// The video trims and fades it to length, so it is generated a little long.
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {creditsUsed, elevenlabs} from './elevenlabs-client.mjs';

const TRACK = {
	file: 'estable-explainer-bed.mp3',
	seconds: 110,
	prompt:
		'Bright, playful 1930s rubber-hose cartoon swing jazz blended with a clean modern tech pulse. Bouncy upright bass, brushed swing drums, muted trumpet hooks, plucky pizzicato strings, glockenspiel sparkles and soft synth pads. Optimistic, friendly and confident, steady medium-up tempo, consistent energy suitable under voice-over, ending with a short button. Instrumental only, no vocals.',
};

const dir = new URL('../public/music/', import.meta.url);
mkdirSync(dir, {recursive: true});
const out = new URL(TRACK.file, dir);
if (existsSync(out)) {
	console.log(`${TRACK.file} exists, skipping`);
	process.exit(0);
}
const before = await creditsUsed();
const audio = await elevenlabs('/v1/music', {
	method: 'POST',
	raw: true,
	body: {prompt: TRACK.prompt, music_length_ms: TRACK.seconds * 1000, force_instrumental: true},
});
writeFileSync(out, audio);
const after = await creditsUsed();
console.log(`${TRACK.file} (${audio.length} bytes) · credits ${before.used} → ${after.used} of ${after.limit}`);
