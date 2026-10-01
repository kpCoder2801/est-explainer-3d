import React from 'react';
import {MascotId} from '../../mascots/mascot';
import {MascotPose} from '../../mascots/shared/mascot-motion';
import {MgArse} from './mg-arse';
import {MgEstable} from './mg-estable';
import {MgNandu} from './mg-nandu';

/** Renders an MG mascot by id. `morph` is logo-morph for Estable/ARSe and pixel-assembly for Nandu. */
export const MgMascot: React.FC<{id: MascotId; pose: MascotPose; height: number; morph?: number}> = ({id, pose, height, morph}) => {
	if (id === 'estable') return <MgEstable pose={pose} height={height} logo={morph} />;
	if (id === 'arse') return <MgArse pose={pose} height={height} logo={morph} />;
	return <MgNandu pose={pose} height={height} assemble={morph ?? 1} />;
};

/** Places an MG mascot by its ground point (x, groundY) in 1920×1080 space. */
export const MgActor: React.FC<{id: MascotId; pose: MascotPose; x: number; groundY: number; height: number; scale?: number; opacity?: number; morph?: number}> = ({
	id,
	pose,
	x,
	groundY,
	height,
	scale = 1,
	opacity = 1,
	morph,
}) => (
	<div style={{position: 'absolute', left: x, top: groundY, opacity, transform: `translate(-50%, -${id === 'nandu' ? 97 : 94}%) scale(${scale})`, transformOrigin: '50% 100%'}}>
		<MgMascot id={id} pose={pose} height={height} morph={morph} />
	</div>
);
