import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import {random} from 'remotion';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, inter, roundRect} from '../../kit/toy-canvas-textures';
import {ToyCard, ToyChip} from '../../kit/toy-props';

type GroupProps = ThreeElements['group'];
const QR_CELLS = 21;

/** Deterministic QR-style grid with the three finder squares, drawn in canvas pixels. */
const drawQr = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
	const c = size / QR_CELLS;
	const inFinder = (i: number, j: number) => (i < 8 && j < 8) || (i > QR_CELLS - 9 && j < 8) || (i < 8 && j > QR_CELLS - 9);
	ctx.fillStyle = colors.outline;
	for (let k = 0; k < QR_CELLS * QR_CELLS; k++) {
		const i = k % QR_CELLS;
		const j = Math.floor(k / QR_CELLS);
		if (!inFinder(i, j) && random(`qr3d-${k}`) < 0.5) ctx.fillRect(x + i * c, y + j * c, c + 0.5, c + 0.5);
	}
	const finder = (fi: number, fj: number) => {
		const fx = x + fi * c;
		const fy = y + fj * c;
		ctx.fillStyle = colors.outline;
		roundRect(ctx, fx, fy, c * 7, c * 7, c * 1.2);
		ctx.fill();
		ctx.fillStyle = colors.white;
		roundRect(ctx, fx + c, fy + c, c * 5, c * 5, c * 0.8);
		ctx.fill();
		ctx.fillStyle = colors.teal;
		roundRect(ctx, fx + c * 2, fy + c * 2, c * 3, c * 3, c * 0.6);
		ctx.fill();
	};
	finder(0, 0);
	finder(QR_CELLS - 7, 0);
	finder(0, QR_CELLS - 7);
};

/** Invoice print: header, amount, QR code and the "scan to pay" hint. */
const invoiceFace: CanvasDraw = (ctx, w, h) => {
	const pad = w * 0.09;
	ctx.textBaseline = 'alphabetic';
	inter(ctx, w * 0.1, 800);
	ctx.fillStyle = colors.ink;
	ctx.textAlign = 'left';
	ctx.fillText('INVOICE', pad, pad + w * 0.09);
	inter(ctx, w * 0.06, 600);
	ctx.fillStyle = '#6b7a78';
	ctx.textAlign = 'right';
	ctx.fillText('#0042', w - pad, pad + w * 0.085);
	inter(ctx, w * 0.15, 800);
	ctx.fillStyle = colors.teal;
	ctx.textAlign = 'left';
	ctx.fillText('$120.00', pad, pad + w * 0.29);
	const qr = w * 0.7;
	drawQr(ctx, (w - qr) / 2, pad + w * 0.38, qr);
	inter(ctx, w * 0.065, 700);
	ctx.fillStyle = colors.ink;
	ctx.textAlign = 'center';
	ctx.fillText('Scan to pay with crypto', w / 2, pad + w * 0.38 + qr + w * 0.11);
	ctx.fillStyle = colors.tealLight;
	roundRect(ctx, pad, h - pad * 0.9, w - pad * 2, pad * 0.35, pad * 0.2);
	ctx.fill();
};

/**
 * A 3D paper invoice card. `paid` 0…1 slams a PAID stamp onto its face: it starts big
 * in front of the card and lands flat, rotated like a rubber stamp.
 */
export const ToyInvoiceCard: React.FC<GroupProps & {paid: number; w?: number; h?: number}> = ({paid, w = 1.8, h = 2.6, ...group}) => (
	<group {...group}>
		<ToyCard w={w} h={h} d={0.08} draw={invoiceFace} drawKey="invoice" />
		{paid > 0 && (
			<group position={[0, h * 0.06, 0.06 + (1 - paid) * 0.8]} rotation={[0, 0, 0.24]} scale={2.2 - paid * 1.2}>
				<ToyChip label="PAID" color={colors.white} textColor={colors.teal} height={0.42} />
			</group>
		)}
	</group>
);
