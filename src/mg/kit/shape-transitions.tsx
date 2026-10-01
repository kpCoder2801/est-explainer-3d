import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {colors, VIDEO} from '../../brand/brand-tokens';
import {EASE_IN_OUT} from './mg-motion';

type NoProps = Record<string, never>;
const {width: W, height: H} = VIDEO;
const COVER_R = Math.hypot(W, H) * 1.05; // circumradius that covers the frame for a triangle

/** Equilateral triangle points (apex up) with circumradius r around (cx, cy). */
const triangle = (cx: number, cy: number, r: number) =>
	[-90, 30, 150].map((a) => [cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r] as const);

/** Exiting scenes recede slightly so the incoming shape reads as coming forward. */
const Exiting: React.FC<{children: React.ReactNode; p: number}> = ({children, p}) => (
	<AbsoluteFill style={{transform: `scale(${1 - p * 0.06})`, filter: `brightness(${1 - p * 0.45})`}}>{children}</AbsoluteFill>
);

/** Estable triangle iris: the next scene opens inside a growing triangle with a bright rim. */
const TriangleIris: React.FC<TransitionPresentationComponentProps<NoProps>> = ({children, presentationDirection, presentationProgress}) => {
	const p = EASE_IN_OUT(presentationProgress);
	if (presentationDirection === 'exiting') return <Exiting p={p}>{children}</Exiting>;
	const r = interpolate(p, [0, 1], [0, COVER_R]);
	const pts = triangle(W / 2, H * 0.56, r);
	const poly = pts.map(([x, y]) => `${x}px ${y}px`).join(', ');
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: `polygon(${poly})`}}>{children}</AbsoluteFill>
			<svg width={W} height={H} style={{position: 'absolute', pointerEvents: 'none'}}>
				<polygon points={pts.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={colors.tealBright} strokeWidth={14 * (1 - p) + 2} strokeLinejoin="round" opacity={1 - p * 0.6} />
			</svg>
		</AbsoluteFill>
	);
};

/** Circle iris (ARSe's coin shape). */
const CircleIris: React.FC<TransitionPresentationComponentProps<NoProps>> = ({children, presentationDirection, presentationProgress}) => {
	const p = EASE_IN_OUT(presentationProgress);
	if (presentationDirection === 'exiting') return <Exiting p={p}>{children}</Exiting>;
	const r = interpolate(p, [0, 1], [0, Math.hypot(W, H) / 2 + 20]);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{clipPath: `circle(${r}px at 50% 50%)`}}>{children}</AbsoluteFill>
			<svg width={W} height={H} style={{position: 'absolute'}}>
				<circle cx={W / 2} cy={H / 2} r={r} fill="none" stroke={colors.arseSky} strokeWidth={14 * (1 - p) + 2} opacity={1 - p * 0.6} />
			</svg>
		</AbsoluteFill>
	);
};

const BAR_COLORS = [colors.teal, colors.tealBright, colors.arseBlue, colors.nanduGold, colors.tealDark];

/** Staggered diagonal brand-colour bars sweep across; the next scene is revealed behind them. */
const BarWipe: React.FC<TransitionPresentationComponentProps<NoProps>> = ({children, presentationDirection, presentationProgress}) => {
	if (presentationDirection === 'exiting') return <AbsoluteFill>{children}</AbsoluteFill>;
	const p = presentationProgress;
	const barH = H / BAR_COLORS.length;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: p >= 0.5 ? 1 : 0}}>{children}</AbsoluteFill>
			<AbsoluteFill style={{transform: 'skewY(-8deg) scale(1.25)'}}>
				{BAR_COLORS.map((c, i) => {
					const local = interpolate(p, [i * 0.06, 0.7 + i * 0.06], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					const x = interpolate(EASE_IN_OUT(local), [0, 1], [-W * 1.1, W * 1.1]);
					return <div key={c} style={{position: 'absolute', left: 0, top: i * barH, width: W * 1.2, height: barH + 2, background: c, transform: `translateX(${x}px)`}} />;
				})}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const triangleIris = (): TransitionPresentation<NoProps> => ({component: TriangleIris, props: {} as NoProps});
export const circleIris = (): TransitionPresentation<NoProps> => ({component: CircleIris, props: {} as NoProps});
export const barWipe = (): TransitionPresentation<NoProps> => ({component: BarWipe, props: {} as NoProps});
