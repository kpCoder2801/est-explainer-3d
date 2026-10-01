import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, VIDEO} from '../../brand/brand-tokens';

/**
 * Motion-graphics backdrop: near-black field, a breathing dot grid with a travelling
 * wave, two slow gradient orbs (brand teal + scene accent), and a vignette.
 */
export const MgBackground: React.FC<{accent?: string; orbA?: [number, number]; orbB?: [number, number]; grid?: number}> = ({
	accent = colors.arseBlue,
	orbA = [0.28, 0.35],
	orbB = [0.75, 0.7],
	grid = 1,
}) => {
	const t = useCurrentFrame() / useVideoConfig().fps;
	const {width, height} = VIDEO;
	const step = 64;
	const dots: React.ReactNode[] = [];
	for (let y = step / 2; y < height; y += step) {
		for (let x = step / 2; x < width; x += step) {
			const wave = Math.sin(x * 0.006 + y * 0.004 - t * 1.6);
			dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.6 + Math.max(0, wave) * 1.4} fill={colors.tealBright} opacity={(0.08 + Math.max(0, wave) * 0.16) * grid} />);
		}
	}
	const ax = orbA[0] * 100 + Math.sin(t * 0.3) * 6;
	const ay = orbA[1] * 100 + Math.cos(t * 0.25) * 5;
	const bx = orbB[0] * 100 + Math.cos(t * 0.28) * 6;
	const by = orbB[1] * 100 + Math.sin(t * 0.22) * 5;
	return (
		<AbsoluteFill style={{background: colors.bgDeep}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at ${ax}% ${ay}%, rgba(0,157,146,0.34), rgba(0,157,146,0) 38%), radial-gradient(circle at ${bx}% ${by}%, ${accent}40, ${accent}00 34%)`,
				}}
			/>
			<svg width={width} height={height} style={{position: 'absolute'}}>
				{dots}
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
		</AbsoluteFill>
	);
};
