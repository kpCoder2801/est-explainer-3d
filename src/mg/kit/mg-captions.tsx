import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fontInter} from '../../brand/brand-tokens';
import {MASCOT_META} from '../../mascots/mascot';
import {lineProgress, TimedLine} from '../../storyboard/scene-timeline';
import {enter, exit} from './mg-motion';

/**
 * Minimal subtitle for the MG cut: a speaker tick + name above clean text, no box,
 * words brightening as they are spoken. The big kinetic type carries the message.
 */
export const MgCaptions: React.FC<{lines: TimedLine[]}> = ({lines}) => {
	const t = useCurrentFrame() / useVideoConfig().fps;
	const line = lines.find((l) => t >= l.start - 0.15 && t <= l.end + 0.35);
	if (!line) return null;
	const meta = MASCOT_META[line.speaker];
	const words = line.text.split(' ');
	const starts = words.map((_, i) => words.slice(0, i).join(' ').length / line.text.length);
	const progress = lineProgress(line, t);
	const p = enter(t, line.start - 0.15) * exit(t, line.end + 0.2);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 54, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
			<div style={{maxWidth: 1400, fontFamily: fontInter, textAlign: 'center'}}>
				<div style={{display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 18, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: meta.color}}>
					<span style={{width: 26, height: 4, borderRadius: 2, background: meta.color}} />
					{meta.name}
				</div>
				<div style={{fontSize: 30, fontWeight: 600, lineHeight: 1.3, color: colors.white, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>
					{words.map((w, i) => (
						<span key={i} style={{opacity: starts[i] <= progress ? 1 : 0.35}}>
							{w}{' '}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};
