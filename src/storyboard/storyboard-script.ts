import type {MascotId} from '../mascots/mascot';

export type ScriptLine = {speaker: MascotId; text: string};

export type StoryboardScene = {
	id: string;
	title: string;
	/** What happens on screen — the interaction brief for animation. */
	visual: string;
	lines: ScriptLine[];
	cast: MascotId[];
	/** Silent action time after the last line (seconds). */
	tail: number;
	/** Silent lead-in before the first line (seconds). */
	lead: number;
};

/**
 * The script. Copy is taken from the Estable and ARSe landing pages (see README).
 * Durations are estimated from word count until real VO exists.
 */
export const STORYBOARD: StoryboardScene[] = [
	{
		id: 's01-hello',
		title: 'Hello, network',
		visual: 'Dark hero backdrop. Network nodes drift, then rush to the centre and snap into the Estable triangle. It pops alive: eyes open, a bounce, a wave to camera.',
		lines: [{speaker: 'estable', text: "Psst, over here! Hi, I'm Estable."}],
		cast: ['estable'],
		lead: 2.6,
		tail: 1,
	},
	{
		id: 's02-who',
		title: 'Who we are',
		visual: 'Estable walks onto a stylised globe and plants a pin in El Salvador. Fact cards flip up beside it: "A Tether portfolio company", "Founded by ex-Bitfinex & Tether builders".',
		lines: [
			{
				speaker: 'estable',
				text: "I'm a Tether portfolio company from El Salvador, founded by crypto builders from Bitfinex and Tether. We build the rails for digital money.",
			},
		],
		cast: ['estable'],
		lead: 0.6,
		tail: 0.8,
	},
	{
		id: 's03-problem',
		title: 'The tangle',
		visual: 'Bank, shop and phone icons linked by a messy knot of cables that flicker red. Estable grabs a loose end and pulls; the knot snaps into three clean teal lines.',
		lines: [{speaker: 'estable', text: "Payments are evolving, but the infrastructure hasn't kept up. It's complex, fragmented, and slow. Let's fix that."}],
		cast: ['estable'],
		lead: 0.4,
		tail: 1,
	},
	{
		id: 's04-pay',
		title: 'Estable Pay',
		visual: 'An invoice card slides in with a QR code. Bitcoin, Ethereum and Tron coins rain into a settlement ring Estable holds up; teal stable coins drop out and stack while a dashboard counter ticks.',
		lines: [
			{
				speaker: 'estable',
				text: 'With Estable Pay, businesses send an invoice, customers pay in crypto, and the money settles in stable value. Instantly.',
			},
		],
		cast: ['estable'],
		lead: 0.4,
		tail: 0.8,
	},
	{
		id: 's05-wallet',
		title: 'Estable Wallet',
		visual: 'A giant phone. Estable rolls a paint roller down the screen and the wallet re-skins through three brand colours, logo slot swapping each pass.',
		lines: [
			{
				speaker: 'estable',
				text: 'With Estable Wallet, you launch your own branded crypto wallet. No building from scratch. We deliver it, you put your name on it.',
			},
		],
		cast: ['estable'],
		lead: 0.4,
		tail: 0.8,
	},
	{
		id: 's06-coin',
		title: 'Estable Coin mints ARSe',
		visual: 'An "Estable Coin" capsule-dome machine full of coins drops in. Estable turns the crank, the dome rattles, and ARSe shoots out of the chute, lands with a squash and introduces itself. "1 ARSe = 1 ARS" and "Verifiable reserves" chips pop beside it.',
		lines: [
			{speaker: 'estable', text: 'And with Estable Coin, institutions issue their own stablecoins. Like this one!'},
			{speaker: 'arse', text: "Hi! I'm ARSe, the Argentine peso stablecoin. Backed one to one by pesos, with reserves you can verify."},
		],
		cast: ['estable', 'arse'],
		lead: 0.4,
		tail: 1,
	},
	{
		id: 's07-arse-life',
		title: 'ARSe in action',
		visual: 'ARSe zips along an arc from Argentina across the globe (remittance), splits a dinner bill between two phones, then taps a shop QR. Each move lands with a "seconds" timer chip.',
		lines: [{speaker: 'arse', text: 'Send money across borders, split a dinner, or pay at a shop. In seconds, with low fees, on Polygon.'}],
		cast: ['arse'],
		lead: 0.3,
		tail: 0.8,
	},
	{
		id: 's08-nandu',
		title: 'Nandu runs in',
		visual: 'Nandu sprints in 8-bit style with pixel dust, skids to a stop and faces camera. A pixel phone drops in; a key falls into it and locks with a sparkle. Title stamps word by word: "Your crypto. Your wallet. Your control."',
		lines: [
			{
				speaker: 'nandu',
				text: "Coming through! I'm Nandu, a self-custody wallet on Polygon. Your keys stay on your device. Your crypto, your wallet, your control.",
			},
		],
		cast: ['nandu'],
		lead: 1.4,
		tail: 1.2,
	},
	{
		id: 's09-why',
		title: 'Why Estable',
		visual: 'The three mascots carry value blocks in from the sides — Real-time settlement, Compliance-ready, Fast to market, Modular APIs, End-to-end — and stack them into the Estable triangle.',
		lines: [
			{speaker: 'estable', text: 'Real-time settlement. Compliance-ready. Fast to market. One modular stack, end to end.'},
			{speaker: 'arse', text: 'For fintechs, banks, and PSPs.'},
		],
		cast: ['estable', 'arse', 'nandu'],
		lead: 0.4,
		tail: 0.8,
	},
	{
		id: 's10-outro',
		title: 'Unlock the future',
		visual: 'All three line up and wave. The triangle logo resolves in the hero glow with "Unlock the future of digital finance" and estable.io.',
		lines: [
			{speaker: 'estable', text: 'Estable. Unlock the future of digital finance.'},
			{speaker: 'arse', text: 'See you at'},
			{speaker: 'nandu', text: 'estable dot io!'},
		],
		cast: ['estable', 'arse', 'nandu'],
		lead: 0.4,
		tail: 2,
	},
];
