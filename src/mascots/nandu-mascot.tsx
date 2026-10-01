import React from 'react';
import {colors} from '../brand/brand-tokens';
import {blinkAmount, bodyMotion, MascotPose} from './shared/mascot-motion';
import {BEAK_CELLS, BODY_CELLS, EYE_CELL, LEG_BACK, LEG_FRONT, NANDU_COLS, NANDU_ROWS, WING_CELLS} from './shared/nandu-pixel-map';

const C = 10; // rig units per pixel
const COLS = NANDU_COLS;
const ROWS = NANDU_ROWS;
/** Pixel art moves on twos-and-threes: sample motion at 10fps and snap to half-pixels. */
const STEP_FPS = 10;
const snap = (v: number) => Math.round(v / (C / 2)) * (C / 2);


const Px: React.FC<{x: number; y: number; fill: string; w?: number; h?: number}> = ({x, y, fill, w = 1, h = 1}) => (
	// +0.4 overlap hides hairline seams between adjacent pixels when scaled.
	<rect x={x * C} y={y * C} width={w * C + 0.4} height={h * C + 0.4} fill={fill} />
);

/** Sticker line art for pixels: each rect drawn grown by this much in the outline colour first. */
const OUTLINE = C * 0.24;
type Cell = {x: number; y: number; w?: number; h?: number};

/**
 * A pixel group with the same sticker treatment as the vector mascots: dark outline
 * behind, then fill, then (when `shaded`) cel shading on exposed edges — highlight on
 * top edges, shade on bottom/right edges — so light reads from the top-left.
 */
const PxGroup: React.FC<{cells: Cell[]; fill: string; shade?: string; light?: string}> = ({cells, fill, shade, light}) => {
	const has = new Set(cells.map((c) => `${c.x},${c.y}`));
	const o = OUTLINE / C;
	return (
		<>
			{cells.map((c, i) => (
				<Px key={`o${i}`} x={c.x - o} y={c.y - o} w={(c.w ?? 1) + o * 2} h={(c.h ?? 1) + o * 2} fill={colors.outline} />
			))}
			{cells.map((c, i) => (
				<Px key={`f${i}`} x={c.x} y={c.y} w={c.w} h={c.h} fill={fill} />
			))}
			{shade &&
				cells.map((c, i) => (
					<React.Fragment key={`s${i}`}>
						{!has.has(`${c.x},${c.y + 1}`) && <Px x={c.x} y={c.y + 0.7} h={0.3} fill={shade} />}
						{!has.has(`${c.x + 1},${c.y}`) && <Px x={c.x + 0.75} y={c.y} w={0.25} fill={shade} />}
					</React.Fragment>
				))}
			{light &&
				cells.map((c, i) =>
					!has.has(`${c.x},${c.y - 1}`) && has.has(`${c.x},${c.y + 1}`) ? <Px key={`l${i}`} x={c.x + 0.15} y={c.y + 0.12} w={0.45} h={0.2} fill={light} /> : null,
				)}
		</>
	);
};
const toCells = (list: Array<[number, number]>): Cell[] => list.map(([x, y]) => ({x, y}));

export const NanduMascot: React.FC<{pose: MascotPose; height: number}> = ({pose, height}) => {
	const stepTime = Math.floor(pose.time * STEP_FPS) / STEP_FPS;
	const stepAction = Math.floor(pose.actionTime * STEP_FPS) / STEP_FPS;
	const m = bodyMotion(pose.action, stepAction, stepTime);
	const blink = blinkAmount(pose.time, pose.seed) > 0.4;
	const bodyH = ROWS * C;
	const lift = snap(-(m.hop + m.bodyY) * bodyH);

	// Walk: legs trade places every step. Jump/celebrate tuck the legs.
	const walking = pose.action === 'walk';
	const stride = walking ? (Math.floor(pose.actionTime * 6) % 2 === 0 ? 1 : -1) : 0;
	const tucked = m.hop > 0.05;
	// Wing flaps whenever an arm would be raised (wave, celebrate, jump).
	const wingUp = m.armR > 70 && Math.floor(pose.actionTime * 8) % 2 === 0;
	const mouthOpen = pose.mouth > 0.3;
	const scale = height / bodyH;
	const look = Math.round(pose.look * 2) / 2;

	return (
		<svg
			width={COLS * C * scale}
			height={(ROWS + 1.5) * C * scale}
			viewBox={`0 ${-C * 0.5} ${COLS * C} ${(ROWS + 1.5) * C}`}
			// Logo faces left, so facing=right mirrors it.
			style={{overflow: 'visible', transform: `scaleX(${-pose.facing})`, shapeRendering: 'crispEdges'}}
		>
			<rect x={2 * C} y={16 * C} width={8 * C * (1 - m.hop)} height={C * 0.6} fill="#000" opacity={0.28} transform={`translate(${4 * C * m.hop} 0)`} />
			<g transform={`translate(0 ${lift})`}>
				<g transform={`translate(${stride * C} ${tucked ? -C : 0})`}>
					<PxGroup cells={toCells(LEG_FRONT)} fill={colors.nanduShade} />
				</g>
				<g transform={`translate(${-stride * C} ${tucked ? -C : stride < 0 ? -C : 0})`}>
					<PxGroup cells={toCells(LEG_BACK)} fill={colors.nanduShade} />
				</g>
				{mouthOpen && (
					<g>
						<PxGroup cells={[{x: 0, y: 1.5, w: 2, h: 0.5}]} fill={colors.nanduShade} />
						<Px x={0.5} y={1.1} w={1.5} h={0.4} fill="#3a1218" />
					</g>
				)}
				<PxGroup
					cells={[
						...toCells(BODY_CELLS.filter(([x, y]) => !(mouthOpen && BEAK_CELLS.has(`${x},${y}`)))),
						...(mouthOpen ? [{x: 0, y: 0.55, w: 2, h: 0.55}] : []),
					]}
					fill={colors.nanduGold}
					shade={colors.nanduShade}
					light={colors.nanduLight}
				/>
				{/* At rest the wing is the logo's open notch; flapping pops it up out of the body. */}
				{wingUp && (
					<PxGroup
						cells={[
							...WING_CELLS.map(([x, y]) => ({x: x + 1, y: y - 3})),
							{x: WING_CELLS[1][0] + 1, y: WING_CELLS[1][1] - 4},
							{x: WING_CELLS[0][0] + 1, y: WING_CELLS[0][1] - 2},
						]}
						fill={colors.nanduGold}
						shade={colors.nanduShade}
					/>
				)}
				{/* Square eye: same white + ink + highlight recipe as the round eyes, in pixels. */}
				<g transform={`translate(${EYE_CELL[0] * C - C * 0.4} ${EYE_CELL[1] * C - C * 0.45})`}>
					{blink ? (
						<rect y={C * 0.75} width={C * 1.8} height={C * 0.35} fill={colors.outline} />
					) : (
						<>
							<rect x={-OUTLINE} y={-OUTLINE} width={C * 1.8 + OUTLINE * 2} height={C * 1.8 + OUTLINE * 2} fill={colors.outline} />
							<rect width={C * 1.8} height={C * 1.8} fill={colors.white} />
							<rect x={C * (0.4 - look * 0.3)} y={C * 0.5} width={C * 0.9} height={C * 1} fill={colors.outline} />
							<rect x={C * (0.55 - look * 0.3)} y={C * 0.6} width={C * 0.3} height={C * 0.3} fill={colors.white} />
						</>
					)}
				</g>
			</g>
		</svg>
	);
};
