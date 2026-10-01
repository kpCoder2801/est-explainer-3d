import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {BackgroundMusic} from '../audio/background-music';
import {VIDEO} from '../brand/brand-tokens';
import {sceneFrames, SCENES} from '../scenes/scene-registry';
import {sceneById} from '../scenes/scene-frame';
import {timeScene} from '../storyboard/scene-timeline';

export const explainerFrames = () => SCENES.reduce((sum, {id}) => sum + sceneFrames(id), 0);

/** Speech intervals (seconds) across the whole cut, for music ducking. */
const speechIntervals = () => {
	let offset = 0;
	return SCENES.flatMap(({id}) => {
		const spans = timeScene(sceneById(id)).lines.map((l) => [offset + l.start, offset + l.end] as [number, number]);
		offset += sceneFrames(id) / VIDEO.fps;
		return spans;
	});
};

/** The full explainer: all scenes back to back with voice, effects and the ducked music bed. */
export const EstableExplainer: React.FC = () => (
	<AbsoluteFill>
		<Series>
			{SCENES.map(({id, Scene}) => (
				<Series.Sequence key={id} durationInFrames={sceneFrames(id)} premountFor={15}>
					<Scene />
				</Series.Sequence>
			))}
		</Series>
		<BackgroundMusic speech={speechIntervals()} durationInFrames={explainerFrames()} />
	</AbsoluteFill>
);
