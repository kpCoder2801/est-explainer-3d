// Minimal ElevenLabs REST client for project scripts. Reads ELEVENLABS_API_KEY from .env
// without ever printing it.
import {readFileSync} from 'node:fs';

const env = Object.fromEntries(
	readFileSync(new URL('../.env', import.meta.url), 'utf8')
		.split('\n')
		.filter((l) => l.includes('='))
		.map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const KEY = env.ELEVENLABS_API_KEY;
if (!KEY) throw new Error('ELEVENLABS_API_KEY missing from .env');

export const elevenlabs = async (path, {method = 'GET', body, raw = false} = {}) => {
	const res = await fetch(`https://api.elevenlabs.io${path}`, {
		method,
		headers: {'xi-api-key': KEY, ...(body ? {'Content-Type': 'application/json'} : {})},
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${(await res.text()).slice(0, 400)}`);
	return raw ? Buffer.from(await res.arrayBuffer()) : res.json();
};

export const creditsUsed = async () => {
	const s = await elevenlabs('/v1/user/subscription');
	return {tier: s.tier, used: s.character_count, limit: s.character_limit};
};
