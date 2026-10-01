import React from 'react';
import {Composition, Folder} from 'remotion';
import {VIDEO} from './brand/brand-tokens';
import {MascotActionSheet} from './compositions/mascot-action-sheet';
import {EstableExplainerMG, mgExplainerFrames} from './mg/compositions/estable-explainer-mg';
import {MgMascotSheet} from './mg/compositions/mg-mascot-sheet';
import {MG_SCENES} from './mg/scenes/mg-scene-registry';
import {EstableExplainer3D, explainer3dFrames} from './three/compositions/estable-explainer-3d';
import {ToyMascotSheet} from './three/compositions/toy-mascot-sheet';
import {TOY_SCENES} from './three/scenes/toy-scene-registry';
import {MascotCastLineup} from './compositions/mascot-cast-lineup';
import {EstableExplainer, explainerFrames} from './compositions/estable-explainer';
import {BOARD, boardHeight, StoryboardBoard} from './compositions/storyboard-board';
import {sceneFrames, SCENES} from './scenes/scene-registry';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="EstableExplainer" component={EstableExplainer} durationInFrames={explainerFrames()} {...VIDEO} />
		<Composition id="StoryboardBoard" component={StoryboardBoard} durationInFrames={1} fps={VIDEO.fps} width={BOARD.width} height={boardHeight()} />
		<Composition id="EstableExplainerMG" component={EstableExplainerMG} durationInFrames={mgExplainerFrames()} {...VIDEO} />
		<Composition id="MgMascotSheet" component={MgMascotSheet} durationInFrames={VIDEO.fps * 8} {...VIDEO} />
		<Composition id="EstableExplainer3D" component={EstableExplainer3D} durationInFrames={explainer3dFrames()} {...VIDEO} />
		<Composition id="ToyMascotSheet" component={ToyMascotSheet} durationInFrames={VIDEO.fps * 6} {...VIDEO} />
		<Composition id="MascotCastLineup" component={MascotCastLineup} durationInFrames={VIDEO.fps * 6} {...VIDEO} />
		<Composition id="MascotActionSheet" component={MascotActionSheet} durationInFrames={VIDEO.fps * 6} {...VIDEO} />
		<Folder name="Scenes">
			{SCENES.map(({id, Scene}) => (
				<Composition key={id} id={id} component={Scene} durationInFrames={sceneFrames(id)} {...VIDEO} />
			))}
		</Folder>
		<Folder name="MgScenes">
			{MG_SCENES.map(({id, Scene}) => (
				<Composition key={id} id={`mg-${id}`} component={Scene} durationInFrames={sceneFrames(id)} {...VIDEO} />
			))}
		</Folder>
		<Folder name="ToyScenes">
			{TOY_SCENES.map(({id, Scene}) => (
				<Composition key={id} id={`toy-${id}`} component={Scene} durationInFrames={sceneFrames(id)} {...VIDEO} />
			))}
		</Folder>
	</>
);
