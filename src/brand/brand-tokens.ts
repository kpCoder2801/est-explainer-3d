import {loadFont} from '@remotion/google-fonts/Inter';

// Brand values come from the Estable Figma variables (brand/primary/*, brand/neutral/*)
// and the ARSe brand-asset page. Nandu gold is sampled from its logo.
export const colors = {
	bg: '#1d1d1d',
	bgDeep: '#141616',
	teal: '#009d92',
	tealBright: '#31c4ac',
	tealDark: '#1a3331',
	tealLight: '#e6f9f6',
	tealShade: '#00776e',
	tealHighlight: '#6fe3d3',
	white: '#ffffff',
	ink: '#1d1d1d',
	/** Sticker-style line art colour for mascot outlines and seams. */
	outline: '#10191d',
	// Brightened from the ARSe brand #2b9bbd per creative direction, so ARSe reads on the dark backdrop.
	arseBlue: '#33b8e6',
	arseSky: '#6fd3f0',
	arseShade: '#1c93c4',
	arseHighlight: '#b4efff',
	arseNavy: '#0e2a38',
	nanduGold: '#d4a24e',
	nanduShade: '#a87a2e',
	nanduLight: '#f0c877',
} as const;

const {fontFamily} = loadFont('normal', {weights: ['400', '600', '700', '800'], subsets: ['latin']});
export const fontInter = fontFamily;

export const VIDEO = {width: 1920, height: 1080, fps: 30} as const;
