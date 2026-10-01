import React from 'react';
import {colors, fontInter} from '../brand/brand-tokens';

/**
 * Shared scene props in the mascots' sticker style (dark outline, flat fill, shade band,
 * gloss). SVG props draw in the caller's <svg> coordinate space; Card is HTML.
 */
const LINE = 8;

/** Stylised globe: ocean disc, two continents-ish blobs, meridians. */
export const Globe: React.FC<{cx: number; cy: number; r: number; spin?: number}> = ({cx, cy, r, spin = 0}) => {
	const shift = ((spin % 360) / 360) * r * 2;
	const clipId = `globe-${Math.round(cx)}-${Math.round(cy)}`;
	return (
		<g>
			<clipPath id={clipId}>
				<circle cx={cx} cy={cy} r={r} />
			</clipPath>
			<circle cx={cx} cy={cy} r={r} fill={colors.tealDark} />
			<g clipPath={`url(#${clipId})`}>
				{[-2, 0, 2].map((k) => (
					<g key={k} transform={`translate(${k * r + shift} 0)`}>
						{/* Americas-like blob, then a smaller one, kept abstract. */}
						<path
							d={`M ${cx - r * 0.55} ${cy - r * 0.6} q ${r * 0.35} ${-r * 0.15} ${r * 0.45} ${r * 0.15} q ${-r * 0.05} ${r * 0.3} ${-r * 0.2} ${r * 0.35} q ${r * 0.25} ${r * 0.25} ${r * 0.1} ${r * 0.6} q ${-r * 0.15} ${r * 0.25} ${-r * 0.25} ${r * 0.05} q ${-r * 0.05} ${-r * 0.35} ${-r * 0.2} ${-r * 0.5} q ${-r * 0.15} ${-r * 0.25} ${r * 0.1} ${-r * 0.6} z`}
							fill={colors.teal}
							stroke={colors.outline}
							strokeWidth={LINE * 0.7}
						/>
						<path
							d={`M ${cx + r * 0.25} ${cy - r * 0.45} q ${r * 0.4} ${-r * 0.1} ${r * 0.5} ${r * 0.2} q ${-r * 0.1} ${r * 0.35} ${-r * 0.3} ${r * 0.3} q ${-r * 0.25} ${-r * 0.1} ${-r * 0.2} ${-r * 0.5} z`}
							fill={colors.teal}
							stroke={colors.outline}
							strokeWidth={LINE * 0.7}
						/>
					</g>
				))}
				<ellipse cx={cx} cy={cy} rx={r * 0.45} ry={r} fill="none" stroke={colors.tealBright} strokeOpacity={0.35} strokeWidth={3} />
				<line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={colors.tealBright} strokeOpacity={0.35} strokeWidth={3} />
				{/* Shade crescent, lower-right: the globe disc minus a copy shifted toward the light. */}
				<path
					d={`M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z M ${cx - r * 1.14} ${cy - r * 0.17} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`}
					fill="rgba(0,0,0,0.3)"
					fillRule="evenodd"
				/>
			</g>
			<circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.outline} strokeWidth={LINE} />
			<path d={`M ${cx - r * 0.75} ${cy - r * 0.35} A ${r * 0.82} ${r * 0.82} 0 0 1 ${cx - r * 0.35} ${cy - r * 0.75}`} stroke={colors.white} strokeOpacity={0.5} strokeWidth={r * 0.06} strokeLinecap="round" fill="none" />
		</g>
	);
};

/** Map pin: teardrop with a dot, tip at (x, y). */
export const MapPin: React.FC<{x: number; y: number; size: number; color?: string}> = ({x, y, size, color = colors.tealBright}) => (
	<g transform={`translate(${x} ${y})`}>
		<path d={`M 0 0 C ${-size * 0.2} ${-size * 0.35} ${-size * 0.5} ${-size * 0.55} ${-size * 0.5} ${-size * 0.85} A ${size * 0.5} ${size * 0.5} 0 1 1 ${size * 0.5} ${-size * 0.85} C ${size * 0.5} ${-size * 0.55} ${size * 0.2} ${-size * 0.35} 0 0 Z`} fill={color} stroke={colors.outline} strokeWidth={LINE * 0.8} strokeLinejoin="round" />
		<circle cx={0} cy={-size * 0.85} r={size * 0.18} fill={colors.white} stroke={colors.outline} strokeWidth={LINE * 0.5} />
	</g>
);

/**
 * Smartphone with a themeable screen. `children` draw in screen-local coordinates
 * (0,0 = screen top-left; size = w-2*bezel by h-2*bezel-notch area).
 */
export const Phone: React.FC<{x: number; y: number; w: number; h: number; screen: string; frame?: string; children?: React.ReactNode}> = ({
	x,
	y,
	w,
	h,
	screen,
	frame = colors.white,
	children,
}) => {
	const bezel = w * 0.06;
	const id = `phone-${Math.round(x)}-${Math.round(y)}`;
	return (
		<g>
			<rect x={x} y={y} width={w} height={h} rx={w * 0.16} fill={frame} stroke={colors.outline} strokeWidth={LINE} />
			<clipPath id={id}>
				<rect x={x + bezel} y={y + bezel * 1.6} width={w - bezel * 2} height={h - bezel * 3.2} rx={w * 0.09} />
			</clipPath>
			<g clipPath={`url(#${id})`}>
				<rect x={x + bezel} y={y + bezel * 1.6} width={w - bezel * 2} height={h - bezel * 3.2} fill={screen} />
				<g transform={`translate(${x + bezel} ${y + bezel * 1.6})`}>{children}</g>
			</g>
			<rect x={x + bezel} y={y + bezel * 1.6} width={w - bezel * 2} height={h - bezel * 3.2} rx={w * 0.09} fill="none" stroke={colors.outline} strokeWidth={LINE * 0.6} />
			<rect x={x + w * 0.38} y={y + bezel * 0.55} width={w * 0.24} height={bezel * 0.5} rx={bezel * 0.25} fill={colors.outline} />
			<path d={`M ${x + w * 0.1} ${y + h * 0.15} L ${x + w * 0.1} ${y + h * 0.06}`} stroke={colors.white} strokeOpacity={0.6} strokeWidth={w * 0.03} strokeLinecap="round" />
		</g>
	);
};

/** Fact card (HTML) in the brand's rounded-card language with a sticker outline. */
export const InfoCard: React.FC<{
	x: number;
	y: number;
	w: number;
	children: React.ReactNode;
	accent?: string;
	rotate?: number;
	scale?: number;
	fontSize?: number;
}> = ({x, y, w, children, accent = colors.teal, rotate = 0, scale = 1, fontSize = 38}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			width: w,
			padding: '24px 30px',
			borderRadius: 26,
			background: colors.tealDark,
			border: `5px solid ${colors.outline}`,
			boxShadow: `inset 0 0 0 4px ${accent}, 0 10px 0 ${colors.outline}`,
			color: colors.white,
			fontFamily: fontInter,
			fontSize,
			fontWeight: 800,
			lineHeight: 1.2,
			transform: `rotate(${rotate}deg) scale(${scale})`,
			transformOrigin: '50% 50%',
		}}
	>
		{children}
	</div>
);
