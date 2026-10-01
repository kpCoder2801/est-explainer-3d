import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SceneVoiceOver} from '../../audio/scene-voice-over';
import {colors, VIDEO} from '../../brand/brand-tokens';
import {SceneCaptions} from '../../components/scene-captions';
import {sceneById, useSceneTime} from '../../scenes/scene-frame';
import {timeScene} from '../../storyboard/scene-timeline';
import {useToyAssetsReady} from './toy-canvas-textures';
import {StudioEnvironment, ToyStudioLights} from './toy-studio';
import {CameraShot, SceneCamera, ToyStage} from './toy-stage';

/**
 * 3D scene chrome: recorded voice, the WebGL set (camera, studio lights, floor, glow,
 * node network) holding the scene's 3D children, an optional HTML overlay for flat
 * graphics and audio cues (Remotion elements cannot live inside the WebGL tree),
 * and the shared speaker captions on top.
 */
export const ToySceneFrame: React.FC<{
	sceneId: string;
	camera: CameraShot;
	children: React.ReactNode;
	overlay?: React.ReactNode;
	glow?: string;
	glowX?: number;
	reveal?: number;
	rim?: string;
}> = ({sceneId, camera, children, overlay, glow, glowX, reveal, rim}) => {
	const t = useSceneTime();
	const ready = useToyAssetsReady();
	const {lines} = timeScene(sceneById(sceneId));
	return (
		<AbsoluteFill style={{background: colors.bg}}>
			<SceneVoiceOver lines={lines} />
			{ready && (
				<ThreeCanvas width={VIDEO.width} height={VIDEO.height} shadows="percentage" gl={{antialias: true}} camera={{fov: camera.fov ?? 30, near: 0.1, far: 200}}>
					<SceneCamera {...camera} />
					<StudioEnvironment />
					<ToyStudioLights shadows rim={rim} />
					<ToyStage time={t} glow={glow} glowX={glowX} seed={sceneId} reveal={reveal} />
					{children}
				</ThreeCanvas>
			)}
			{overlay}
			<SceneCaptions lines={lines} />
		</AbsoluteFill>
	);
};
