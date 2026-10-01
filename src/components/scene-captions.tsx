import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fontInter} from '../brand/brand-tokens';
import {MASCOT_META} from '../mascots/mascot';
import {lineProgress, TimedLine} from '../storyboard/scene-timeline';

/**
 * Lower-third caption with a speaker chip so viewers always know who is talking.
 * Words light up in reading order (estimated now, alignment-driven after VO).
 */
export const SceneCaptions: React.FC<{lines: TimedLine[]}> = ({lines}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const line = lines.find((l) => t >= l.start - 0.15 && t <= l.end + 0.4);
	if (!line) return null;
	const meta = MASCOT_META[line.speaker];
	const words = line.text.split(' ');
	const enter = interpolate(t, [line.start - 0.15, line.start + 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const exit = interpolate(t, [line.end + 0.15, line.end + 0.4], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const progress = lineProgress(line, t);
	// Character offset where each displayed word starts, so highlighting follows the voice.
	const wordStarts = words.map((_, i) => words.slice(0, i).join(' ').length / line.text.length);
	return (
		<div
			style={{
				position: 'absolute',
				left: '50%',
				bottom: 64,
				transform: `translate(-50%, ${(1 - enter) * 20}px)`,
				opacity: enter * exit,
				display: 'flex',
				alignItems: 'center',
				gap: 18,
				padding: '16px 28px 16px 16px',
				borderRadius: 999,
				background: 'rgba(20,22,22,0.82)',
				border: `1px solid ${meta.color}55`,
				fontFamily: fontInter,
				// left:50% would otherwise shrink-wrap the box to half the frame and wrap lines early.
				width: 'max-content',
				maxWidth: 1500,
			}}
		>
			<div style={{background: meta.color, color: colors.ink, fontWeight: 800, fontSize: 24, padding: '8px 18px', borderRadius: 999, whiteSpace: 'nowrap'}}>{meta.name}</div>
			<div style={{fontSize: 34, fontWeight: 600, lineHeight: 1.25, color: colors.white}}>
				{words.map((w, i) => (
					<span key={i} style={{opacity: wordStarts[i] <= progress ? 1 : 0.35}}>
						{w}{' '}
					</span>
				))}
			</div>
		</div>
	);
};
