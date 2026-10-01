import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import {random} from 'remotion';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, inter} from '../../kit/toy-canvas-textures';
import {CanvasFace, ToyCard, ToySlab} from '../../kit/toy-props';
import {Toy} from '../../kit/toy-mesh';

type GroupProps = ThreeElements['group'];

export const SUCCESS = '#3ccf7a';
/** Stall proportions; origin on the floor under the counter's centre. */
export const COUNTER = {w: 3.2, h: 1.2, d: 1.0};
/** Stall-local centre of the QR sign standing on the counter. */
export const QR_AT: [number, number, number] = [0.85, COUNTER.h + 0.5, 0.05];
const STRIPES = 8;
const QR_N = 9;

/** QR-ish code: three finder squares and seeded modules; `scanned` 0…1 washes it green. */
const drawQr =
	(scanned: number): CanvasDraw =>
	(ctx, w, h) => {
		const cell = (w * 0.8) / QR_N;
		const ox = w * 0.1;
		const oy = h - w * 0.9;
		ctx.fillStyle = colors.outline;
		for (let y = 0; y < QR_N; y++)
			for (let x = 0; x < QR_N; x++) {
				const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
				if (finder ? !(x % 6 === 1 && y % 6 === 1) : random(`qr${x}-${y}`) > 0.5) ctx.fillRect(ox + x * cell, oy + y * cell, cell * 0.92, cell * 0.92);
			}
		inter(ctx, h * 0.1, 800);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('PAY', w / 2, h * 0.07);
		if (scanned > 0) {
			ctx.fillStyle = `rgba(60,207,122,${scanned * 0.6})`;
			ctx.fillRect(0, 0, w, h);
		}
	};

const drawSign: CanvasDraw = (ctx, w, h) => {
	inter(ctx, h * 0.62, 800);
	ctx.letterSpacing = `${h * 0.12}px`;
	ctx.fillStyle = colors.white;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('SHOP', w / 2, h * 0.55);
	ctx.letterSpacing = '0px';
};

/** Little shop stall: counter, two posts, striped awning with a SHOP sign, and a QR sign on the counter. */
export const ToyShopStall: React.FC<GroupProps & {scanned: number}> = ({scanned, ...group}) => {
	const sw = (COUNTER.w + 0.2) / STRIPES;
	return (
		<group {...group}>
			<ToySlab w={COUNTER.w} h={COUNTER.h} d={COUNTER.d} r={0.14} color={colors.arseBlue} position={[0, COUNTER.h / 2, 0]} />
			<ToySlab w={COUNTER.w + 0.12} h={0.12} d={COUNTER.d + 0.12} r={0.05} color={colors.arseShade} position={[0, COUNTER.h, 0]} />
			{[-1, 1].map((s) => (
				<ToySlab key={s} w={0.16} h={2.4} d={0.16} r={0.05} color={colors.tealDark} position={[s * (COUNTER.w / 2 - 0.15), COUNTER.h + 1.2, -COUNTER.d / 2 + 0.12]} />
			))}
			{/* Awning stripes tilt down toward the customer; scalloped lips hang off the front edge. */}
			<group position={[0, COUNTER.h + 2.45, -0.1]} rotation={[0.35, 0, 0]}>
				{Array.from({length: STRIPES}, (_, i) => {
					const x = -((COUNTER.w + 0.2) / 2) + sw * (i + 0.5);
					const color = i % 2 ? colors.white : colors.arseBlue;
					return (
						<group key={i} position={[x, 0, 0]}>
							<ToySlab w={sw} h={0.08} d={1.25} r={0.03} color={color} />
							<Toy color={color} position={[0, -0.02, 0.62]} rotation={[Math.PI / 2 - 0.35, 0, 0]}>
								<cylinderGeometry args={[sw / 2, sw / 2, 0.08, 20, 1, false, -Math.PI / 2, Math.PI]} />
							</Toy>
						</group>
					);
				})}
			</group>
			<group position={[0, COUNTER.h + 2.95, -0.35]}>
				<ToySlab w={COUNTER.w + 0.4} h={0.5} d={0.14} r={0.12} color={colors.arseNavy} />
				<CanvasFace w={2.2} h={0.42} position={[0, 0, 0.073]} draw={drawSign} drawKey="shop" transparent />
			</group>
			<ToyCard w={0.82} h={0.98} d={0.06} position={QR_AT} rotation={[-0.08, -0.25, 0]} draw={drawQr(scanned)} drawKey={`qr${Math.round(scanned * 20)}`} />
		</group>
	);
};

/** Stopwatch timer chip ("3 sec") that lands when a move completes. */
export const ToyTimerChip: React.FC<GroupProps & {label: string; color?: string; height?: number}> = ({label, color = colors.arseBlue, height = 0.42, ...group}) => {
	const w = height * (1.35 + label.length * 0.29);
	const draw: CanvasDraw = (ctx, cw, ch) => {
		const r = ch * 0.27;
		const cx = ch * 0.62;
		const cy = ch * 0.56;
		ctx.lineWidth = ch * 0.07;
		ctx.strokeStyle = colors.white;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2);
		ctx.moveTo(cx, cy - r - ch * 0.04);
		ctx.lineTo(cx, cy - r - ch * 0.12);
		ctx.moveTo(cx, cy);
		ctx.lineTo(cx + r * 0.55, cy - r * 0.45);
		ctx.stroke();
		inter(ctx, ch * 0.5, 800);
		ctx.fillStyle = colors.white;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.fillText(label, ch * 1.08, ch * 0.56);
	};
	return (
		<group {...group}>
			<ToySlab w={w} h={height} d={height * 0.4} r={height * 0.5} color={color} />
			<CanvasFace w={w * 0.94} h={height * 0.9} position={[0, 0, height * 0.2 + 0.003]} draw={draw} drawKey={label} transparent />
		</group>
	);
};
