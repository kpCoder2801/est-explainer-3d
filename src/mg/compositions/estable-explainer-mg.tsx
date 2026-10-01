import {linearTiming, TransitionSeries} from '@remotion/transitions';
import type {TransitionPresentation} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BackgroundMusic} from '../../audio/background-music';
import {Sfx} from '../../audio/sound-effects';
import {VIDEO} from '../../brand/brand-tokens';
import {sceneFrames} from '../../scenes/scene-registry';
import {sceneById} from '../../scenes/scene-frame';
import {timeScene} from '../../storyboard/scene-timeline';
import {MG_SCENES} from '../scenes/mg-scene-registry';
import {barWipe, circleIris, triangleIris} from '../kit/shape-transitions';

const T = 16; // transition length in frames
/** Shape language between scenes: triangle = Estable, circle = coins/ARSe, bars = energy. */
const TRANSITIONS: Array<() => TransitionPresentation<Record<string, never>>> = [
	triangleIris, // 1→2
	barWipe, // 2→3
	circleIris, // 3→4
	barWipe, // 4→5
	triangleIris, // 5→6
	circleIris, // 6→7
	barWipe, // 7→8
	triangleIris, // 8→9
	circleIris, // 9→10
];

/** Start frame of each scene in the cut (transitions overlap neighbours by T frames). */
const sceneStarts = () => {
	let f = 0;
	return MG_SCENES.map(({id}, i) => {
		const start = f;
		f += sceneFrames(id) - (i < MG_SCENES.length - 1 ? T : 0);
		return start;
	});
};

export const mgExplainerFrames = () => MG_SCENES.reduce((sum, {id}) => sum + sceneFrames(id), 0) - T * (MG_SCENES.length - 1);

const speechIntervals = () => {
	const starts = sceneStarts();
	return MG_SCENES.flatMap(({id}, i) =>
		timeScene(sceneById(id)).lines.map((l) => [starts[i] / VIDEO.fps + l.start, starts[i] / VIDEO.fps + l.end] as [number, number]),
	);
};

/** The motion-graphics cut: same script and voices, MG scenes joined by shape transitions. */
export const EstableExplainerMG: React.FC = () => {
	const starts = sceneStarts();
	return (
		<AbsoluteFill>
			<TransitionSeries>
				{MG_SCENES.flatMap(({id, Scene}, i) => [
					<TransitionSeries.Sequence key={id} durationInFrames={sceneFrames(id)} premountFor={15}>
						<Scene />
					</TransitionSeries.Sequence>,
					...(i < MG_SCENES.length - 1 ? [<TransitionSeries.Transition key={`${id}-t`} presentation={TRANSITIONS[i]()} timing={linearTiming({durationInFrames: T})} />] : []),
				])}
			</TransitionSeries>
			{starts.slice(1).map((f) => (
				<Sfx key={f} name="mg-transition" at={f / VIDEO.fps - 0.12} volume={0.8} />
			))}
			<BackgroundMusic file="music/estable-explainer-mg-bed.mp3" speech={speechIntervals()} durationInFrames={mgExplainerFrames()} />
		</AbsoluteFill>
	);
};
