import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, inter, roundRect} from '../../kit/toy-canvas-textures';
import {ToyCard} from '../../kit/toy-props';

type GroupProps = ThreeElements['group'];

/** Greedy word wrap that shrinks the font until the text fits `maxLines` lines of `maxW` pixels. */
export const fitText = (ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number, size: number, weight = 800) => {
	for (let s = size; s > 12; s -= 2) {
		inter(ctx, s, weight);
		const lines: string[] = [];
		for (const word of text.split(' ')) {
			const next = lines.length ? `${lines[lines.length - 1]} ${word}` : word;
			if (lines.length && ctx.measureText(next).width <= maxW) lines[lines.length - 1] = next;
			else lines.push(word);
		}
		if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxW)) return {lines, size: s};
	}
	return {lines: [text], size: 12};
};

/** Card face: teal accent tab on the left, bold ink text wrapped to fit. */
const factFace =
	(text: string, accent: string): CanvasDraw =>
	(ctx, w, h) => {
		const pad = h * 0.16;
		ctx.fillStyle = accent;
		roundRect(ctx, pad * 0.6, pad, h * 0.1, h - pad * 2, h * 0.05);
		ctx.fill();
		const left = pad * 0.6 + h * 0.1 + pad * 0.8;
		const {lines, size} = fitText(ctx, text, w - left - pad, 2, h * 0.3);
		ctx.fillStyle = colors.ink;
		ctx.textBaseline = 'middle';
		const lh = size * 1.15;
		lines.forEach((l, i) => ctx.fillText(l, left, h / 2 + (i - (lines.length - 1) / 2) * lh));
	};

/**
 * A fact card that flips up off a hinge on its bottom edge (`flip` 0 = lying face
 * down toward the camera, 1 = standing), like a pop-up book page.
 */
export const FlipFactCard: React.FC<GroupProps & {text: string; flip: number; w?: number; h?: number; accent?: string}> = ({
	text,
	flip,
	w = 2.7,
	h = 1.15,
	accent = colors.teal,
	...group
}) => (
	<group {...group}>
		<group rotation={[(1 - flip) * (Math.PI / 2), 0, 0]} scale={Math.max(0.001, Math.min(1, flip * 1.6))}>
			<ToyCard w={w} h={h} d={0.1} position={[0, h / 2, 0]} draw={factFace(text, accent)} drawKey={text + accent} />
		</group>
	</group>
);
