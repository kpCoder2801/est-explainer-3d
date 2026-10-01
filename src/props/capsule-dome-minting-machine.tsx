import React from 'react';
import {interpolate} from 'remotion';
import {colors} from '../brand/brand-tokens';
import {Box, LabelPlate, LINE, MachineState} from './minting-machine-parts';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const coinColors = [colors.arseBlue, colors.teal, colors.nanduGold, colors.tealLight, colors.arseSky];

/** Where the minted coin leaves the chute, and where the crank sits, in the 600×700 machine box. */
export const CAPSULE_OUTLET = {x: 545, y: 600};
export const CAPSULE_CRANK = {x: 300, y: 588};

/** "Estable Coin" capsule dome (chosen concept) — glass dome of coins, crank turns, a coin rolls out the chute. */
export const CapsuleDomeMachine: React.FC<MachineState> = ({op, time}) => {
	const shake = Math.sin(time * 40) * 6 * interpolate(op, [0, 0.2, 0.9, 1], [0, 1, 1, 0], clamp);
	// Coins fill the dome from the bottom up in staggered rows.
	const rows = [
		{y: 352, xs: [170, 226, 282, 338, 394, 440]},
		{y: 304, xs: [150, 200, 254, 308, 362, 416, 456]},
		{y: 256, xs: [168, 222, 278, 334, 390, 438]},
		{y: 208, xs: [210, 264, 320, 376]},
	];
	const coins = rows.flatMap((r, ri) =>
		r.xs.map((x, ci) => ({
			x: x + ((ri + ci) % 2 ? shake : -shake),
			y: r.y + (ci % 2 ? shake * 0.6 : 0),
			c: coinColors[(ri * 3 + ci) % coinColors.length],
		})),
	);
	return (
		<g>
			<circle cx={300} cy={250} r={170} fill="rgba(230,249,246,0.10)" stroke={colors.outline} strokeWidth={LINE} />
			{coins.map((k, i) => (
				<g key={i}>
					<circle cx={k.x} cy={k.y} r={27} fill={k.c} stroke={colors.outline} strokeWidth={LINE * 0.7} />
					<circle cx={k.x - 8} cy={k.y - 8} r={6} fill={colors.white} opacity={0.6} />
				</g>
			))}
			<path d="M 190 160 A 130 130 0 0 1 300 110" stroke={colors.white} strokeOpacity={0.55} strokeWidth={12} strokeLinecap="round" fill="none" />
			<Box x={110} y={380} w={380} h={46} r={20} fill={colors.tealDark} gloss={false} />
			<Box x={130} y={420} w={340} h={260} r={30} fill={colors.teal} shade={colors.tealShade} />
			<LabelPlate x={160} y={445} w={280} h={58} text="ESTABLE COIN" size={30} />
			<circle cx={300} cy={588} r={50} fill={colors.tealLight} stroke={colors.outline} strokeWidth={LINE} />
			<g transform={`rotate(${op * 540} 300 588)`}>
				<rect x={292} y={520} width={16} height={68} rx={8} fill={colors.tealDark} stroke={colors.outline} strokeWidth={LINE * 0.7} />
				<circle cx={300} cy={522} r={16} fill="#ef6f78" stroke={colors.outline} strokeWidth={LINE * 0.7} />
			</g>
			<Box x={455} y={560} w={110} h={70} r={18} fill={colors.teal} gloss={false} />
			<rect x={505} y={575} width={52} height={40} rx={12} fill={colors.outline} />
		</g>
	);
};

