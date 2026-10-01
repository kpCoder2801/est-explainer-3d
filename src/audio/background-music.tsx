import {Audio} from '@remotion/media';
import React from 'react';
import {interpolate, staticFile, useVideoConfig} from 'remotion';

const MUSIC_FILE = 'music/estable-explainer-bed.mp3';
const FULL = 0.3; // music level between lines
const DUCKED = 0.11; // music level under voice
const DUCK_RAMP = 0.25; // seconds to dip/recover around a line

/**
 * Background bed for a whole cut: fades in/out at the edges and ducks under every
 * speech interval (seconds, in the cut's timeline) so the voices stay clear.
 */
export const BackgroundMusic: React.FC<{speech: Array<[number, number]>; durationInFrames: number}> = ({speech, durationInFrames}) => {
	const {fps} = useVideoConfig();
	const end = durationInFrames / fps;
	return (
		<Audio
			src={staticFile(MUSIC_FILE)}
			volume={(f) => {
				const t = f / fps;
				const edge = Math.min(
					interpolate(t, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}),
					interpolate(t, [end - 2, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
				);
				const gap = Math.min(...speech.map(([a, b]) => (t < a ? a - t : t > b ? t - b : 0)), Infinity);
				const level = interpolate(gap, [0, DUCK_RAMP], [DUCKED, FULL], {extrapolateRight: 'clamp'});
				return level * edge;
			}}
		/>
	);
};
