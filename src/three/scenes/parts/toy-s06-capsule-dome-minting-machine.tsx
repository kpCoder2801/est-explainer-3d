import type {ThreeElements} from '@react-three/fiber';
import React, {useMemo} from 'react';
import {random} from 'remotion';
import * as THREE from 'three';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, inter} from '../../kit/toy-canvas-textures';
import {Toy} from '../../kit/toy-mesh';
import {ToyCard, ToySlab, ToyStableCoin} from '../../kit/toy-props';
import type {V3} from '../../kit/toy-stage';

type GroupProps = ThreeElements['group'];

/** Machine proportions in world units, origin on the floor under the base centre. */
const BASE = {w: 2.3, h: 1.6, d: 1.5};
const DOME = {y: 2.55, r: 1.05};
/** Machine-local mouth of the chute (front-right of the base) where ARSe shoots out. */
export const CHUTE_OUTLET: V3 = [0.72, 0.42, BASE.d / 2 + 0.32];
/** Machine-local crank hub on the left face of the base (the side Estable stands on). */
const HUB: V3 = [-BASE.w / 2 - 0.05, 1.0, 0.1];
const COIN_COLORS = [colors.arseBlue, colors.teal, colors.nanduGold, colors.tealLight, colors.arseSky];
const COINS = 56;

const glass = new THREE.MeshPhysicalMaterial({
	color: colors.tealLight,
	transparent: true,
	opacity: 0.16,
	roughness: 0.04,
	clearcoat: 1,
	clearcoatRoughness: 0.03,
	depthWrite: false,
});
const gleam = new THREE.MeshBasicMaterial({color: colors.white, transparent: true, opacity: 0.6, toneMapped: false});

const drawLabel: CanvasDraw = (ctx, w, h) => {
	inter(ctx, h * 0.5, 800);
	ctx.letterSpacing = `${h * 0.06}px`;
	ctx.fillStyle = colors.tealShade;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText('ESTABLE COIN', w / 2, h * 0.54);
	ctx.letterSpacing = '0px';
};

/** A coin pile resting in the bottom of the dome, deterministic per index. */
const usePile = () =>
	useMemo(
		() =>
			Array.from({length: COINS}, (_, i) => {
				const y = -0.8 + Math.pow(random(`cy${i}`), 1.25) * 1.15;
				const span = Math.sqrt(Math.max(0, DOME.r * DOME.r - y * y)) * 0.78;
				const a = random(`ca${i}`) * Math.PI * 2;
				const rr = Math.sqrt(random(`cr${i}`)) * span;
				return {
					p: [Math.cos(a) * rr, y, Math.sin(a) * rr] as V3,
					rot: [random(`rx${i}`) * Math.PI, random(`ry${i}`) * Math.PI, random(`rz${i}`) * Math.PI] as V3,
					color: COIN_COLORS[i % COIN_COLORS.length],
					stable: i % 6 === 0,
				};
			}),
		[],
	);

/**
 * "Estable Coin" capsule-dome minting machine: glass dome full of coins on a teal
 * base with a label, a crank on its left side and a chute on the front.
 * `crank` is crank turns (radians), `rattle` 0…1 shakes the coin pile.
 */
export const ToyCapsuleDomeMachine: React.FC<GroupProps & {crank: number; rattle: number; time: number}> = ({crank, rattle, time, ...group}) => {
	const pile = usePile();
	return (
		<group {...group}>
			<ToySlab w={BASE.w} h={BASE.h} d={BASE.d} r={0.24} color={colors.teal} position={[0, BASE.h / 2, 0]} />
			<ToySlab w={BASE.w + 0.08} h={0.14} d={BASE.d + 0.08} r={0.07} color={colors.tealShade} position={[0, 0.07, 0]} />
			<ToyCard w={1.86} h={0.42} d={0.06} color={colors.tealLight} position={[0, 1.18, BASE.d / 2 + 0.02]} draw={drawLabel} drawKey="estable-coin" />
			{/* Chute: a boxy spout with a dark mouth on the front-right. */}
			<ToySlab w={0.66} h={0.56} d={0.42} r={0.12} color={colors.teal} position={[CHUTE_OUTLET[0], CHUTE_OUTLET[1], BASE.d / 2 + 0.12]} />
			<ToySlab w={0.46} h={0.32} d={0.06} r={0.08} color={colors.outline} outline={false} position={[CHUTE_OUTLET[0], CHUTE_OUTLET[1] - 0.02, BASE.d / 2 + 0.31]} />
			{/* Crank: hub disc, arm and red knob turning about the x axis on the left face. */}
			<group position={HUB}>
				<Toy color={colors.tealLight} rotation={[0, 0, Math.PI / 2]}>
					<cylinderGeometry args={[0.28, 0.28, 0.1, 32]} />
				</Toy>
				<group rotation={[crank, 0, 0]}>
					<ToySlab w={0.1} h={0.44} d={0.1} r={0.05} color={colors.tealDark} position={[-0.1, 0.18, 0]} />
					<Toy color="#ef6f78" position={[-0.2, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
						<cylinderGeometry args={[0.09, 0.09, 0.22, 20]} />
					</Toy>
				</group>
			</group>
			<Toy color={colors.tealDark} position={[0, BASE.h + 0.12, 0]}>
				<cylinderGeometry args={[DOME.r * 0.98, DOME.r * 0.98, 0.24, 48]} />
			</Toy>
			{/* Coins rattle inside the dome while the crank turns. */}
			<group position={[0, DOME.y, 0]}>
				{pile.map((c, i) => {
					const j = rattle * 0.06;
					const p: V3 = [c.p[0] + Math.sin(time * 41 + i) * j, c.p[1] + Math.abs(Math.sin(time * 37 + i * 2.1)) * j * 1.6, c.p[2] + Math.cos(time * 43 + i) * j];
					const rot: V3 = [c.rot[0] + Math.sin(time * 29 + i) * rattle * 0.5, c.rot[1], c.rot[2]];
					return c.stable ? (
						<ToyStableCoin key={i} radius={0.17} position={p} rotation={rot} />
					) : (
						<Toy key={i} color={c.color} position={p} rotation={rot} outline={0.012}>
							<cylinderGeometry args={[0.17, 0.17, 0.05, 24]} />
						</Toy>
					);
				})}
				<mesh material={glass}>
					<sphereGeometry args={[DOME.r, 48, 32]} />
				</mesh>
				{/* Glass gleam: a thin arc riding the upper-left front of the dome. */}
				<mesh material={gleam} position={[0, 0, 0.55]} rotation={[0, 0, 1.75]}>
					<torusGeometry args={[0.86, 0.03, 8, 36, 1.0]} />
				</mesh>
			</group>
			<Toy color={colors.tealDark} position={[0, DOME.y + DOME.r - 0.02, 0]}>
				<sphereGeometry args={[0.13, 20, 14]} />
			</Toy>
		</group>
	);
};

/** World position of the chute mouth for a machine at `at`. */
export const chuteWorld = (at: V3): V3 => [at[0] + CHUTE_OUTLET[0], at[1] + CHUTE_OUTLET[1], at[2] + CHUTE_OUTLET[2]];

/** Expanding ring burst (e.g. at the chute when ARSe pops out). `p` 0…1. */
export const RingBurst: React.FC<GroupProps & {p: number; color: string}> = ({p, color, ...group}) =>
	p <= 0 || p >= 1 ? null : (
		<group {...group} scale={0.15 + p * 1.05}>
			<mesh>
				<torusGeometry args={[1, 0.04, 8, 48]} />
				<meshBasicMaterial color={color} transparent opacity={1 - p} toneMapped={false} depthWrite={false} />
			</mesh>
		</group>
	);
