import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, inter, roundRect} from '../../kit/toy-canvas-textures';
import {CanvasFace, ToySlab} from '../../kit/toy-props';

type GroupProps = ThreeElements['group'];

/** Value block size in world units. */
export const BLOCK = {w: 1.8, h: 0.6, d: 0.7};

/** Label on one line when it fits, else wrapped at the space nearest the middle; shrunk to fit either way. */
const drawLabel =
	(label: string): CanvasDraw =>
	(ctx, w, h) => {
		// Teal inner frame and a gloss tick, the 3D twin of the 2D sticker block.
		ctx.strokeStyle = colors.teal;
		ctx.lineWidth = h * 0.05;
		roundRect(ctx, h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12, h * 0.16);
		ctx.stroke();
		ctx.fillStyle = 'rgba(255,255,255,0.5)';
		roundRect(ctx, h * 0.16, h * 0.15, h * 0.32, h * 0.07, h * 0.04);
		ctx.fill();

		const maxW = w * 0.84;
		let size = h * 0.4;
		inter(ctx, size, 800);
		let rows = [label];
		if (ctx.measureText(label).width > maxW && label.includes(' ')) {
			const spaces = [...label].flatMap((c, i) => (c === ' ' ? [i] : []));
			const cut = spaces.reduce((a, b) => (Math.abs(b - label.length / 2) < Math.abs(a - label.length / 2) ? b : a));
			rows = [label.slice(0, cut), label.slice(cut + 1)];
			size = h * 0.32;
		}
		inter(ctx, size, 800);
		const widest = Math.max(...rows.map((r) => ctx.measureText(r).width));
		if (widest > maxW) size *= maxW / widest;
		inter(ctx, size, 800);
		ctx.fillStyle = colors.white;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		rows.forEach((r, i) => ctx.fillText(r, w / 2, h / 2 + (i - (rows.length - 1) / 2) * size * 1.08 + size * 0.04));
	};

/**
 * A glossy value block: dark-teal rounded slab with its label printed on the front.
 * Stands on its group origin (bottom-centre) so `squash` settles it onto what it lands on.
 */
export const ValueBlock3D: React.FC<GroupProps & {label: string; squash?: number}> = ({label, squash = 0, ...group}) => (
	<group {...group}>
		<group scale={[1 + squash * 0.12, 1 - squash * 0.16, 1 + squash * 0.12]}>
			<group position={[0, BLOCK.h / 2, 0]}>
				<ToySlab w={BLOCK.w} h={BLOCK.h} d={BLOCK.d} r={0.1} color={colors.tealDark} />
				<CanvasFace w={BLOCK.w * 0.96} h={BLOCK.h * 0.9} position={[0, 0, BLOCK.d / 2 + 0.004]} draw={drawLabel(label)} drawKey={label} transparent />
			</group>
		</group>
	</group>
);

/** Landing squash: a quick damped wobble after `land` (0 before it). */
export const landingSquash = (t: number, land: number, amount = 1.6) =>
	t >= land ? Math.sin(Math.min(1, (t - land) / 0.3) * Math.PI) * Math.exp(-(t - land) * 4) * amount : 0;
