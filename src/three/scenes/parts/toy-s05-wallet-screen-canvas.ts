import {colors} from '../../../brand/brand-tokens';
import type {CoinSymbol} from '../../../components/coin-icon';
import {coinImage, inter, roundRect} from '../../kit/toy-canvas-textures';

/** Fictional partner brands the white-label wallet re-skins into (no real third-party marks). */
export type WalletTheme = {name: string; primary: string; accent: string; bg: string; mark: 'placeholder' | 'circle' | 'diamond' | 'star'};

export const WALLET_THEMES: WalletTheme[] = [
	{name: 'YOUR LOGO', primary: '#5b6766', accent: '#b8c4c2', bg: '#eef2f1', mark: 'placeholder'},
	{name: 'NOVA', primary: '#6c4cf5', accent: '#c4b6ff', bg: '#f3f0ff', mark: 'circle'},
	{name: 'SOLA', primary: '#f08c00', accent: '#ffd88a', bg: '#fff7e8', mark: 'diamond'},
	{name: 'KORA', primary: '#e8436a', accent: '#ffb3c4', bg: '#fff0f3', mark: 'star'},
];

/** Design space of the screen (same layout units as the 2D cut's wallet screen). */
export const SCREEN_UNITS = {w: 352, h: 643};
const ROWS: Array<{symbol: CoinSymbol; name: string; amount: string}> = [
	{symbol: 'BTC', name: 'Bitcoin', amount: '0.0821'},
	{symbol: 'ETH', name: 'Ethereum', amount: '1.420'},
	{symbol: 'TRX', name: 'Tron', amount: '3,250'},
	{symbol: 'POL', name: 'Polygon', amount: '980.0'},
];
const LINE = 4;

const text = (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, weight: number, color: string, align: CanvasTextAlign = 'left') => {
	inter(ctx, size, weight);
	ctx.fillStyle = color;
	ctx.textAlign = align;
	ctx.textBaseline = 'alphabetic';
	ctx.fillText(s, x, y);
};

const fillStroke = (ctx: CanvasRenderingContext2D, fill: string, stroke: string = colors.outline, width = LINE) => {
	ctx.fillStyle = fill;
	ctx.fill();
	ctx.strokeStyle = stroke;
	ctx.lineWidth = width;
	ctx.stroke();
};

/** The brand slot: a dashed "YOUR LOGO" placeholder, or the partner mark + wordmark. */
const brandMark = (ctx: CanvasRenderingContext2D, theme: WalletTheme, logoScale: number) => {
	if (theme.mark === 'placeholder') {
		ctx.setLineDash([8, 6]);
		roundRect(ctx, 20, 22, 170, 48, 12);
		ctx.strokeStyle = theme.primary;
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.setLineDash([]);
		text(ctx, 'YOUR LOGO', 105, 54, 20, 800, theme.primary, 'center');
		return;
	}
	ctx.save();
	ctx.translate(36, 46);
	ctx.scale(logoScale, logoScale);
	ctx.lineJoin = 'round';
	if (theme.mark === 'circle') {
		ctx.beginPath();
		ctx.arc(0, 0, 15, 0, Math.PI * 2);
	} else if (theme.mark === 'diamond') {
		ctx.save();
		ctx.rotate(Math.PI / 4);
		roundRect(ctx, -12, -12, 24, 24, 4);
		ctx.restore();
	} else {
		const star = [0, -17, 5, -5, 17, -5, 7, 3, 11, 16, 0, 8, -11, 16, -7, 3, -17, -5, -5, -5];
		ctx.beginPath();
		for (let i = 0; i < star.length; i += 2) ctx[i ? 'lineTo' : 'moveTo'](star[i], star[i + 1]);
		ctx.closePath();
	}
	fillStroke(ctx, theme.primary);
	ctx.letterSpacing = '2px';
	text(ctx, theme.name, 28, 10, 28, 800, theme.primary);
	ctx.letterSpacing = '0px';
	ctx.restore();
};

/** Wallet home screen (brand slot, balance card, actions, asset list) in screen units. */
const walletScreen = (ctx: CanvasRenderingContext2D, theme: WalletTheme, logoScale: number) => {
	ctx.fillStyle = theme.bg;
	ctx.fillRect(0, 0, SCREEN_UNITS.w, SCREEN_UNITS.h);
	brandMark(ctx, theme, logoScale);
	roundRect(ctx, 16, 96, 320, 150, 22);
	fillStroke(ctx, theme.primary);
	text(ctx, 'Total balance', 36, 140, 18, 600, 'rgba(255,255,255,0.85)');
	text(ctx, '$12,480.50', 36, 198, 42, 800, colors.white);
	roundRect(ctx, 248, 208, 72, 26, 13);
	ctx.fillStyle = theme.accent;
	ctx.fill();
	text(ctx, '+2.4%', 284, 227, 15, 800, colors.ink, 'center');
	['Send', 'Receive', 'Convert'].forEach((label, i) => {
		const cx = 70 + i * 106;
		ctx.beginPath();
		ctx.arc(cx, 290, 28, 0, Math.PI * 2);
		fillStroke(ctx, theme.accent);
		// Arrow glyphs: up-right (send), down-left (receive), swap (convert).
		const glyph = [
			[[-9, 6, 9, -6], [0, -6, 9, -6], [9, -6, 9, 3]],
			[[9, -6, -9, 6], [0, 6, -9, 6], [-9, 6, -9, -3]],
			[[-10, -3, 10, -3], [5, -8, 10, -3], [10, 4, -10, 4], [-5, 9, -10, 4]],
		][i];
		ctx.beginPath();
		glyph.forEach(([x1, y1, x2, y2]) => {
			ctx.moveTo(cx + x1, 290 + y1);
			ctx.lineTo(cx + x2, 290 + y2);
		});
		ctx.strokeStyle = colors.outline;
		ctx.lineWidth = 3.5;
		ctx.lineCap = 'round';
		ctx.stroke();
		text(ctx, label, cx, 342, 15, 700, colors.ink, 'center');
	});
	ROWS.forEach((r, i) => {
		const y = 380 + i * 62;
		roundRect(ctx, 16, y, 320, 52, 14);
		fillStroke(ctx, colors.white, '#dde5e3', 2);
		const img = coinImage(r.symbol);
		if (img) ctx.drawImage(img, 27, y + 9, 34, 34);
		text(ctx, r.name, 78, y + 33, 19, 800, colors.ink);
		text(ctx, `${r.amount} ${r.symbol}`, 320, y + 33, 17, 600, '#55615f', 'right');
	});
};

/**
 * Paints the wallet in `base`, with the top `reveal` (0…1) fraction already rolled
 * over in `next` — the 3D roller sits on that seam.
 */
export const drawWalletScreen =
	(base: WalletTheme, next: WalletTheme | null, reveal: number, logoScale: number) => (ctx: CanvasRenderingContext2D, w: number, h: number) => {
		ctx.save();
		ctx.scale(w / SCREEN_UNITS.w, h / SCREEN_UNITS.h);
		walletScreen(ctx, base, logoScale);
		if (next && reveal > 0) {
			ctx.save();
			ctx.beginPath();
			ctx.rect(0, 0, SCREEN_UNITS.w, SCREEN_UNITS.h * reveal);
			ctx.clip();
			walletScreen(ctx, next, 1);
			ctx.restore();
		}
		ctx.restore();
	};
