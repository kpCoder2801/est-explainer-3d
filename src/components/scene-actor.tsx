import React from 'react';
import {Mascot, MascotId} from '../mascots/mascot';
import {MascotPose} from '../mascots/shared/mascot-motion';

/** Places a mascot by the point between its feet (x, groundY) in 1920×1080 space. */
export const SceneActor: React.FC<{
	id: MascotId;
	pose: MascotPose;
	x: number;
	groundY: number;
	height: number;
	scale?: number;
	opacity?: number;
}> = ({id, pose, x, groundY, height, scale = 1, opacity = 1}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: groundY,
			opacity,
			transform: `translate(-50%, -100%) scale(${scale})`,
			transformOrigin: '50% 100%',
		}}
	>
		<Mascot id={id} pose={pose} height={height} />
	</div>
);
