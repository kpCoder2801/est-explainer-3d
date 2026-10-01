import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, VIDEO} from '../brand/brand-tokens';

/**
 * The landing-page hero backdrop: near-black field, teal glow, and a drifting
 * node network. Deterministic (seeded) so every render is identical.
 */
export const BrandNetworkBackground: React.FC<{
	glowX?: number;
	glowY?: number;
	density?: number;
	seed?: string;
	reveal?: number;
}> = ({glowX = 0.7, glowY = 0.45, density = 70, seed = 'net', reveal = 1}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	// Fixed scene space (not the composition size) so scenes can be embedded scaled, e.g. on the storyboard board.
	const {width, height} = VIDEO;
	const t = frame / fps;
	const nodes = useMemo(
		() =>
			Array.from({length: density}, (_, i) => ({
				x: random(`${seed}x${i}`) * width,
				y: random(`${seed}y${i}`) * height,
				r: 1.5 + random(`${seed}r${i}`) * 3,
				ph: random(`${seed}p${i}`) * Math.PI * 2,
				sp: 0.15 + random(`${seed}s${i}`) * 0.35,
			})),
		[density, seed, width, height],
	);
	const pts = nodes.map((n) => ({
		...n,
		x: n.x + Math.sin(t * n.sp + n.ph) * 18,
		y: n.y + Math.cos(t * n.sp * 0.8 + n.ph) * 14,
	}));
	const maxD = 230;
	const lines: React.ReactNode[] = [];
	for (let i = 0; i < pts.length; i++) {
		for (let j = i + 1; j < pts.length; j++) {
			const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
			if (d < maxD) {
				lines.push(
					<line key={`${i}-${j}`} x1={pts[i].x} y1={pts[i].y} x2={pts[j].x} y2={pts[j].y} stroke={colors.teal} strokeOpacity={(1 - d / maxD) * 0.35 * reveal} strokeWidth={1.2} />,
				);
			}
		}
	}
	return (
		<AbsoluteFill style={{background: colors.bg}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at ${glowX * 100}% ${glowY * 100}%, rgba(0,157,146,0.32) 0%, rgba(26,51,49,0.25) 28%, rgba(29,29,29,0) 60%)`,
				}}
			/>
			<svg width={width} height={height} style={{position: 'absolute'}}>
				{lines}
				{pts.map((p, i) => (
					<circle key={i} cx={p.x} cy={p.y} r={p.r} fill={colors.tealBright} opacity={0.55 * reveal} />
				))}
			</svg>
		</AbsoluteFill>
	);
};
