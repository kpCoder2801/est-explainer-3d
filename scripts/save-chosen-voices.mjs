// Saves the chosen Voice Design previews as permanent voices on the ElevenLabs account
// and records their voice ids in src/audio/voice-cast.json (used by VO generation).
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {elevenlabs} from './elevenlabs-client.mjs';

const CHOSEN = {estable: 2, arse: 2, nandu: 2}; // option numbers picked in review
const NAMES = {estable: 'Estable mascot', arse: 'ARSe mascot', nandu: 'Nandu mascot'};
const manifest = JSON.parse(readFileSync(new URL('../public/voice-casting/manifest.json', import.meta.url), 'utf8'));
const castFile = new URL('../src/audio/voice-cast.json', import.meta.url);
mkdirSync(new URL('../src/audio/', import.meta.url), {recursive: true});

const cast = {};
for (const [id, option] of Object.entries(CHOSEN)) {
	const pick = manifest[id].options[option - 1];
	const voice = await elevenlabs('/v1/text-to-voice', {
		method: 'POST',
		body: {voice_name: NAMES[id], voice_description: manifest[id].description, generated_voice_id: pick.generated_voice_id},
	});
	cast[id] = {voice_id: voice.voice_id, name: NAMES[id], option};
	console.log(`${id}: saved option ${option}`);
}
writeFileSync(castFile, JSON.stringify(cast, null, 2));
