import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SceneVoiceOver} from '../../audio/scene-voice-over';
import {sceneById} from '../../scenes/scene-frame';
import {timeScene} from '../../storyboard/scene-timeline';
import {MgBackground} from './mg-background';
import {MgCaptions} from './mg-captions';

/** Motion-graphics scene chrome: MG backdrop, content, recorded voice and minimal subtitles. */
export const MgSceneFrame: React.FC<{
	sceneId: string;
	children: React.ReactNode;
	accent?: string;
	orbA?: [number, number];
	orbB?: [number, number];
	captions?: boolean;
}> = ({sceneId, children, accent, orbA, orbB, captions = true}) => {
	const {lines} = timeScene(sceneById(sceneId));
	return (
		<AbsoluteFill>
			<SceneVoiceOver lines={lines} />
			<MgBackground accent={accent} orbA={orbA} orbB={orbB} />
			{children}
			{captions && <MgCaptions lines={lines} />}
		</AbsoluteFill>
	);
};
