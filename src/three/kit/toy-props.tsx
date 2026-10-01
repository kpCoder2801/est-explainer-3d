import type {ThreeElements} from '@react-three/fiber';
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {colors} from '../../brand/brand-tokens';
import type {CoinSymbol} from '../../components/coin-icon';
import {CanvasDraw, coinImage, inter, useCanvasTexture} from './toy-canvas-textures';
import {weldForOutline} from './toy-materials';
import {Toy} from './toy-mesh';

type GroupProps = ThreeElements['group'];

/** Pixels per world unit for canvas faces: sharp at 1080p for props up to ~half the frame. */
const TEX_PX = 220;

const slabCache = new Map<string, {geometry: THREE.BufferGeometry; outline: THREE.BufferGeometry}>();
const slab = (w: number, h: number, d: number, r: number) => {
	const key = `${w}-${h}-${d}-${r}`;
	let s = slabCache.get(key);
	if (!s) {
		const geometry = new RoundedBoxGeometry(w, h, d, 4, Math.min(r, d / 2, w / 2, h / 2));
		s = {geometry, outline: weldForOutline(geometry)};
		slabCache.set(key, s);
	}
	return s;
};

/** Glossy rounded block — cards, phones, panels, value blocks. Centred on its group origin. */
export const ToySlab: React.FC<GroupProps & {w: number; h: number; d: number; r?: number; color: string; outline?: number | false}> = ({
	w,
	h,
	d,
	r = 0.06,
	color,
	outline,
	...group
}) => {
	const s = slab(w, h, d, r);
	return <Toy color={color} geometry={s.geometry} outlineGeometry={s.outline} outline={outline} {...group} />;
};

/** A flat canvas-textured face (screen, card print). Draws in pixels at TEX_PX per world unit. */
export const CanvasFace: React.FC<GroupProps & {w: number; h: number; draw: CanvasDraw; drawKey: string; transparent?: boolean}> = ({
	w,
	h,
	draw,
	drawKey,
	transparent = false,
	...group
}) => {
	const tex = useCanvasTexture(Math.round(w * TEX_PX), Math.round(h * TEX_PX), draw, drawKey);
	return (
		<group {...group}>
			<mesh>
				<planeGeometry args={[w, h]} />
				<meshBasicMaterial map={tex} transparent={transparent} toneMapped={false} />
			</mesh>
		</group>
	);
};

/**
 * A card: glossy slab with a printed front face. `draw` paints the face in canvas
 * pixels (w × h × TEX_PX); change `drawKey` to repaint.
 */
export const ToyCard: React.FC<GroupProps & {w: number; h: number; d?: number; color?: string; draw: CanvasDraw; drawKey: string}> = ({
	w,
	h,
	d = 0.08,
	color = colors.white,
	draw,
	drawKey,
	...group
}) => (
	<group {...group}>
		<ToySlab w={w} h={h} d={d} r={Math.min(w, h) * 0.08} color={color} />
		<CanvasFace w={w * 0.94} h={h * 0.94} position={[0, 0, d / 2 + 0.002]} draw={draw} drawKey={drawKey} transparent />
	</group>
);

/** Pill chip with a label, like the 2D `PopChip`. Width follows the text. */
export const ToyChip: React.FC<GroupProps & {label: string; color?: string; textColor?: string; height?: number}> = ({
	label,
	color = colors.teal,
	textColor = colors.white,
	height = 0.36,
	...group
}) => {
	const w = height * (0.9 + label.length * 0.32);
	const draw: CanvasDraw = (ctx, cw, ch) => {
		inter(ctx, ch * 0.5, 800);
		ctx.fillStyle = textColor;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(label, cw / 2, ch * 0.54);
	};
	return (
		<group {...group}>
			<ToySlab w={w} h={height} d={height * 0.4} r={height * 0.5} color={color} />
			<CanvasFace w={w * 0.9} h={height * 0.9} position={[0, 0, height * 0.2 + 0.003]} draw={draw} drawKey={label + textColor} transparent />
		</group>
	);
};

/** Crypto coin: a thick glossy disc with the real currency logo printed on both faces. */
export const ToyCoin: React.FC<GroupProps & {symbol: CoinSymbol; radius?: number}> = ({symbol, radius = 0.35, ...group}) => {
	const draw: CanvasDraw = (ctx, w, h) => {
		const img = coinImage(symbol);
		if (img) ctx.drawImage(img, 0, 0, w, h);
	};
	const tex = useCanvasTexture(256, 256, draw, symbol);
	const face = useMemo(() => new THREE.MeshPhysicalMaterial({map: tex, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1}), [tex]);
	const thick = radius * 0.22;
	return (
		<group {...group}>
			<Toy color={colors.outline} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} outline={false}>
				<cylinderGeometry args={[radius * 1.04, radius * 1.04, thick * 0.96, 40]} />
			</Toy>
			{[1, -1].map((side) => (
				<mesh key={side} material={face} position={[0, 0, (side * thick) / 2 + side * 0.001]} rotation={[0, side < 0 ? Math.PI : 0, 0]}>
					<circleGeometry args={[radius, 40]} />
				</mesh>
			))}
		</group>
	);
};

/** Estable stable coin: teal disc with the white triangle mark embossed on each face. */
export const ToyStableCoin: React.FC<GroupProps & {radius?: number}> = ({radius = 0.3, ...group}) => {
	const thick = radius * 0.24;
	const draw: CanvasDraw = (ctx, w, h) => {
		ctx.fillStyle = colors.white;
		ctx.beginPath();
		ctx.moveTo(w * 0.5, h * 0.2);
		ctx.lineTo(w * 0.8, h * 0.74);
		ctx.lineTo(w * 0.2, h * 0.74);
		ctx.closePath();
		ctx.lineJoin = 'round';
		ctx.lineWidth = w * 0.05;
		ctx.strokeStyle = colors.white;
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = colors.teal;
		ctx.beginPath();
		ctx.moveTo(w * 0.5, h * 0.44);
		ctx.lineTo(w * 0.64, h * 0.66);
		ctx.lineTo(w * 0.36, h * 0.66);
		ctx.closePath();
		ctx.fill();
	};
	return (
		<group {...group}>
			<Toy color={colors.teal} rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry args={[radius, radius, thick, 40]} />
			</Toy>
			{[1, -1].map((side) => (
				<CanvasFace
					key={side}
					w={radius * 1.5}
					h={radius * 1.5}
					position={[0, 0, (side * thick) / 2 + side * 0.002]}
					rotation={[0, side < 0 ? Math.PI : 0, 0]}
					draw={draw}
					drawKey="stable"
					transparent
				/>
			))}
		</group>
	);
};
