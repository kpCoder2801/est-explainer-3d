import React from 'react';
import {Composition, Folder} from 'remotion';
import {VIDEO} from './brand/brand-tokens';
import {MascotActionSheet} from './compositions/mascot-action-sheet';
import {MascotCastLineup} from './compositions/mascot-cast-lineup';
import {EstableExplainer, explainerFrames} from './compositions/estable-explainer';
import {BOARD, boardHeight, StoryboardBoard} from './compositions/storyboard-board';
import {sceneFrames, SCENES} from './scenes/scene-registry';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="EstableExplainer" component={EstableExplainer} durationInFrames={explainerFrames()} {...VIDEO} />
		<Composition id="StoryboardBoard" component={StoryboardBoard} durationInFrames={1} fps={VIDEO.fps} width={BOARD.width} height={boardHeight()} />
		<Composition id="MascotCastLineup" component={MascotCastLineup} durationInFrames={VIDEO.fps * 6} {...VIDEO} />
		<Composition id="MascotActionSheet" component={MascotActionSheet} durationInFrames={VIDEO.fps * 6} {...VIDEO} />
		<Folder name="Scenes">
			{SCENES.map(({id, Scene}) => (
				<Composition key={id} id={id} component={Scene} durationInFrames={sceneFrames(id)} {...VIDEO} />
			))}
		</Folder>
	</>
);
