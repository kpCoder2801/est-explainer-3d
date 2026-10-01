// Voice casting: designs 3 candidate voices per mascot with ElevenLabs Voice Design and
// saves the previews to public/voice-casting/ plus their generated_voice_id values,
// which are needed later to keep the chosen voice.
import {mkdirSync, writeFileSync} from 'node:fs';
import {creditsUsed, elevenlabs} from './elevenlabs-client.mjs';

const CAST = {
	estable: {
		description:
			'A warm, confident middle-aged male host with a neutral American accent. Friendly and charismatic, like a great keynote presenter, with a playful smile in his voice. Clear enunciation, upbeat conversational pace. Studio-quality recording.',
		text: "Psst, over here! Hi, I'm Estable. I'm a Tether portfolio company from El Salvador, founded by crypto builders from Bitfinex and Tether. We build the rails for digital money.",
	},
	arse: {
		description:
			'A bright, upbeat young adult female voice with a slight Argentine Spanish accent speaking English. Bubbly, quick and charming, like a lively cartoon character with a warm smile. Perfect audio quality.',
		text: "Hi! I'm ARSe, the Argentine peso stablecoin. Backed one to one by pesos, with reserves you can verify. Send money across borders, split a dinner, or pay at a shop.",
	},
	nandu: {
		description:
			'A young, energetic and playful male cartoon character voice, slightly high-pitched and quirky, fast and bouncy delivery like a retro video game hero. American accent. Perfect audio quality.',
		text: "Coming through! I'm Nandu, a self-custody wallet on Polygon. Your keys stay on your device. Your crypto, your wallet, your control.",
	},
};

const outDir = new URL('../public/voice-casting/', import.meta.url);
mkdirSync(outDir, {recursive: true});
const before = await creditsUsed();
const manifest = {};

for (const [id, brief] of Object.entries(CAST)) {
	const res = await elevenlabs('/v1/text-to-voice/create-previews', {
		method: 'POST',
		body: {voice_description: brief.description, text: brief.text},
	});
	manifest[id] = {description: brief.description, text: brief.text, options: []};
	res.previews.forEach((p, i) => {
		const file = `${id}-option-${i + 1}.mp3`;
		writeFileSync(new URL(file, outDir), Buffer.from(p.audio_base_64, 'base64'));
		manifest[id].options.push({file, generated_voice_id: p.generated_voice_id, duration_secs: p.duration_secs});
	});
	console.log(`${id}: ${res.previews.length} previews`);
}

writeFileSync(new URL('manifest.json', outDir), JSON.stringify(manifest, null, 2));
const after = await creditsUsed();
console.log(`credits: ${before.used} → ${after.used} of ${after.limit} (${after.tier})`);
