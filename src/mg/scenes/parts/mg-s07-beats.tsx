import React from 'react';
import {interpolate, random} from 'remotion';
import {colors, fontInter} from '../../../brand/brand-tokens';
import {TimedLine, wordStart} from '../../../storyboard/scene-timeline';
import {DrawPath} from '../../kit/draw-path';
import {KineticPhrase} from '../../kit/kinetic-phrase';
import {between, DUR, EASE_OUT, enter} from '../../kit/mg-motion';

/**
 * The three ARSe use-case panels. Each is drawn in its own 1920×1080 panel space;
 * the scene lays them side by side and flies a camera across them.
 */
type BeatProps = {t: number; line: TimedLine};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const TITLE = {x: 760, y: 110, size: 112, width: 1300};

/** Pin with a pulsing ring and a small caps label. */
const Pin: React.FC<{x: number; y: number; p: number; label: string; pulse: number}> = ({x, y, p, label, pulse}) => (
	<g opacity={p} transform={`translate(${x} ${y}) scale(${0.5 + p * 0.5})`}>
		<circle r={22 + pulse * 46} fill="none" stroke={colors.arseSky} strokeWidth={4} opacity={1 - pulse} />
		<circle r={20} fill={colors.arseBlue} />
		<circle r={8} fill={colors.white} />
		<text y={64} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={26} letterSpacing={4} fill={colors.arseSky}>
			{label}
		</text>
	</g>
);

/** Beat 1 — "across borders": a dashed globe grid, two pins and an arc a coin travels along. */
export const BordersBeat: React.FC<BeatProps> = ({t, line}) => {
	const a = {x: 330, y: 660};
	const b = {x: 1190, y: 470};
	const c = {x: 760, y: 170};
	const k = between(t, wordStart(line, 0), wordStart(line, 3) + 0.25, 0, 1, EASE_OUT);
	const q = (u: number) => ({x: (1 - u) ** 2 * a.x + 2 * (1 - u) * u * c.x + u ** 2 * b.x, y: (1 - u) ** 2 * a.y + 2 * (1 - u) * u * c.y + u ** 2 * b.y});
	const coin = q(k);
	const arrive = enter(t, wordStart(line, 3), DUR.std);
	return (
		<>
			<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
				{[0, 1, 2, 3, 4].map((i) => (
					<ellipse key={i} cx={760} cy={560} rx={560 - i * 110} ry={260} fill="none" stroke={colors.tealBright} strokeOpacity={0.12} strokeWidth={2} strokeDasharray="4 12" />
				))}
				<line x1={160} y1={560} x2={1360} y2={560} stroke={colors.tealBright} strokeOpacity={0.12} strokeWidth={2} strokeDasharray="4 12" />
				<DrawPath d={`M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`} progress={k} stroke={colors.arseSky} width={6} />
				<Pin x={a.x} y={a.y} p={enter(t, wordStart(line, 0) - 0.1, DUR.std)} label="ARGENTINA" pulse={(t * 1.2) % 1} />
				<Pin x={b.x} y={b.y} p={arrive} label="ANYWHERE" pulse={(t * 1.2 + 0.5) % 1} />
				{k > 0 && k < 1 && (
					<g>
						<circle cx={coin.x} cy={coin.y} r={34} fill={colors.arseSky} opacity={0.25} />
						<circle cx={coin.x} cy={coin.y} r={22} fill={colors.arseBlue} />
						<circle cx={coin.x - 6} cy={coin.y - 6} r={7} fill={colors.white} opacity={0.8} />
					</g>
				)}
			</svg>
			<KineticPhrase line={line} from={2} to={3} {...TITLE} uppercase />
		</>
	);
};

const ReceiptHalf: React.FC<{side: -1 | 1; amount: string; showAmount: number; check: number}> = ({side, amount, showAmount, check}) => {
	const w = 160;
	const h = 400;
	const x0 = side < 0 ? -w : 0;
	// Zigzag tear along the bottom, walked right-to-left back to the start corner.
	const teeth = Array.from({length: 8}, (_, k) => 7 - k)
		.map((i) => `L ${x0 + (i + 0.5) * (w / 8)} ${h + 14} L ${x0 + i * (w / 8)} ${h}`)
		.join(' ');
	return (
		<g>
			<path d={`M ${x0} 0 L ${x0 + w} 0 L ${x0 + w} ${h} ${teeth} Z`} fill={colors.white} />
			{[70, 110, 150, 190, 230].map((y, i) => (
				<rect key={y} x={x0 + (side < 0 ? 26 : 10)} y={y} width={w - 36 - (i % 2) * 30} height={12} rx={6} fill="#d6dee0" />
			))}
			<text x={x0 + w / 2} y={330} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={40} fill={colors.arseNavy} opacity={showAmount}>
				{amount}
			</text>
			{check > 0 && (
				<g transform={`translate(${x0 + w / 2} ${h + 80}) scale(${check})`}>
					<circle r={34} fill={colors.tealBright} />
					<DrawPath d="M -14 0 L -4 11 L 15 -11" progress={check} stroke={colors.white} width={7} />
				</g>
			)}
		</g>
	);
};

/** Beat 2 — "split a dinner": a receipt tears in two and each half shows its share. */
export const SplitBeat: React.FC<BeatProps> = ({t, line}) => {
	const appear = enter(t, wordStart(line, 4) - 0.15, DUR.std);
	const split = enter(t, wordStart(line, 6), DUR.std);
	const check = enter(t, wordStart(line, 6) + 0.35, DUR.std);
	const gap = split * 120;
	return (
		<>
			<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
				<g transform={`translate(760 ${330 + (1 - appear) * 80})`} opacity={appear}>
					<text y={-28} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={30} letterSpacing={4} fill={colors.arseSky} opacity={1 - split}>
						DINNER · $48.00
					</text>
					<g transform={`translate(${-gap} 0) rotate(${-split * 5})`}>
						<ReceiptHalf side={-1} amount="$24.00" showAmount={split} check={check} />
					</g>
					<g transform={`translate(${gap} 0) rotate(${split * 5})`}>
						<ReceiptHalf side={1} amount="$24.00" showAmount={split} check={check} />
					</g>
				</g>
			</svg>
			<KineticPhrase line={line} from={4} to={6} {...TITLE} uppercase />
		</>
	);
};

/** Beat 3 — "pay at a shop": a QR code assembles module by module, then a confirm check lands. */
export const ShopBeat: React.FC<BeatProps> = ({t, line}) => {
	const start = wordStart(line, 8) - 0.1;
	const frame = between(t, start, start + 0.45, 0, 1, EASE_OUT);
	const paid = enter(t, wordStart(line, 11), DUR.std);
	const size = 320;
	const x0 = 760 - size / 2;
	const y0 = 360;
	const cell = size / 11;
	const modules: React.ReactNode[] = [];
	for (let gx = 0; gx < 11; gx++) {
		for (let gy = 0; gy < 11; gy++) {
			const inFinder = (gx < 4 && gy < 4) || (gx > 6 && gy < 4) || (gx < 4 && gy > 6);
			if (inFinder || random(`qr${gx}-${gy}`) < 0.5) continue;
			const show = interpolate(t, [start + 0.15 + random(`qrt${gx}${gy}`) * 0.5, start + 0.25 + random(`qrt${gx}${gy}`) * 0.5], [0, 1], clamp);
			modules.push(<rect key={`${gx}-${gy}`} x={x0 + gx * cell + 2} y={y0 + gy * cell + 2} width={(cell - 4) * show} height={(cell - 4) * show} rx={3} fill={colors.arseNavy} />);
		}
	}
	const finder = (fx: number, fy: number, i: number) => {
		const s = EASE_OUT(interpolate(t, [start + i * 0.08, start + 0.3 + i * 0.08], [0, 1], clamp));
		return (
			<g key={i} transform={`translate(${x0 + fx * cell + 2 * cell} ${y0 + fy * cell + 2 * cell}) scale(${s})`}>
				<rect x={-1.8 * cell} y={-1.8 * cell} width={3.6 * cell} height={3.6 * cell} rx={10} fill={colors.arseNavy} />
				<rect x={-1.2 * cell} y={-1.2 * cell} width={2.4 * cell} height={2.4 * cell} rx={6} fill={colors.white} />
				<rect x={-0.7 * cell} y={-0.7 * cell} width={1.4 * cell} height={1.4 * cell} rx={4} fill={colors.arseBlue} />
			</g>
		);
	};
	const r = size / 2 + 40;
	return (
		<>
			<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
				<rect x={x0 - 30} y={y0 - 30} width={size + 60} height={size + 60} rx={36} fill={colors.white} opacity={frame} />
				<DrawPath d={`M ${x0 - 30} ${y0 + 6} L ${x0 - 30} ${y0 - 30} L ${x0 + 6} ${y0 - 30} M ${x0 + size - 6} ${y0 - 30} L ${x0 + size + 30} ${y0 - 30} L ${x0 + size + 30} ${y0 + 6} M ${x0 + size + 30} ${y0 + size - 6} L ${x0 + size + 30} ${y0 + size + 30} L ${x0 + size - 6} ${y0 + size + 30} M ${x0 + 6} ${y0 + size + 30} L ${x0 - 30} ${y0 + size + 30} L ${x0 - 30} ${y0 + size - 6}`} progress={frame} stroke={colors.arseSky} width={8} />
				{finder(0, 0, 0)}
				{finder(7, 0, 1)}
				{finder(0, 7, 2)}
				{modules}
				{paid > 0 && (
					<g transform={`translate(760 ${y0 + size / 2}) scale(${paid})`}>
						<circle r={r * 0.5} fill={colors.tealBright} opacity={0.94} />
						<DrawPath d={`M ${-r * 0.2} 0 L ${-r * 0.05} ${r * 0.16} L ${r * 0.24} ${-r * 0.17}`} progress={paid} stroke={colors.white} width={22} />
					</g>
				)}
				<text x={760} y={y0 + size + 100} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={34} letterSpacing={6} fill={colors.tealBright} opacity={paid}>
					PAID
				</text>
			</svg>
			<KineticPhrase line={line} from={8} to={11} {...TITLE} uppercase />
		</>
	);
};
