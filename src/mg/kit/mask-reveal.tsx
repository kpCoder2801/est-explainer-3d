import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {DUR, enter, exit} from './mg-motion';

/**
 * Signature entrance: content slides up from behind a mask edge (and back down on exit).
 * Inline-block so it can wrap single words in kinetic type.
 */
export const MaskReveal: React.FC<{
	at: number;
	exitAt?: number;
	dur?: number;
	from?: 'bottom' | 'top' | 'left';
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({at, exitAt, dur = DUR.std, from = 'bottom', children, style}) => {
	const t = useCurrentFrame() / useVideoConfig().fps;
	const p = enter(t, at, dur);
	const x = exit(t, exitAt);
	// 135% (not 100%) so the wrapper's padding can't leave glyph slivers peeking past the mask.
	const offset = (1 - p) * 135 + (1 - x) * -135;
	const transform = from === 'left' ? `translateX(${-offset}%)` : `translateY(${from === 'top' ? -offset : offset}%)`;
	return (
		<span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', padding: '0.06em 0.04em', ...style}}>
			<span style={{display: 'inline-block', transform}}>{children}</span>
		</span>
	);
};
