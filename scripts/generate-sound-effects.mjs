// Generates the sound-effect library with ElevenLabs Sound Effects into public/sfx/.
// Existing files are kept, so re-running only fills in new entries.
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, renameSync, writeFileSync} from 'node:fs';
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
	// Motion-graphics cut: crisp, digital, premium tech-promo sound design.
	'mg-whoosh': ['Fast clean airy whoosh for a motion graphics element flying past', 0.7],
	'mg-transition': ['Big wide cinematic swoosh transition with a subtle reverse cymbal, modern tech promo', 1.1],
	'mg-tick': ['Soft precise UI click tick', 0.5],
	'mg-impact': ['Short deep cinematic impact hit with sub bass, punchy and clean', 0.9],
	'mg-riser': ['Short rising synth riser building tension into a hit', 1.5],
	'mg-glitch': ['Quick digital glitch stutter, data corruption blip', 0.6],
	'mg-pop': ['Clean bubbly synth pop, modern UI', 0.5],
	'mg-sparkle': ['Bright digital sparkle shimmer, magical tech', 1.2],
	'mg-type': ['Rapid soft keyboard typing ticks for kinetic typography', 1.0],
	'mg-data': ['Quick sequence of soft digital data beeps, futuristic interface', 0.9],
	'mg-confirm': ['Satisfying digital success confirm chime, modern fintech app', 0.8],
	'mg-coin': ['Bright digital coin chime with a glassy shimmer', 0.7],
	'mg-bass-drop': ['Short deep sub bass drop boom for a logo reveal', 1.2],
};

/**
 * Motion-graphics effects come back from the API at wildly different levels (a near-silent
 * impact next to a full-scale bass drop), so they are loudness-normalised to one target.
 * The v1 effects are left as generated so the approved v1 mix does not change.
 */
const normalize = (path) => {
	const tmp = `${path}.norm.mp3`;
	execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path, '-af', 'loudnorm=I=-20:TP=-4:LRA=11', '-ar', '44100', '-c:a', 'libmp3lame', '-q:a', '2', tmp]);
	renameSync(tmp, path);
};

if (process.argv.includes('--normalize-mg')) {
	for (const name of Object.keys(SFX).filter((n) => n.startsWith('mg-'))) normalize(new URL(`../public/sfx/${name}.mp3`, import.meta.url).pathname);
	console.log('normalised mg-* effects');
	process.exit(0);
}

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
	if (name.startsWith('mg-')) normalize(file.pathname);
	console.log(`${name}.mp3`);
}
const after = await creditsUsed();
console.log(`credits ${before.used} → ${after.used} of ${after.limit}`);
