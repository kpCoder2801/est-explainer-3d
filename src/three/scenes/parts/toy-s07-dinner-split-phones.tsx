import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, inter, roundRect} from '../../kit/toy-canvas-textures';
import {CanvasFace, ToyCard, ToySlab} from '../../kit/toy-props';

type GroupProps = ThreeElements['group'];

const SUCCESS = '#3ccf7a';
export const SPLIT_PHONE = {w: 1.2, h: 2.2, d: 0.14};

const centered = (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color: string) => {
	inter(ctx, size, 800);
	ctx.fillStyle = color;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(s, x, y);
};

/** ARSe wallet screen showing the received half-bill; `done` draws the green check. */
const drawSplitScreen =
	(done: boolean): CanvasDraw =>
	(ctx, w, h) => {
		ctx.fillStyle = colors.arseNavy;
		ctx.fillRect(0, 0, w, h);
		roundRect(ctx, w * 0.12, h * 0.05, w * 0.76, h * 0.13, h * 0.03);
		ctx.fillStyle = colors.arseBlue;
		ctx.fill();
		centered(ctx, 'ARSe', w / 2, h * 0.117, h * 0.07, colors.white);
		centered(ctx, '½ bill', w / 2, h * 0.33, h * 0.085, colors.white);
		centered(ctx, 'ARS 18.500', w / 2, h * 0.43, h * 0.055, colors.arseSky);
		if (!done) return;
		ctx.beginPath();
		ctx.arc(w / 2, h * 0.66, w * 0.22, 0, Math.PI * 2);
		ctx.fillStyle = SUCCESS;
		ctx.fill();
		ctx.lineWidth = w * 0.025;
		ctx.strokeStyle = colors.outline;
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(w * 0.4, h * 0.66);
		ctx.lineTo(w * 0.47, h * 0.7);
		ctx.lineTo(w * 0.61, h * 0.61);
		ctx.lineWidth = w * 0.05;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = colors.white;
		ctx.stroke();
	};

/** Phone on a small stand; its screen receives half of the bill. */
export const ToySplitPhone: React.FC<GroupProps & {done: boolean}> = ({done, ...group}) => (
	<group {...group}>
		<ToySlab w={0.9} h={0.18} d={0.6} r={0.08} color={colors.arseShade} position={[0, 0.09, -0.04]} />
		<group position={[0, 0.14 + SPLIT_PHONE.h / 2, 0]}>
			<ToySlab w={SPLIT_PHONE.w} h={SPLIT_PHONE.h} d={SPLIT_PHONE.d} r={0.13} color="#1f2a2c" />
			<CanvasFace w={SPLIT_PHONE.w - 0.12} h={SPLIT_PHONE.h - 0.22} position={[0, 0, SPLIT_PHONE.d / 2 + 0.003]} draw={drawSplitScreen(done)} drawKey={done ? 'done' : 'wait'} />
		</group>
	</group>
);

const drawReceipt: CanvasDraw = (ctx, w, h) => {
	centered(ctx, 'DINNER', w / 2, h * 0.14, h * 0.09, colors.arseNavy);
	ctx.strokeStyle = colors.arseSky;
	ctx.lineCap = 'round';
	ctx.lineWidth = h * 0.025;
	[0.3, 0.4, 0.5].forEach((y) => {
		ctx.beginPath();
		ctx.moveTo(w * 0.15, h * y);
		ctx.lineTo(w * 0.85, h * y);
		ctx.stroke();
	});
	centered(ctx, 'ARS 37.000', w / 2, h * 0.7, h * 0.08, colors.arseNavy);
	ctx.setLineDash([h * 0.03, h * 0.02]);
	ctx.strokeStyle = '#9fb3ba';
	ctx.lineWidth = h * 0.01;
	ctx.beginPath();
	ctx.moveTo(w / 2, h * 0.82);
	ctx.lineTo(w / 2, h * 0.98);
	ctx.stroke();
	ctx.setLineDash([]);
};

const drawHalf: CanvasDraw = (ctx, w, h) => centered(ctx, '½', w / 2, h * 0.5, h * 0.3, colors.arseNavy);

/** The whole dinner bill card, shown before the split. */
export const ToyDinnerReceipt: React.FC<GroupProps> = (group) => <ToyCard w={1.2} h={1.7} d={0.05} draw={drawReceipt} drawKey="receipt" {...group} />;

/** One torn half of the bill, flying to a phone. */
export const ToyReceiptHalf: React.FC<GroupProps> = (group) => <ToyCard w={0.6} h={1.7} d={0.05} draw={drawHalf} drawKey="half" {...group} />;
