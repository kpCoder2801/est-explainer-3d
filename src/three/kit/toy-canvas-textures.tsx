import {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';
import {fontInter} from '../../brand/brand-tokens';
import type {CoinSymbol} from '../../components/coin-icon';

/**
 * Text, UI screens and coin faces in the 3D cut are drawn onto 2D canvases and used
 * as textures. @remotion/three only redraws when the frame changes, so everything a
 * canvas needs (Inter weights, coin SVGs) is loaded before the scene canvas mounts.
 */
const COINS: CoinSymbol[] = ['BTC', 'ETH', 'TRX', 'POL'];
const coinImages = new Map<CoinSymbol, HTMLImageElement>();
let assetsPromise: Promise<unknown> | null = null;

const loadAssets = () =>
	(assetsPromise ??= Promise.all([
		...['600', '700', '800'].map((w) => document.fonts.load(`${w} 40px ${fontInter}`)),
		...COINS.map(
			(s) =>
				new Promise<void>((resolve) => {
					const img = new Image();
					img.onload = () => {
						coinImages.set(s, img);
						resolve();
					};
					img.onerror = () => resolve();
					img.src = staticFile(`ccy/${s}.svg`);
				}),
		),
	]).then(() => document.fonts.ready));

/** Holds the render until fonts and coin images are ready; mount 3D content only when true. */
export const useToyAssetsReady = () => {
	const [ready, setReady] = useState(false);
	const [handle] = useState(() => delayRender('Loading fonts and coin art for 3D textures'));
	useEffect(() => {
		loadAssets().then(() => {
			setReady(true);
			continueRender(handle);
		});
	}, [handle]);
	return ready;
};

export const coinImage = (s: CoinSymbol) => coinImages.get(s);

export type CanvasDraw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/**
 * A canvas-backed texture redrawn whenever `key` changes (e.g. a counter value or a
 * wallet skin). Drawing happens during render so the texture is current before
 * @remotion/three advances the frame.
 */
export const useCanvasTexture = (w: number, h: number, draw: CanvasDraw, key: string) => {
	const tex = useMemo(() => {
		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		const t = new THREE.CanvasTexture(canvas);
		t.colorSpace = THREE.SRGBColorSpace;
		t.anisotropy = 8;
		return t;
	}, [w, h]);
	useMemo(() => {
		const canvas = tex.image as HTMLCanvasElement;
		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, w, h);
		draw(ctx, w, h);
		tex.needsUpdate = true;
	}, [tex, key]);
	useEffect(() => () => tex.dispose(), [tex]);
	return tex;
};

/** Rounded-rectangle path helper for canvas drawing. */
export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, r);
};

/** Sets an Inter font on the context (`weight` 600/700/800). */
export const inter = (ctx: CanvasRenderingContext2D, size: number, weight = 700) => {
	ctx.font = `${weight} ${size}px ${fontInter}`;
};
