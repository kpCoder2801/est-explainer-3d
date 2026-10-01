import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandNetworkBackground} from '../components/brand-network-background';
import {SceneCaptions} from '../components/scene-captions';
import {timeScene} from '../storyboard/scene-timeline';
import {STORYBOARD, StoryboardScene} from '../storyboard/storyboard-script';

export const sceneById = (id: string): StoryboardScene => {
	const s = STORYBOARD.find((x) => x.id === id);
	if (!s) throw new Error(`Unknown scene ${id}`);
	return s;
};

/** Current scene time in seconds. */
export const useSceneTime = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return frame / fps;
};

/** Shared scene chrome: hero backdrop, content, voice-over audio and speaker captions on top. */
export const SceneFrame: React.FC<{
	sceneId: string;
	children: React.ReactNode;
	glowX?: number;
	glowY?: number;
	backgroundReveal?: number;
}> = ({sceneId, children, glowX, glowY, backgroundReveal}) => {
	const {lines} = timeScene(sceneById(sceneId));
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill>
			{lines.map(
				(l) =>
					l.vo && (
						<Sequence key={l.vo.file} from={Math.round(l.start * fps)} premountFor={fps}>
							<Audio src={staticFile(l.vo.file)} />
						</Sequence>
					),
			)}
			<BrandNetworkBackground seed={sceneId} glowX={glowX} glowY={glowY} reveal={backgroundReveal} />
			{children}
			<SceneCaptions lines={lines} />
		</AbsoluteFill>
	);
};
