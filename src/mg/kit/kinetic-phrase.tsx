import React from 'react';
import {colors, fontInter} from '../../brand/brand-tokens';
import {TimedLine, wordStart} from '../../storyboard/scene-timeline';
import {MaskReveal} from './mask-reveal';

/**
 * Kinetic typography locked to the voice: renders words [from, to] of a line, each
 * revealing the moment it is spoken (from the TTS alignment). Words listed in
 * `accent` (case-insensitive, punctuation ignored) take the accent colour.
 */
export const KineticPhrase: React.FC<{
	line: TimedLine;
	from: number;
	to: number;
	x: number;
	y: number;
	size: number;
	width?: number;
	align?: 'left' | 'center' | 'right';
	color?: string;
	accent?: string[];
	accentColor?: string;
	weight?: number;
	exitAt?: number;
	lead?: number;
	uppercase?: boolean;
}> = ({line, from, to, x, y, size, width = 1600, align = 'center', color = colors.white, accent = [], accentColor = colors.tealBright, weight = 800, exitAt, lead = 0.04, uppercase = false}) => {
	const words = line.text.split(/\s+/);
	const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9.]/g, '');
	const accents = new Set(accent.map(norm));
	const left = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
	return (
		<div
			style={{
				position: 'absolute',
				left,
				top: y,
				width,
				textAlign: align,
				fontFamily: fontInter,
				fontWeight: weight,
				fontSize: size,
				lineHeight: 1.02,
				letterSpacing: '-0.03em',
				color,
				textTransform: uppercase ? 'uppercase' : 'none',
			}}
		>
			{words.slice(from, to + 1).map((w, i) => (
				<React.Fragment key={i}>
					<MaskReveal at={wordStart(line, from + i) - lead} exitAt={exitAt === undefined ? undefined : exitAt + i * 0.02}>
						<span style={{color: accents.has(norm(w)) ? accentColor : undefined}}>{w}</span>
					</MaskReveal>{' '}
				</React.Fragment>
			))}
		</div>
	);
};
