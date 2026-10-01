import React from 'react';
import {Easing, interpolate, random} from 'remotion';
import {colors} from '../../brand/brand-tokens';
import {blinkAmount, MascotPose} from '../../mascots/shared/mascot-motion';
import {BEAK_CELLS, BODY_CELLS, EYE_CELL, LEG_BACK, LEG_FRONT, NANDU_COLS, NANDU_ROWS} from '../../mascots/shared/nandu-pixel-map';
import {mgMotion} from './mg-mascot-motion';

const C = 10;
const STEP_FPS = 10;
const snap = (v: number) => Math.round(v / (C / 2)) * (C / 2);

type Px = {x: number; y: number; fill: string; key: string};

/**
 * MG Nandu: the logo's pixels, flat two-tone gold with no outline, moving on 10fps steps.
 * `assemble` 0→1 flies every pixel in from a scattered start and locks it into the grid
 * (a staggered, seeded build) — Nandu's signature entrance.
 */
export const MgNandu: React.FC<{pose: MascotPose; height: number; assemble?: number}> = ({pose, height, assemble = 1}) => {
	const st = Math.floor(pose.time * STEP_FPS) / STEP_FPS;
	const sa = Math.floor(pose.actionTime * STEP_FPS) / STEP_FPS;
	const m = mgMotion(pose.action, sa, st);
	const H = NANDU_ROWS * C;
	const lift = snap(-m.y * H);
	const walking = pose.action === 'walk';
	const stride = walking ? (Math.floor(pose.actionTime * 6) % 2 === 0 ? 1 : -1) : 0;
	const open = pose.mouth > 0.3;
	const blink = blinkAmount(pose.time, pose.seed) > 0.4;
	const body = new Set(BODY_CELLS.map(([x, y]) => `${x},${y}`));
	const look = Math.round(pose.look * 2) / 2;

	const pixels: Px[] = [
		...LEG_FRONT.map(([x, y]) => ({x: x + stride, y, fill: colors.nanduShade, key: `f${x}${y}`})),
		...LEG_BACK.map(([x, y]) => ({x: x - stride, y: y - (stride < 0 ? 1 : 0), fill: colors.nanduShade, key: `b${x}${y}`})),
		...BODY_CELLS.filter(([x, y]) => !(open && BEAK_CELLS.has(`${x},${y}`))).map(([x, y]) => ({
			x,
			y,
			// Two-tone: lighter where the top is exposed, deeper where the bottom is.
			fill: !body.has(`${x},${y - 1}`) ? colors.nanduLight : !body.has(`${x},${y + 1}`) ? colors.nanduShade : colors.nanduGold,
			key: `p${x}${y}`,
		})),
	];

	const place = (p: Px, i: number) => {
		const delay = random(`nd${p.key}`) * 0.5;
		const k = Easing.bezier(0.16, 1, 0.3, 1)(interpolate(assemble, [delay, delay + 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
		const sx = (random(`ndx${i}`) - 0.5) * 60;
		const sy = (random(`ndy${i}`) - 0.8) * 50;
		return {x: (p.x + sx * (1 - k)) * C, y: (p.y + sy * (1 - k)) * C, o: k, r: (1 - k) * 180};
	};

	const scale = height / H;
	return (
		<svg
			width={NANDU_COLS * C * scale}
			height={(NANDU_ROWS + 1.5) * C * scale}
			viewBox={`0 ${-C * 0.5} ${NANDU_COLS * C} ${(NANDU_ROWS + 1.5) * C}`}
			style={{overflow: 'visible', transform: `scaleX(${-pose.facing})`, shapeRendering: 'crispEdges'}}
		>
			<rect x={2.5 * C} y={16.2 * C} width={7 * C} height={C * 0.5} fill="#000" opacity={0.3 * assemble} />
			<g transform={`translate(0 ${lift})`}>
				{pixels.map((p, i) => {
					const q = place(p, i);
					return q.o <= 0 ? null : <rect key={p.key} x={q.x} y={q.y} width={C + 0.4} height={C + 0.4} fill={p.fill} opacity={q.o} transform={q.r ? `rotate(${q.r} ${q.x + C / 2} ${q.y + C / 2})` : undefined} />;
				})}
				{open && assemble >= 1 && (
					<g>
						<rect x={0} y={0.55 * C} width={2 * C} height={0.55 * C} fill={colors.nanduLight} />
						<rect x={0.5 * C} y={1.1 * C} width={1.5 * C} height={0.4 * C} fill="#3a1218" />
						<rect x={0} y={1.5 * C} width={2 * C} height={0.5 * C} fill={colors.nanduShade} />
					</g>
				)}
				{assemble >= 1 && (
					<g transform={`translate(${EYE_CELL[0] * C - C * 0.4} ${EYE_CELL[1] * C - C * 0.45})`}>
						{blink || m.happy ? (
							<rect y={C * 0.75} width={C * 1.8} height={C * 0.35} fill="#0b1416" />
						) : (
							<>
								<rect width={C * 1.8} height={C * 1.8} fill="#fff" />
								<rect x={C * (0.4 - look * 0.3)} y={C * 0.5} width={C * 0.9} height={C} fill="#0b1416" />
								<rect x={C * (0.55 - look * 0.3)} y={C * 0.6} width={C * 0.3} height={C * 0.3} fill="#fff" />
							</>
						)}
					</g>
				)}
			</g>
		</svg>
	);
};
