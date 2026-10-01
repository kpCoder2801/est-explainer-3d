import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fontInter} from '../brand/brand-tokens';
import {Sfx} from '../audio/sound-effects';
import {CoinIcon, CoinSymbol} from './coin-icon';

/** Pill label that springs in at `at` seconds — the site's rounded-pill language. */
export const PopChip: React.FC<{at: number; x: number; y: number; label: string; color?: string; dark?: boolean; size?: number; coin?: CoinSymbol}> = ({
	at,
	x,
	y,
	label,
	color = colors.teal,
	dark = false,
	size = 30,
	coin,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - at * fps, fps, config: {damping: 11, stiffness: 160}});
	return (
		<>
			<Sfx name="chip-pop" at={at} volume={0.7} />
			{s > 0.001 && (
				<div
					style={{
						position: 'absolute',
						left: x,
						top: y,
						transform: `translate(-50%, -50%) scale(${s})`,
						background: dark ? 'rgba(20,22,22,0.85)' : color,
						border: `2px solid ${color}`,
						color: dark ? colors.white : colors.ink,
						fontFamily: fontInter,
						fontWeight: 700,
						fontSize: size,
						padding: `${size * 0.4}px ${size * 0.9}px`,
						borderRadius: 999,
						whiteSpace: 'nowrap',
						display: 'flex',
						alignItems: 'center',
						gap: size * 0.4,
					}}
				>
					{coin && <CoinIcon symbol={coin} size={size * 1.25} />}
					{label}
				</div>
			)}
		</>
	);
};
