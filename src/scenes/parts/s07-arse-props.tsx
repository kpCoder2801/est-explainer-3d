import React from 'react';
import {colors, fontInter} from '../../brand/brand-tokens';
import {Phone} from '../../props/scene-props';

/** Props for S07 "ARSe in action", in the shared sticker style. All draw in a 1920×1080 SVG space. */
const LINE = 8;

type Pt = {x: number; y: number};

/** Point on a quadratic bezier a→c→b at progress p. */
export const bezier = (a: Pt, c: Pt, b: Pt, p: number): Pt => ({
	x: (1 - p) ** 2 * a.x + 2 * (1 - p) * p * c.x + p ** 2 * b.x,
	y: (1 - p) ** 2 * a.y + 2 * (1 - p) * p * c.y + p ** 2 * b.y,
});

/** Dotted remittance trail that draws itself up to `progress`. */
export const ArcTrail: React.FC<{a: Pt; c: Pt; b: Pt; progress: number}> = ({a, c, b, progress}) => (
	<g>
		{Array.from({length: 26}, (_, i) => {
			const p = i / 25;
			if (p > progress) return null;
			const pt = bezier(a, c, b, p);
			return <circle key={i} cx={pt.x} cy={pt.y} r={7} fill={colors.arseSky} stroke={colors.outline} strokeWidth={3} />;
		})}
	</g>
);

/** The dinner bill; `split` 0…1 slides the two halves apart toward the phones. */
export const DinnerReceipt: React.FC<{x: number; y: number; split: number; spread: number; opacity: number}> = ({x, y, split, spread, opacity}) => {
	const half = (side: -1 | 1) => (
		<g transform={`translate(${side * split * spread} ${split * 120}) rotate(${side * split * 8} ${x} ${y})`}>
			<rect x={side < 0 ? x - 110 : x} y={y - 80} width={110} height={170} fill={colors.white} stroke={colors.outline} strokeWidth={LINE * 0.7} />
			<text x={side < 0 ? x - 55 : x + 55} y={y + 40} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={28} fill={colors.arseNavy}>
				½
			</text>
		</g>
	);
	return (
		<g opacity={opacity}>
			{half(-1)}
			{half(1)}
			{split < 0.05 && (
				<g>
					<text x={x} y={y - 38} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={26} fill={colors.arseNavy}>
						DINNER
					</text>
					{[-8, 12, 32].map((dy) => (
						<line key={dy} x1={x - 70} y1={y + dy} x2={x + 70} y2={y + dy} stroke={colors.arseSky} strokeWidth={6} strokeLinecap="round" />
					))}
				</g>
			)}
		</g>
	);
};

/** Phone showing a received half-bill; `done` reveals the green check. */
export const SplitPhone: React.FC<{x: number; y: number; done: boolean}> = ({x, y, done}) => (
	<Phone x={x} y={y} w={230} h={430} screen={colors.arseNavy}>
		<rect x={18} y={24} width={180} height={60} rx={14} fill={colors.arseBlue} />
		<text x={108} y={63} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={26} fill={colors.white}>
			ARSe
		</text>
		<text x={108} y={170} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={34} fill={colors.white}>
			½ bill
		</text>
		{done && (
			<g>
				<circle cx={108} cy={260} r={48} fill="#3ccf7a" stroke={colors.outline} strokeWidth={LINE * 0.7} />
				<path d="M 86 260 L 102 278 L 132 242" stroke={colors.white} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			</g>
		)}
	</Phone>
);

/** Little shop stall with a striped awning, a counter and a QR sign. `scanned` lights the QR. */
export const ShopStall: React.FC<{x: number; ground: number; scanned: number}> = ({x, ground, scanned}) => {
	const w = 520;
	const left = x - w / 2;
	const counterTop = ground - 200;
	const stripes = 8;
	return (
		<g>
			{/* Posts */}
			<rect x={left + 20} y={ground - 560} width={26} height={380} fill={colors.tealDark} stroke={colors.outline} strokeWidth={LINE} />
			<rect x={left + w - 46} y={ground - 560} width={26} height={380} fill={colors.tealDark} stroke={colors.outline} strokeWidth={LINE} />
			{/* Awning: alternating stripes with scalloped edge */}
			{Array.from({length: stripes}, (_, i) => {
				const sw = w / stripes;
				const sx = left + i * sw;
				return (
					<path
						key={i}
						d={`M ${sx} ${ground - 600} L ${sx + sw} ${ground - 600} L ${sx + sw} ${ground - 530} A ${sw / 2} ${sw / 2} 0 0 1 ${sx} ${ground - 530} Z`}
						fill={i % 2 ? colors.white : colors.arseBlue}
						stroke={colors.outline}
						strokeWidth={LINE * 0.7}
					/>
				);
			})}
			<rect x={left - 12} y={ground - 640} width={w + 24} height={46} rx={14} fill={colors.arseNavy} stroke={colors.outline} strokeWidth={LINE} />
			<text x={x} y={ground - 607} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={28} letterSpacing={3} fill={colors.white}>
				SHOP
			</text>
			{/* QR sign standing on the counter */}
			<rect x={x + 60} y={counterTop - 170} width={150} height={170} rx={14} fill={colors.white} stroke={colors.outline} strokeWidth={LINE} />
			{[
				[0, 0],
				[1, 0],
				[0, 1],
				[2, 2],
				[3, 1],
				[1, 3],
				[3, 3],
				[2, 0],
				[0, 3],
			].map(([cx, cy], i) => (
				<rect key={i} x={x + 80 + cx * 28} y={counterTop - 150 + cy * 28} width={24} height={24} fill={colors.outline} />
			))}
			<rect x={x + 60} y={counterTop - 170} width={150} height={170} rx={14} fill="#3ccf7a" opacity={scanned * 0.55} />
			{/* Counter */}
			<rect x={left} y={counterTop} width={w} height={200} rx={18} fill={colors.arseBlue} stroke={colors.outline} strokeWidth={LINE} />
			<rect x={left + 4} y={counterTop + 160} width={w - 8} height={36} rx={14} fill={colors.arseShade} />
			<path d={`M ${left + 22} ${counterTop + 60} L ${left + 22} ${counterTop + 22} L ${left + 90} ${counterTop + 22}`} stroke={colors.white} strokeOpacity={0.5} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
		</g>
	);
};
