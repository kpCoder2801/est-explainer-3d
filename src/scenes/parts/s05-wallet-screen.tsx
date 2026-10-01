import React from 'react';
import {colors, fontInter} from '../../brand/brand-tokens';
import {CoinIcon, CoinSymbol} from '../../components/coin-icon';

/** Fictional partner brands the white-label wallet re-skins into (no real third-party marks). */
export type WalletTheme = {name: string; primary: string; accent: string; bg: string; mark: 'placeholder' | 'circle' | 'diamond' | 'star'};

export const WALLET_THEMES: WalletTheme[] = [
	{name: 'YOUR LOGO', primary: '#5b6766', accent: '#b8c4c2', bg: '#eef2f1', mark: 'placeholder'},
	{name: 'NOVA', primary: '#6c4cf5', accent: '#c4b6ff', bg: '#f3f0ff', mark: 'circle'},
	{name: 'SOLA', primary: '#f08c00', accent: '#ffd88a', bg: '#fff7e8', mark: 'diamond'},
	{name: 'KORA', primary: '#e8436a', accent: '#ffb3c4', bg: '#fff0f3', mark: 'star'},
];

export const SCREEN = {w: 352, h: 643};
export const ASSET_ROWS: Array<{symbol: CoinSymbol; name: string; amount: string}> = [
	{symbol: 'BTC', name: 'Bitcoin', amount: '0.0821'},
	{symbol: 'ETH', name: 'Ethereum', amount: '1.420'},
	{symbol: 'TRX', name: 'Tron', amount: '3,250'},
	{symbol: 'POL', name: 'Polygon', amount: '980.0'},
];
const ROW = {top: 380, step: 62, h: 52, iconX: 44, iconSize: 34};
/** Screen-local centre of each asset row's coin icon (for the HTML icon overlay). */
export const assetIconCenters = () => ASSET_ROWS.map((_, i) => ({x: ROW.iconX, y: ROW.top + i * ROW.step + ROW.h / 2}));

const LINE = 4;

const BrandMark: React.FC<{theme: WalletTheme; logoScale: number}> = ({theme, logoScale}) => {
	if (theme.mark === 'placeholder') {
		return (
			<g>
				<rect x={20} y={22} width={170} height={48} rx={12} fill="none" stroke={theme.primary} strokeWidth={3} strokeDasharray="8 6" />
				<text x={105} y={54} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={20} fill={theme.primary}>
					YOUR LOGO
				</text>
			</g>
		);
	}
	const shape =
		theme.mark === 'circle' ? (
			<circle r={15} fill={theme.primary} stroke={colors.outline} strokeWidth={LINE} />
		) : theme.mark === 'diamond' ? (
			<rect x={-12} y={-12} width={24} height={24} rx={4} transform="rotate(45)" fill={theme.primary} stroke={colors.outline} strokeWidth={LINE} />
		) : (
			<path d="M 0 -17 L 5 -5 L 17 -5 L 7 3 L 11 16 L 0 8 L -11 16 L -7 3 L -17 -5 L -5 -5 Z" fill={theme.primary} stroke={colors.outline} strokeWidth={LINE * 0.8} strokeLinejoin="round" />
		);
	return (
		<g transform={`translate(${36} ${46}) scale(${logoScale})`}>
			{shape}
			<text x={28} y={10} fontFamily={fontInter} fontWeight={800} fontSize={28} letterSpacing={2} fill={theme.primary}>
				{theme.name}
			</text>
		</g>
	);
};

/** Wallet home screen (balance card, actions, asset list) in a given brand theme. */
export const WalletScreen: React.FC<{theme: WalletTheme; logoScale?: number}> = ({theme, logoScale = 1}) => (
	<g>
		<rect width={SCREEN.w} height={SCREEN.h} fill={theme.bg} />
		<BrandMark theme={theme} logoScale={logoScale} />
		<rect x={16} y={96} width={320} height={150} rx={22} fill={theme.primary} stroke={colors.outline} strokeWidth={LINE} />
		<path d="M 34 150 L 34 116 L 80 116" stroke={colors.white} strokeOpacity={0.45} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
		<text x={56} y={140} fontFamily={fontInter} fontWeight={600} fontSize={18} fill={colors.white} opacity={0.85}>
			Total balance
		</text>
		<text x={36} y={198} fontFamily={fontInter} fontWeight={800} fontSize={42} fill={colors.white}>
			$12,480.50
		</text>
		<rect x={248} y={208} width={72} height={26} rx={13} fill={theme.accent} />
		<text x={284} y={226} textAnchor="middle" fontFamily={fontInter} fontWeight={800} fontSize={15} fill={colors.ink}>
			+2.4%
		</text>
		{['Send', 'Receive', 'Convert'].map((label, i) => (
			<g key={label}>
				<circle cx={70 + i * 106} cy={290} r={28} fill={theme.accent} stroke={colors.outline} strokeWidth={LINE} />
				<path d={i === 0 ? 'M -9 6 L 9 -6 M 0 -6 L 9 -6 L 9 3' : i === 1 ? 'M 9 -6 L -9 6 M 0 6 L -9 6 L -9 -3' : 'M -10 -3 L 10 -3 M 5 -8 L 10 -3 M 10 4 L -10 4 M -5 9 L -10 4'} transform={`translate(${70 + i * 106} 290)`} stroke={colors.outline} strokeWidth={3.5} strokeLinecap="round" fill="none" />
				<text x={70 + i * 106} y={342} textAnchor="middle" fontFamily={fontInter} fontWeight={700} fontSize={15} fill={colors.ink}>
					{label}
				</text>
			</g>
		))}
		{ASSET_ROWS.map((r, i) => {
			const y = ROW.top + i * ROW.step;
			return (
				<g key={r.symbol}>
					<rect x={16} y={y} width={320} height={ROW.h} rx={14} fill={colors.white} stroke="#dde5e3" strokeWidth={2} />
					<text x={78} y={y + 33} fontFamily={fontInter} fontWeight={800} fontSize={19} fill={colors.ink}>
						{r.name}
					</text>
					<text x={320} y={y + 33} textAnchor="end" fontFamily={fontInter} fontWeight={600} fontSize={17} fill="#55615f">
						{r.amount} {r.symbol}
					</text>
				</g>
			);
		})}
	</g>
);

/** Real Estable coin icons laid over the asset rows (HTML, so they reuse CoinIcon's Img loading). */
export const WalletCoinIcons: React.FC<{screenX: number; screenY: number}> = ({screenX, screenY}) => (
	<>
		{assetIconCenters().map((c, i) => (
			<CoinIcon
				key={ASSET_ROWS[i].symbol}
				symbol={ASSET_ROWS[i].symbol}
				size={ROW.iconSize}
				style={{position: 'absolute', left: screenX + c.x - ROW.iconSize / 2, top: screenY + c.y - ROW.iconSize / 2}}
			/>
		))}
	</>
);
