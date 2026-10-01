import React from 'react';
import {Img, staticFile} from 'remotion';
import {colors} from '../brand/brand-tokens';

/** Currency logos copied from est-ui-config (src/_shared/assets/images/ccy). USDT is deliberately excluded. */
export type CoinSymbol = 'BTC' | 'ETH' | 'TRX' | 'POL';

export const COIN_NAMES: Record<CoinSymbol, string> = {BTC: 'Bitcoin', ETH: 'Ethereum', TRX: 'Tron', POL: 'Polygon'};

/** Estable's currency logo with the mascots' sticker outline so it sits in the same world. */
export const CoinIcon: React.FC<{symbol: CoinSymbol; size: number; style?: React.CSSProperties}> = ({symbol, size, style}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: '50%',
			boxShadow: `0 0 0 ${Math.max(2, size * 0.06)}px ${colors.outline}`,
			flexShrink: 0,
			...style,
		}}
	>
		<Img src={staticFile(`ccy/${symbol}.svg`)} style={{width: size, height: size, display: 'block'}} />
	</div>
);
