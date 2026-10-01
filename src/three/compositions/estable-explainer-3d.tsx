import {linearTiming, TransitionSeries} from '@remotion/transitions';
import type {TransitionPresentation} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BackgroundMusic} from '../../audio/background-music';
import {Sfx} from '../../audio/sound-effects';
import {VIDEO} from '../../brand/brand-tokens';
import {circleIris, triangleIris} from '../../mg/kit/shape-transitions';
import {sceneFrames} from '../../scenes/scene-registry';
import {sceneById} from '../../scenes/scene-frame';
import {timeScene} from '../../storyboard/scene-timeline';
import {TOY_SCENES} from '../scenes/toy-scene-registry';

const T = 16; // transition length in frames
/** Brand-shape irises between scenes: triangle = Estable, circle = coins/ARSe/Nandu. */
const TRANSITIONS: Array<() => TransitionPresentation<Record<string, never>>> = [
	triangleIris, // 1→2
	circleIris, // 2→3
	triangleIris, // 3→4
	circleIris, // 4→5
	triangleIris, // 5→6
	circleIris, // 6→7
	circleIris, // 7→8
	triangleIris, // 8→9
	triangleIris, // 9→10
];

/** Start frame of each scene in the cut (transitions overlap neighbours by T frames). */
const sceneStarts = () => {
	let f = 0;
	return TOY_SCENES.map(({id}, i) => {
		const start = f;
		f += sceneFrames(id) - (i < TOY_SCENES.length - 1 ? T : 0);
		return start;
	});
};

export const explainer3dFrames = () => TOY_SCENES.reduce((sum, {id}) => sum + sceneFrames(id), 0) - T * (TOY_SCENES.length - 1);

const speechIntervals = () => {
	const starts = sceneStarts();
	return TOY_SCENES.flatMap(({id}, i) =>
		timeScene(sceneById(id)).lines.map((l) => [starts[i] / VIDEO.fps + l.start, starts[i] / VIDEO.fps + l.end] as [number, number]),
	);
};

/** The 3D cut: same script, voices and music bed as v1, toy scenes joined by brand-shape irises. */
export const EstableExplainer3D: React.FC = () => {
	const starts = sceneStarts();
	return (
		<AbsoluteFill>
			<TransitionSeries>
				{TOY_SCENES.flatMap(({id, Scene}, i) => [
					<TransitionSeries.Sequence key={id} durationInFrames={sceneFrames(id)} premountFor={15}>
						<Scene />
					</TransitionSeries.Sequence>,
					...(i < TOY_SCENES.length - 1 ? [<TransitionSeries.Transition key={`${id}-t`} presentation={TRANSITIONS[i]()} timing={linearTiming({durationInFrames: T})} />] : []),
				])}
			</TransitionSeries>
			{starts.slice(1).map((f) => (
				<Sfx key={f} name="mg-whoosh" at={f / VIDEO.fps - 0.12} volume={0.6} />
			))}
			<BackgroundMusic speech={speechIntervals()} durationInFrames={explainer3dFrames()} />
		</AbsoluteFill>
	);
};
