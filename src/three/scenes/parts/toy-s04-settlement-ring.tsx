import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, inter, roundRect} from '../../kit/toy-canvas-textures';
import {Toy} from '../../kit/toy-mesh';
import {ToyCard} from '../../kit/toy-props';

type GroupProps = ThreeElements['group'];

/**
 * Glowing settlement ring: a glossy teal torus lying almost flat with a bright inner
 * disc and a point light. `pulse` 0…1 flares it when a coin lands inside.
 */
export const SettlementRing: React.FC<GroupProps & {radius?: number; pulse?: number}> = ({radius = 0.8, pulse = 0, ...group}) => (
	<group {...group}>
		<group rotation={[Math.PI / 2 - 0.42, 0, 0]}>
			<Toy color={colors.tealBright} outline={0.02}>
				<torusGeometry args={[radius, radius * 0.11, 20, 72]} />
			</Toy>
			<mesh>
				<circleGeometry args={[radius * 0.92, 48]} />
				<meshBasicMaterial color={colors.tealHighlight} transparent opacity={0.22 + pulse * 0.45} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
			</mesh>
			<mesh>
				<torusGeometry args={[radius, radius * 0.3, 10, 72]} />
				<meshBasicMaterial color={colors.tealBright} transparent opacity={0.1 + pulse * 0.25} depthWrite={false} toneMapped={false} />
			</mesh>
		</group>
		<pointLight color={colors.tealBright} intensity={6 + pulse * 18} distance={5} />
	</group>
);

/** Merchant dashboard face: "Settled in stablecoins", the ticking amount, a fill bar and a live dot. */
const dashboardFace =
	(amount: number, target: number): CanvasDraw =>
	(ctx, w, h) => {
		const pad = h * 0.12;
		ctx.fillStyle = colors.tealDark;
		roundRect(ctx, 0, 0, w, h, h * 0.1);
		ctx.fill();
		ctx.textBaseline = 'alphabetic';
		ctx.textAlign = 'left';
		inter(ctx, h * 0.12, 700);
		ctx.fillStyle = 'rgba(255,255,255,0.75)';
		ctx.fillText('Settled in stablecoins', pad, pad + h * 0.1);
		ctx.fillStyle = amount >= target ? colors.tealBright : 'rgba(255,255,255,0.35)';
		ctx.beginPath();
		ctx.arc(w - pad - h * 0.04, pad + h * 0.06, h * 0.04, 0, Math.PI * 2);
		ctx.fill();
		inter(ctx, h * 0.32, 800);
		ctx.fillStyle = colors.tealBright;
		ctx.fillText(`$${amount.toFixed(2)}`, pad, pad + h * 0.5);
		ctx.fillStyle = 'rgba(255,255,255,0.12)';
		roundRect(ctx, pad, h - pad - h * 0.08, w - pad * 2, h * 0.08, h * 0.04);
		ctx.fill();
		ctx.fillStyle = colors.teal;
		roundRect(ctx, pad, h - pad - h * 0.08, Math.max(h * 0.08, (w - pad * 2) * (amount / target)), h * 0.08, h * 0.04);
		ctx.fill();
	};

/** Floating dashboard panel; repaints only when the shown cent value changes. */
export const SettledDashboard: React.FC<GroupProps & {amount: number; target: number}> = ({amount, target, ...group}) => (
	<group {...group}>
		<ToyCard w={2.4} h={1.35} d={0.1} color={colors.tealShade} draw={dashboardFace(amount, target)} drawKey={amount.toFixed(2)} />
	</group>
);
