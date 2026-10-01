// Generates the sound-effect library with ElevenLabs Sound Effects into public/sfx/.
// Existing files are kept, so re-running only fills in new entries.
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {creditsUsed, elevenlabs} from './elevenlabs-client.mjs';

/** name → [prompt, seconds]. Names are referenced from src/audio/sound-effects.ts. */
export const SFX = {
	'whoosh-gather': ['Soft magical whoosh with a rising shimmer, glowing particles rushing together', 1.6],
	'pop-appear': ['Bright cartoon pop followed by a bouncy rubber boing, character appears', 0.9],
	'hop-boing': ['Short playful cartoon spring boing for a little hop', 0.6],
	'crank-rattle': ['Wind-up crank ratchet clicking while a glass gumball machine full of coins rattles and shakes', 1.4],
	'coin-pop-out': ['A coin shooting out of a chute with a cartoon pop and a sparkly bright chime', 1.0],
	'landing-squash': ['Soft cartoon landing thud with a squishy bounce', 0.6],
	'chip-pop': ['Tiny clean UI bubble pop', 0.5],
	'machine-drop': ['Heavy cartoon metal machine dropping in and landing with a bouncy clunk', 0.9],
	'pixel-run': ['8-bit retro video game character running fast, quick chiptune footsteps', 1.3],
	'pixel-skid': ['8-bit retro video game skid to a stop', 0.6],
	'pixel-drop': ['8-bit retro video game item falling then landing blip', 0.8],
	'pixel-lock': ['8-bit retro lock click followed by a short sparkling power-up jingle', 1.1],
	'text-stamp': ['Punchy cartoon stamp thump, short and satisfying', 0.5],
	'pin-drop': ['Cartoon map pin dropping and sticking in with a soft thunk and a tiny ding', 0.8],
	'card-flip': ['Quick paper card flip with a light swish', 0.5],
	'cable-tangle': ['Messy rubbery cables twisting and creaking with a sour electric buzz', 1.4],
	'cable-snap-clean': ['Cartoon rope pulled taut with a satisfying twang that resolves into a clean bright chime', 1.2],
	'invoice-print': ['Receipt printer whirr printing a short paper slip', 1.0],
	'coin-rain': ['A handful of crypto coins falling and clinking together', 1.4],
	'settle-chime': ['Bright positive cash register ding with a soft sparkle, payment settled', 0.9],
	'paint-roller': ['Wet paint roller swiping across a surface, quick and juicy', 0.9],
	'magic-swap': ['Short magical whoosh with a sparkle, something transforms', 0.8],
	'arc-zip': ['Fast cartoon zip whoosh travelling across the sky', 1.0],
	'phone-ping': ['Friendly smartphone notification ping', 0.6],
	'qr-beep': ['Short shop scanner beep, successful payment', 0.5],
	'block-thud': ['Solid wooden block placed down with a satisfying chunky thud', 0.5],
	'logo-shimmer': ['Elegant rising shimmer and soft chime for a logo reveal', 1.8],
	'footsteps-cartoon': ['Light bouncy cartoon footsteps, quick little steps', 1.2],
};

const dir = new URL('../public/sfx/', import.meta.url);
mkdirSync(dir, {recursive: true});
const before = await creditsUsed();
for (const [name, [text, seconds]] of Object.entries(SFX)) {
	const file = new URL(`${name}.mp3`, dir);
	if (existsSync(file)) continue;
	const audio = await elevenlabs('/v1/sound-generation', {
		method: 'POST',
		raw: true,
		body: {text, duration_seconds: seconds, prompt_influence: 0.5},
	});
	writeFileSync(file, audio);
	console.log(`${name}.mp3`);
}
const after = await creditsUsed();
console.log(`credits ${before.used} → ${after.used} of ${after.limit}`);
