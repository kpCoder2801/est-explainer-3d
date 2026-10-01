import React from 'react';
import {colors} from '../../brand/brand-tokens';
import {blinkAmount, bodyMotion, limbVector, MascotPose} from './mascot-motion';

type Point = {x: number; y: number};

export type VectorRigSpec = {
	/** Body bounding box in rig units; limbs extend outside it. */
	width: number;
	height: number;
	shoulderL: Point;
	shoulderR: Point;
	hipL: Point;
	hipR: Point;
	armLength: number;
	legLength: number;
	/** Rubber-hose arm thickness and colour; hands are white cartoon gloves. */
	limbWidth: number;
	limbColor: string;
	/** Thin straight legs ending in big shoes (1930s cartoon proportions). */
	legWidth: number;
	legColor: string;
	shoeColor: string;
	shoeShade: string;
	shoeSize: number;
	/** Line-art thickness in rig units (sticker outline around limbs, gloves, shoes). */
	outline: number;
	/** Extra outward angle for bodies whose sides slope outward (a triangle hides hanging arms). */
	armSpread?: number;
	renderBody: (face: {mouth: number; blink: number; look: number; time: number}) => React.ReactNode;
};

/** Gently bent limb: a quadratic curve whose elbow bows away from the body. */
const Limb: React.FC<{from: Point; dir: Point; length: number; width: number; color: string; bend: number; outline: number}> = ({
	from,
	dir,
	length,
	width,
	color,
	bend,
	outline,
}) => {
	const end = {x: from.x + dir.x * length, y: from.y + dir.y * length};
	const mid = {x: (from.x + end.x) / 2 - dir.y * bend, y: (from.y + end.y) / 2 + dir.x * bend};
	const d = `M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`;
	return (
		<g fill="none" strokeLinecap="round">
			<path d={d} stroke={colors.outline} strokeWidth={width + outline * 2} />
			<path d={d} stroke={color} strokeWidth={width} />
		</g>
	);
};

/**
 * White cartoon glove: cuff, palm, three finger bumps and a thumb, with ink seams.
 * Drawn pointing along +y and rotated onto the arm. `pointing` extends the index finger.
 */
const Glove: React.FC<{at: Point; dir: Point; w: number; side: -1 | 1; pointing: boolean; line: number}> = ({at, dir, w, side, pointing, line}) => {
	const deg = (-Math.atan2(dir.x, dir.y) * 180) / Math.PI;
	const ink = colors.outline;
	return (
		<g transform={`translate(${at.x} ${at.y}) rotate(${deg})`} stroke={ink} strokeWidth={line} strokeLinejoin="round">
			<ellipse cx={-side * w * 0.95} cy={w * 0.95} rx={w * 0.4} ry={w * 0.58} fill={colors.white} transform={`rotate(${side * 25} ${-side * w * 0.95} ${w * 0.95})`} />
			{pointing ? (
				<rect x={-w * 0.3} y={w * 1.4} width={w * 0.6} height={w * 1.9} rx={w * 0.3} fill={colors.white} />
			) : (
				[-0.62, 0, 0.62].map((k) => <ellipse key={k} cx={k * w} cy={w * 1.95} rx={w * 0.4} ry={w * 0.55} fill={colors.white} />)
			)}
			<ellipse cx={0} cy={w * 1.2} rx={w * 1.05} ry={w * 0.95} fill={colors.white} />
			{pointing && <ellipse cx={0} cy={w * 1.75} rx={w * 0.75} ry={w * 0.45} fill={colors.white} stroke="none" />}
			<path d={`M ${-w * 0.32} ${w * 0.75} L ${-w * 0.32} ${w * 1.45} M ${w * 0.32} ${w * 0.75} L ${w * 0.32} ${w * 1.45}`} fill="none" strokeLinecap="round" />
			<rect x={-w * 1.0} y={-w * 0.25} width={w * 2} height={w * 0.7} rx={w * 0.32} fill={colors.white} />
		</g>
	);
};

/** Big rounded sneaker-style shoe with a white sole; toe points toward +x (the rig flips for facing). */
const Shoe: React.FC<{at: Point; size: number; color: string; shade: string; line: number}> = ({at, size: S, color, shade, line}) => {
	const upper = `M ${-0.55 * S} 0 Q ${-0.62 * S} ${-0.7 * S} ${0.05 * S} ${-0.72 * S} Q ${0.9 * S} ${-0.72 * S} ${1.15 * S} ${-0.18 * S} Q ${1.2 * S} 0 ${0.95 * S} 0 Z`;
	return (
		<g transform={`translate(${at.x} ${at.y})`} stroke={colors.outline} strokeWidth={line} strokeLinejoin="round">
			<path d={upper} fill={color} />
			{/* Lower-right shade band inside the upper. */}
			<path d={`M ${0.2 * S} ${-0.02 * S} Q ${0.95 * S} ${-0.1 * S} ${1.12 * S} ${-0.3 * S} Q ${1.2 * S} 0 ${0.95 * S} 0 Z`} fill={shade} stroke="none" />
			<rect x={-0.62 * S} y={-0.1 * S} width={1.84 * S} height={0.24 * S} rx={0.12 * S} fill={colors.white} />
			<path d={`M ${-0.25 * S} ${-0.5 * S} Q ${0.05 * S} ${-0.62 * S} ${0.35 * S} ${-0.58 * S}`} stroke={colors.white} strokeWidth={line * 0.9} strokeLinecap="round" fill="none" opacity={0.75} />
		</g>
	);
};

export const VectorMascot: React.FC<{spec: VectorRigSpec; pose: MascotPose; height: number}> = ({spec, pose, height}) => {
	const m = bodyMotion(pose.action, pose.actionTime, pose.time);
	const blink = blinkAmount(pose.time, pose.seed);
	const pad = spec.armLength + spec.limbWidth * 3;
	const groundY = spec.hipL.y + spec.legLength;
	const vbW = spec.width + pad * 2;
	const vbH = groundY + pad * 0.6 + spec.height * 0.45;
	const top = -spec.height * 0.45 - pad * 0.4;
	const hop = m.hop * spec.height;
	const bob = m.bodyY * spec.height;
	const scale = height / spec.height;

	const arm = (side: -1 | 1, angle: number) => {
		const s = side < 0 ? spec.shoulderL : spec.shoulderR;
		// Cap fully raised arms so gloves stay clear of top-mounted eyes.
		const dir = limbVector(Math.min(angle + (spec.armSpread ?? 0), 150), side);
		const handPos = {x: s.x + dir.x * spec.armLength, y: s.y + dir.y * spec.armLength};
		return (
			<g>
				<Limb from={s} dir={dir} length={spec.armLength} width={spec.limbWidth} color={spec.limbColor} bend={spec.limbWidth * 0.6 * side} outline={spec.outline} />
				<Glove at={handPos} dir={dir} w={spec.limbWidth * 1.55} side={side} pointing={side > 0 && pose.action === "point"} line={spec.outline * 0.6} />
			</g>
		);
	};

	const leg = (side: -1 | 1, angle: number) => {
		const h = side < 0 ? spec.hipL : spec.hipR;
		const swing = Math.sin((angle * Math.PI) / 180) * spec.legLength;
		// Hips ride the body (bob + hop) while feet stay planted unless hopping, so legs stretch naturally.
		const lift = Math.max(0, Math.sin((angle * Math.PI) / 180)) * spec.legLength * 0.25;
		const foot = {x: h.x + swing, y: groundY - hop - lift};
		const hip = {x: h.x, y: h.y + bob - hop};
		return (
			<g>
				<path d={`M ${hip.x} ${hip.y} L ${foot.x} ${foot.y - spec.shoeSize * 0.5}`} stroke={colors.outline} strokeWidth={spec.legWidth + spec.outline * 2} strokeLinecap="round" />
				<path d={`M ${hip.x} ${hip.y} L ${foot.x} ${foot.y - spec.shoeSize * 0.5}`} stroke={spec.legColor} strokeWidth={spec.legWidth} strokeLinecap="round" />
				<Shoe at={foot} size={spec.shoeSize} color={spec.shoeColor} shade={spec.shoeShade} line={spec.outline} />
			</g>
		);
	};

	const cx = spec.width / 2;
	const bodyTransform = [
		`translate(0 ${bob - hop})`,
		`translate(${cx} ${spec.height})`,
		`rotate(${m.tilt})`,
		`scale(${m.squashX} ${m.squashY})`,
		`translate(${-cx} ${-spec.height})`,
	].join(' ');

	return (
		<svg
			width={vbW * scale}
			height={vbH * scale}
			viewBox={`${-pad} ${top} ${vbW} ${vbH}`}
			style={{overflow: 'visible', transform: `scaleX(${pose.facing})`}}
		>
			{/* Ground shadow shrinks while airborne. */}
			<ellipse cx={cx} cy={groundY + spec.shoeSize * 0.1} rx={spec.width * 0.42 * (1 - m.hop * 0.8)} ry={spec.shoeSize * 0.22} fill="#000" opacity={0.28} />
			{leg(-1, m.legL)}
			{leg(1, m.legR)}
			<g transform={bodyTransform}>
				{spec.renderBody({mouth: pose.mouth, blink, look: pose.look * pose.facing, time: pose.time})}
				{arm(-1, m.armL)}
				{arm(1, m.armR)}
			</g>
		</svg>
	);
};

/**
 * Round cartoon eye shared by every mascot so they read as one cast.
 * `tall` stretches it vertically. Eye bumps/sockets belong to the body silhouette.
 */
export const RoundEye: React.FC<{cx: number; cy: number; r: number; look: number; blink: number; tall?: number}> = ({cx, cy, r, look, blink, tall = 1}) => {
	const open = 1 - blink * 0.92;
	return (
		<g transform={`translate(${cx} ${cy})`}>
			<g transform={`scale(1 ${open})`}>
				<ellipse rx={r} ry={r * tall} fill={colors.white} stroke={colors.outline} strokeWidth={r * 0.14} />
				<ellipse cx={look * r * 0.34} cy={r * 0.12 * tall} rx={r * 0.5} ry={r * 0.56 * tall} fill={colors.outline} />
				<circle cx={look * r * 0.34 + r * 0.18} cy={-r * 0.12 * tall} r={r * 0.17} fill={colors.white} />
				<circle cx={look * r * 0.34 - r * 0.2} cy={r * 0.42 * tall} r={r * 0.08} fill={colors.white} />
			</g>
			{blink > 0.5 && <path d={`M ${-r} 0 Q 0 ${r * 0.35} ${r} 0`} stroke={colors.outline} strokeWidth={r * 0.14} strokeLinecap="round" fill="none" />}
		</g>
	);
};

/**
 * 1930s cartoon eye (Miss Minutes reference): an egg narrower at the top, tilted
 * inward, big low pupil and three lashes on the outer top edge.
 */
export const eggPath = (w: number, h: number, k = 1) =>
	`M 0 ${-h * k} C ${w * 0.75 * k} ${-h * k} ${w * k} ${-h * 0.1 * k} ${w * k} ${h * 0.3 * k} C ${w * k} ${h * 0.8 * k} ${w * 0.55 * k} ${h * k} 0 ${h * k} C ${-w * 0.55 * k} ${h * k} ${-w * k} ${h * 0.8 * k} ${-w * k} ${h * 0.3 * k} C ${-w * k} ${-h * 0.1 * k} ${-w * 0.75 * k} ${-h * k} 0 ${-h * k} Z`;

/** Inward tilt applied to egg eyes; the body silhouette reuses it for the eye bumps. */
export const eggTilt = (side: -1 | 1) => side * -10;

export const EggEye: React.FC<{cx: number; cy: number; w: number; h: number; side: -1 | 1; look: number; blink: number}> = ({cx, cy, w, h, side, look, blink}) => {
	const egg = (k: number) => eggPath(w, h, k);
	const open = 1 - blink * 0.9;
	const ink = colors.outline;
	// Lashes sprout from the outer upper edge (outer = away from the face centre).
	const lashes = [0, 1, 2].map((i) => {
		const a = (-100 + side * (30 + i * 22)) * (Math.PI / 180);
		const x0 = Math.cos(a) * w * 0.95;
		const y0 = Math.sin(a) * h * 0.95;
		return `M ${x0} ${y0} q ${side * w * 0.18} ${-h * 0.18} ${side * w * 0.38} ${-h * 0.2}`;
	});
	return (
		<g transform={`translate(${cx} ${cy}) rotate(${eggTilt(side)})`}>
			<g transform={`scale(1 ${open})`}>
				<path d={egg(1)} fill={colors.white} stroke={ink} strokeWidth={w * 0.13} />
				<ellipse cx={look * w * 0.3} cy={h * 0.3} rx={w * 0.55} ry={h * 0.5} fill={colors.outline} />
				<ellipse cx={look * w * 0.3 + w * 0.18} cy={h * 0.08} rx={w * 0.17} ry={h * 0.13} fill={colors.white} />
			</g>
			{blink < 0.5 ? (
				<path d={lashes.join(' ')} stroke={ink} strokeWidth={w * 0.12} strokeLinecap="round" fill="none" />
			) : (
				<path d={`M ${-w} ${h * 0.25} Q 0 ${h * 0.65} ${w} ${h * 0.25}`} stroke={ink} strokeWidth={w * 0.12} strokeLinecap="round" fill="none" />
			)}
		</g>
	);
};

/** Mouth: closed = smile arc, open = outlined dark opening with a tongue. */
export const CartoonMouth: React.FC<{cx: number; cy: number; w: number; open: number; ink?: string}> = ({cx, cy, w, open, ink = colors.outline}) => {
	const h = w * 0.62 * open;
	if (open < 0.08) {
		return <path d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + w * 0.32} ${cx + w / 2} ${cy}`} stroke={ink} strokeWidth={w * 0.13} strokeLinecap="round" fill="none" />;
	}
	const shape = `M ${cx - w / 2} ${cy} Q ${cx} ${cy + w * 0.12} ${cx + w / 2} ${cy} Q ${cx + w * 0.4} ${cy + h + w * 0.1} ${cx} ${cy + h + w * 0.12} Q ${cx - w * 0.4} ${cy + h + w * 0.1} ${cx - w / 2} ${cy} Z`;
	return (
		<g>
			<path d={shape} fill="#3a1218" stroke={ink} strokeWidth={w * 0.11} strokeLinejoin="round" />
			<ellipse cx={cx} cy={cy + h * 0.85 + w * 0.06} rx={w * 0.22} ry={Math.min(h * 0.3, w * 0.12)} fill="#ef6f78" />
		</g>
	);
};
