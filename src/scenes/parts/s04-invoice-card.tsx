import React from 'react';
import {random} from 'remotion';
import {colors, fontInter} from '../../brand/brand-tokens';

const LINE = 8;
const QR_CELLS = 11;

/** Deterministic QR-style grid with the three finder squares. */
const QrCode: React.FC<{x: number; y: number; size: number}> = ({x, y, size}) => {
	const c = size / QR_CELLS;
	const finder = (fx: number, fy: number) => (
		<g key={`${fx}-${fy}`}>
			<rect x={x + fx * c} y={y + fy * c} width={c * 3} height={c * 3} fill={colors.outline} />
			<rect x={x + (fx + 0.6) * c} y={y + (fy + 0.6) * c} width={c * 1.8} height={c * 1.8} fill={colors.white} />
			<rect x={x + (fx + 1) * c} y={y + (fy + 1) * c} width={c} height={c} fill={colors.outline} />
		</g>
	);
	const inFinder = (i: number, j: number) => (i < 4 && j < 4) || (i > 6 && j < 4) || (i < 4 && j > 6);
	return (
		<g>
			{Array.from({length: QR_CELLS * QR_CELLS}, (_, k) => {
				const i = k % QR_CELLS;
				const j = Math.floor(k / QR_CELLS);
				if (inFinder(i, j) || random(`qr-${k}`) < 0.5) return null;
				return <rect key={k} x={x + i * c} y={y + j * c} width={c + 0.5} height={c + 0.5} fill={colors.outline} />;
			})}
			{finder(0, 0)}
			{finder(QR_CELLS - 3, 0)}
			{finder(0, QR_CELLS - 3)}
		</g>
	);
};

/**
 * Paper invoice in sticker style. `print` 0…1 reveals it from the top like a slip
 * feeding out of a printer; `paid` 0…1 slams a PAID stamp on.
 */
export const InvoiceCard: React.FC<{x: number; y: number; w: number; h: number; print: number; paid: number}> = ({x, y, w, h, print, paid}) => {
	const shown = h * print;
	const qr = w * 0.62;
	return (
		<g>
			<clipPath id="invoice-print-clip">
				<rect x={x - 20} y={y - 20} width={w + 40} height={shown + 30} />
			</clipPath>
			<g clipPath="url(#invoice-print-clip)">
				<rect x={x} y={y} width={w} height={h} rx={24} fill={colors.white} stroke={colors.outline} strokeWidth={LINE} />
				{/* Shade band along the bottom, gloss top-left, like the mascots. */}
				<rect x={x + LINE / 2} y={y + h - 34} width={w - LINE} height={30} rx={18} fill="#d9e6e4" />
				<path d={`M ${x + 22} ${y + 70} L ${x + 22} ${y + 26} L ${x + 80} ${y + 26}`} stroke={colors.tealLight} strokeWidth={8} strokeLinecap="round" fill="none" />
				<text x={x + 36} y={y + 62} fontFamily={fontInter} fontWeight={800} fontSize={34} fill={colors.ink}>
					INVOICE
				</text>
				<text x={x + w - 36} y={y + 62} textAnchor="end" fontFamily={fontInter} fontWeight={600} fontSize={22} fill="#6b7a78">
					#0042
				</text>
				<text x={x + 36} y={y + 118} fontFamily={fontInter} fontWeight={800} fontSize={46} fill={colors.teal}>
					$120.00
				</text>
				<QrCode x={x + (w - qr) / 2} y={y + 150} size={qr} />
				<text x={x + w / 2} y={y + 150 + qr + 48} textAnchor="middle" fontFamily={fontInter} fontWeight={700} fontSize={24} fill={colors.ink}>
					Scan to pay with crypto
				</text>
			</g>
			{paid > 0 && (
				<g transform={`translate(${x + w / 2} ${y + h * 0.42}) rotate(-14) scale(${2.2 - paid * 1.2})`} opacity={Math.min(1, paid * 2)}>
					<rect x={-120} y={-44} width={240} height={88} rx={16} fill="rgba(255,255,255,0.85)" stroke={colors.teal} strokeWidth={10} />
					<text y={20} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={56} fill={colors.teal}>
						PAID ✓
					</text>
				</g>
			)}
		</g>
	);
};
