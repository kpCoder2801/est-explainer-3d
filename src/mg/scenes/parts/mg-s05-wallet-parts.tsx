import React from 'react';
import {colors, fontInter} from '../../../brand/brand-tokens';
import {CoinSymbol} from '../../../components/coin-icon';
import {FlatCoin} from './mg-s04-pay-parts';

/** A white-label theme: invented brands only (no real third-party marks). */
export type WalletTheme = {name: string; primary: string; secondary: string; bg: string; mark: 'slot' | 'star' | 'sun' | 'diamond'};

export const WALLET_THEMES: WalletTheme[] = [
	{name: 'YOUR LOGO', primary: colors.teal, secondary: colors.tealBright, bg: '#0f1b1a', mark: 'slot'},
	{name: 'NOVA', primary: '#6c4cf5', secondary: '#a78bfa', bg: '#120d24', mark: 'star'},
	{name: 'SOLA', primary: '#ff7a1a', secondary: '#ffb35c', bg: '#1f1208', mark: 'sun'},
	{name: 'KORA', primary: '#ff3d7f', secondary: '#ff8fb3', bg: '#200a14', mark: 'diamond'},
];

/** Simple geometric brand mark for the invented brands. */
const BrandMark: React.FC<{theme: WalletTheme; size: number}> = ({theme, size}) => {
	const s = size;
	if (theme.mark === 'slot') {
		return <div style={{width: s, height: s, borderRadius: s * 0.28, border: `3px dashed ${theme.secondary}`}} />;
	}
	return (
		<svg width={s} height={s} viewBox="0 0 40 40">
			<rect width={40} height={40} rx={11} fill={theme.primary} />
			{theme.mark === 'star' && <path d="M20 8 L23.5 16.5 L32 20 L23.5 23.5 L20 32 L16.5 23.5 L8 20 L16.5 16.5 Z" fill="#fff" />}
			{theme.mark === 'sun' && <circle cx={20} cy={20} r={8} fill="#fff" />}
			{theme.mark === 'sun' && <circle cx={20} cy={20} r={13} fill="none" stroke="#fff" strokeWidth={2.5} strokeDasharray="3 4" />}
			{theme.mark === 'diamond' && <path d="M20 7 L32 20 L20 33 L8 20 Z" fill="#fff" />}
		</svg>
	);
};

const ROWS: Array<{symbol: CoinSymbol; name: string; amount: string; value: string}> = [
	{symbol: 'BTC', name: 'Bitcoin', amount: '0.0821 BTC', value: '$5,120'},
	{symbol: 'ETH', name: 'Ethereum', amount: '1.420 ETH', value: '$4,310'},
	{symbol: 'TRX', name: 'Tron', amount: '3,250 TRX', value: '$1,890'},
	{symbol: 'POL', name: 'Polygon', amount: '980.0 POL', value: '$1,160'},
];

/** Clean wallet home screen (360×720) drawn in the given theme. `rows` 0…1 staggers rows in. */
export const WalletScreen: React.FC<{theme: WalletTheme; rows?: number[]}> = ({theme, rows = [1, 1, 1, 1, 1, 1]}) => (
	<div style={{position: 'absolute', inset: 0, background: theme.bg, fontFamily: fontInter, color: colors.white, padding: '54px 26px 0'}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: rows[0]}}>
			<BrandMark theme={theme} size={40} />
			<div style={{fontSize: 20, fontWeight: 800, letterSpacing: theme.mark === 'slot' ? 1 : 3, color: theme.mark === 'slot' ? theme.secondary : colors.white, opacity: theme.mark === 'slot' ? 0.8 : 1}}>{theme.name}</div>
			<div style={{marginLeft: 'auto', width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.1)'}} />
		</div>
		<div
			style={{
				marginTop: 26,
				borderRadius: 26,
				padding: '22px 22px',
				background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
				opacity: rows[1],
				transform: `translateY(${(1 - rows[1]) * 24}px)`,
				boxShadow: `0 20px 40px ${theme.primary}55`,
			}}
		>
			<div style={{fontSize: 14, fontWeight: 700, opacity: 0.85, letterSpacing: 1}}>Total balance</div>
			<div style={{fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 4}}>$12,480.50</div>
			<div style={{display: 'inline-block', marginTop: 8, fontSize: 13, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.22)'}}>+2.4% today</div>
		</div>
		<div style={{display: 'flex', justifyContent: 'space-around', marginTop: 22, opacity: rows[1]}}>
			{['Send', 'Receive', 'Convert'].map((a) => (
				<div key={a} style={{textAlign: 'center', fontSize: 13, fontWeight: 700, opacity: 0.85}}>
					<div style={{width: 52, height: 52, borderRadius: 26, background: `${theme.primary}33`, border: `2px solid ${theme.secondary}`, margin: '0 auto 6px'}} />
					{a}
				</div>
			))}
		</div>
		<div style={{marginTop: 22}}>
			{ROWS.map((r, i) => (
				<div
					key={r.symbol}
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						padding: '13px 4px',
						borderBottom: '1px solid rgba(255,255,255,0.08)',
						opacity: rows[i + 2] ?? 1,
						transform: `translateX(${(1 - (rows[i + 2] ?? 1)) * 40}px)`,
					}}
				>
					<FlatCoin symbol={r.symbol} size={38} />
					<div style={{flex: 1}}>
						<div style={{fontSize: 17, fontWeight: 800}}>{r.name}</div>
						<div style={{fontSize: 13, opacity: 0.6, fontWeight: 600}}>{r.amount}</div>
					</div>
					<div style={{fontSize: 17, fontWeight: 800}}>{r.value}</div>
				</div>
			))}
		</div>
	</div>
);
