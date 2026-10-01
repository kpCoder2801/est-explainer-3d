// One-off check: can this key/plan generate music? Requests the shortest allowed clip.
import {mkdirSync, writeFileSync} from 'node:fs';
import {creditsUsed, elevenlabs} from './elevenlabs-client.mjs';

const before = await creditsUsed();
try {
	const audio = await elevenlabs('/v1/music', {
		method: 'POST',
		raw: true,
		body: {
			prompt: 'Upbeat, playful 1930s rubber-hose cartoon jazz with a modern fintech pulse: bouncy upright bass, muted trumpet, light swing drums, glockenspiel sparkles. Instrumental, no vocals.',
			music_length_ms: 10000,
		},
	});
	mkdirSync(new URL('../public/music-test/', import.meta.url), {recursive: true});
	writeFileSync(new URL('../public/music-test/music-access-check.mp3', import.meta.url), audio);
	console.log(`music: OK (${audio.length} bytes)`);
} catch (e) {
	console.log(`music: FAILED — ${e.message}`);
}
const after = await creditsUsed();
console.log(`credits: ${before.used} → ${after.used} of ${after.limit}`);
