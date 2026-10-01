import type {ThreeElements} from '@react-three/fiber';
import React from 'react';
import {colors} from '../../../brand/brand-tokens';
import {CanvasDraw, roundRect} from '../../kit/toy-canvas-textures';
import {Toy} from '../../kit/toy-mesh';
import {CanvasFace, ToyChip, ToySlab} from '../../kit/toy-props';

type GroupProps = ThreeElements['group'];
export type PaymentNodeKind = 'bank' | 'shop' | 'phone';

const AWNING_RED = '#ef6f78';

/** Classic bank: stepped base, three white columns, triangular pediment roof. ~1.3 wide. */
const ToyBank: React.FC = () => (
	<group>
		<ToySlab w={1.35} h={0.16} d={0.7} color={colors.tealLight} position={[0, -0.52, 0]} />
		<ToySlab w={1.2} h={0.1} d={0.62} color={colors.teal} position={[0, -0.4, 0]} />
		{[-0.4, 0, 0.4].map((x) => (
			<Toy key={x} color={colors.white} position={[x, -0.08, 0.05]}>
				<cylinderGeometry args={[0.09, 0.1, 0.56, 20]} />
			</Toy>
		))}
		<ToySlab w={1.25} h={0.1} d={0.66} color={colors.teal} position={[0, 0.24, 0]} />
		{/* Pediment: a 3-sided prism with one edge pointing up. */}
		<Toy color={colors.tealBright} position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.45, 1, 0.55]}>
			<cylinderGeometry args={[0.5, 0.5, 0.6, 3]} />
		</Toy>
	</group>
);

/** Corner shop: teal walls, dark door, a striped roll-down awning. */
const ToyShop: React.FC = () => (
	<group>
		<ToySlab w={1.2} h={0.85} d={0.7} color={colors.tealLight} position={[0, -0.18, 0]} />
		<ToySlab w={0.3} h={0.5} d={0.06} color={colors.tealDark} position={[-0.25, -0.35, 0.36]} />
		<ToySlab w={0.38} h={0.3} d={0.06} color={colors.teal} position={[0.25, -0.2, 0.36]} />
		<ToySlab w={1.32} h={0.14} d={0.8} color={colors.teal} position={[0, 0.3, 0]} />
		{[-0.5, -0.25, 0, 0.25, 0.5].map((x, i) => (
			<Toy key={x} color={i % 2 ? colors.white : AWNING_RED} position={[x, 0.2, 0.45]} rotation={[0, 0, Math.PI / 2]}>
				<cylinderGeometry args={[0.13, 0.13, 0.25, 20]} />
			</Toy>
		))}
		<ToySlab w={1.25} h={0.22} d={0.5} color={colors.tealBright} position={[0, 0.48, -0.05]} />
	</group>
);

/** Phone screen: a mini payment app with a balance bar and a send button. */
const phoneScreen: CanvasDraw = (ctx, w, h) => {
	ctx.fillStyle = colors.tealDark;
	roundRect(ctx, 0, 0, w, h, w * 0.12);
	ctx.fill();
	ctx.fillStyle = colors.tealBright;
	roundRect(ctx, w * 0.14, h * 0.16, w * 0.72, h * 0.12, h * 0.06);
	ctx.fill();
	ctx.fillStyle = 'rgba(255,255,255,0.35)';
	[0.38, 0.48, 0.58].forEach((y) => {
		roundRect(ctx, w * 0.14, h * y, w * (y === 0.48 ? 0.5 : 0.66), h * 0.05, h * 0.025);
		ctx.fill();
	});
	ctx.fillStyle = colors.teal;
	roundRect(ctx, w * 0.22, h * 0.74, w * 0.56, h * 0.12, h * 0.06);
	ctx.fill();
};

const ToyPhone: React.FC = () => (
	<group>
		<ToySlab w={0.74} h={1.25} d={0.14} r={0.1} color={colors.tealLight} />
		<CanvasFace w={0.62} h={1.06} position={[0, 0.02, 0.072]} draw={phoneScreen} drawKey="phone" transparent />
	</group>
);

const ICONS: Record<PaymentNodeKind, React.FC> = {bank: ToyBank, shop: ToyShop, phone: ToyPhone};
const LABELS: Record<PaymentNodeKind, string> = {bank: 'BANK', shop: 'SHOP', phone: 'PHONE'};

/**
 * One payment endpoint: a floating 3D icon with its label chip below. `glow` 0…1
 * lights a teal halo once the clean rails connect it.
 */
export const PaymentNode: React.FC<GroupProps & {kind: PaymentNodeKind; glow?: number}> = ({kind, glow = 0, ...group}) => {
	const Icon = ICONS[kind];
	return (
		<group {...group}>
			<Icon />
			<ToyChip label={LABELS[kind]} height={0.3} color={colors.tealShade} position={[0, -0.88, 0.25]} />
			{glow > 0 && (
				<mesh position={[0, 0, -0.5]}>
					<circleGeometry args={[0.85, 48]} />
					<meshBasicMaterial color={colors.tealBright} transparent opacity={glow * 0.13} depthWrite={false} toneMapped={false} />
				</mesh>
			)}
		</group>
	);
};
